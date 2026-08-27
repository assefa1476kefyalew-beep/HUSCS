import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from './services/firebase';
import { useClearanceStore } from './services/store';
import { AuthScreen } from './components/auth/AuthScreen';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { CertificateModal } from './components/admin/CertificateModal';
import { ClearanceCertificateDocument } from './components/common/ClearanceCertificateDocument';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { ClearanceWizard } from './components/student/ClearanceWizard';
import { ClearanceTracker } from './components/student/ClearanceTracker';
import { StudentDocuments } from './components/student/StudentDocuments';
import { StudentProfile } from './components/student/StudentProfile';
import { StudentNotifications } from './components/student/StudentNotifications';

// Officer Components
import { OfficerDashboard } from './components/officer/OfficerDashboard';
import { OfficerReports } from './components/officer/OfficerReports';
import { OfficerStudentDirectory } from './components/officer/OfficerStudentDirectory';

// Admin / Registrar Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClearanceManagement } from './components/admin/ClearanceManagement';
import { CertificateRegistry } from './components/admin/CertificateRegistry';
import { DepartmentSetup } from './components/admin/DepartmentSetup';
import { ClearancePeriods } from './components/admin/ClearancePeriods';
import { AuditLogsViewer } from './components/admin/AuditLogsViewer';

import { ClearanceCertificate, ClearanceReasonType, SupportingDocument } from './types';
import { Award, CheckCircle2, AlertCircle, Loader2, GraduationCap } from 'lucide-react';
import { PublicVerificationModal } from './components/common/PublicVerificationModal';

export default function App() {
  const store = useClearanceStore();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('student-dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [activeCertificate, setActiveCertificate] = useState<ClearanceCertificate | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [isWizardMode, setIsWizardMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsAuthChecking(false);
      if (user && user.email) {
        store.switchUserByEmail(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      store.logout();
      setFirebaseUser(null);
      showToast('Signed Out', 'You have been signed out from Hawassa University Portal.');
    } catch (error) {
      console.error('Firebase sign out error:', error);
    }
  };

  // Sync active tab when switching user or role
  useEffect(() => {
    if (store.currentRole === 'STUDENT') {
      setActiveTab('student-dashboard');
    } else if (store.currentRole === 'OFFICER') {
      setActiveTab('officer-dashboard');
    } else {
      setActiveTab('admin-dashboard');
    }
    setIsWizardMode(false);
  }, [store.currentUser?.id, store.currentRole]);

  // Find Student and Request for current user if Student
  const currentStudent = store.currentRole === 'STUDENT'
    ? store.students.find(s => s.id === store.currentUser?.studentId || s.email === store.currentUser?.email) || store.students[0]
    : null;

  const currentStudentRequest = currentStudent
    ? store.clearanceRequests.find(r => r.studentId === currentStudent.id)
    : undefined;

  const currentStudentCert = currentStudent
    ? store.certificates.find(c => (currentStudentRequest && c.clearanceRequestId === currentStudentRequest.id) || c.studentId === currentStudent.id || c.studentStudentId === currentStudent.studentId)
    : undefined;

  // Find Department for current user if Officer
  const currentOfficerDept = store.currentRole === 'OFFICER'
    ? store.departments.find(d => d.id === store.currentUser?.departmentId || d.code === store.currentUser?.departmentId) || store.departments[0]
    : null;

  // Count pending for badges
  const pendingOfficerCount = currentOfficerDept
    ? store.clearanceRequests.filter(r => {
        const item = r.items.find(i => i.departmentId === currentOfficerDept.id || i.departmentCode === currentOfficerDept.code);
        return item && (item.status === 'PENDING' || item.status === 'UNDER_REVIEW' || item.status === 'NEEDS_DOCUMENT');
      }).length
    : 0;

  const pendingAdminCount = store.clearanceRequests.filter(r => r.overallStatus === 'APPROVED').length;
  const unreadNotificationsCount = store.notifications.filter(n => !n.read).length;

  // Actions
  const handleStartClearance = () => {
    setIsWizardMode(true);
    setActiveTab('student-clearance');
  };

  const handleSubmitClearanceWizard = (
    studentId: string,
    periodId: string,
    reason: ClearanceReasonType,
    note?: string
  ) => {
    const newReq = store.createClearanceRequest(studentId, periodId, reason, note);
    setIsWizardMode(false);
    setActiveTab('student-clearance');
    showToast('Clearance Application Dispatched', 'Your request has been delivered to all 8 departmental queues.');
  };

  const handleApproveItem = (requestId: string, itemId: string, comment?: string) => {
    store.approveClearanceItem(requestId, itemId, comment);
    showToast('Clearance Granted', 'The department clearance requirement has been approved.', 'success');
  };

  const handleRejectItem = (
    requestId: string,
    itemId: string,
    reason: string,
    remedy: string,
    balance?: number,
    items?: string[]
  ) => {
    store.rejectClearanceItem(requestId, itemId, reason, remedy, balance, items);
    showToast('Obligation Flagged', 'Rejection reason and remedy instructions sent to candidate.', 'error');
  };

  const handleRequestDocItem = (requestId: string, itemId: string, note: string) => {
    store.requestDocumentForItem(requestId, itemId, note);
    showToast('Document Requested', 'Student was notified to upload the required file.', 'info');
  };

  const handleUploadDoc = (
    requestId: string,
    itemId: string,
    title: string,
    docType: SupportingDocument['documentType'],
    fileName: string,
    fileSize: number
  ) => {
    store.uploadSupportingDocument(requestId, itemId, title, docType, fileName, fileSize);
    showToast('Document Attached', 'Document uploaded and sent to officer for review.', 'success');
  };

  const handleIssueCertificate = (requestId: string) => {
    const cert = store.issueClearanceCertificate(requestId);
    if (cert) {
      setActiveCertificate(cert);
      showToast('Certificate Issued', `Official Clearance Certificate #${cert.certificateNumber} generated.`, 'success');
    }
  };

  // 1. Loading Authentication State Screen
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 p-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-900/80 border border-blue-500/30 text-amber-400 flex items-center justify-center shadow-2xl mb-4 animate-pulse">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Screen (Sign In / Sign Up)
  if (!firebaseUser) {
    return (
      <AuthScreen
        systemSettings={store.systemSettings}
        onAuthSuccess={() => {
          showToast('Authenticated', 'Signed in successfully to Hawassa University Clearance Portal.');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-3 fade-in duration-200">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 max-w-sm ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : toastMessage.type === 'info'
              ? 'bg-blue-900 text-white border-blue-800'
              : 'bg-emerald-900 text-white border-emerald-800'
          }`}>
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">{toastMessage.title}</p>
              <p className="text-[11px] text-slate-200 mt-0.5">{toastMessage.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Application Header with Theme & User Profile */}
      <Header
        currentUser={store.currentUser}
        allUsers={store.allUsers}
        notifications={store.notifications}
        systemSettings={store.systemSettings}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setMobileSidebarOpen(!mobileSidebarOpen);
          } else {
            setIsSidebarCollapsed(!isSidebarCollapsed);
          }
        }}
        onOpenPublicVerification={() => setShowVerificationModal(true)}
        onMarkNotificationRead={(id) => store.markNotificationRead(id)}
        onMarkAllNotificationsRead={() => store.markAllNotificationsRead()}
        onLogout={handleLogout}
        onResetData={() => {
          store.resetDatabase();
          showToast('System Reset', 'Restored default Hawassa University data and clearance states.');
        }}
      />

      <div className="flex-1 flex">
        
        {/* Sidebar Navigation */}
        <Sidebar
          currentRole={store.currentRole}
          currentUser={store.currentUser}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== 'student-clearance') setIsWizardMode(false);
          }}
          isOpen={mobileSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onClose={() => setMobileSidebarOpen(false)}
          onToggle={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              setMobileSidebarOpen(!mobileSidebarOpen);
            } else {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }}
          pendingCount={store.currentRole === 'OFFICER' ? pendingOfficerCount : pendingAdminCount}
          unreadNotifsCount={unreadNotificationsCount}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'} p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto`}>
          
          {/* ================= STUDENT WORKSPACE ================= */}
          {store.currentRole === 'STUDENT' && currentStudent && (
            <>
              {activeTab === 'student-dashboard' && (
                <StudentDashboard
                  student={currentStudent}
                  activeRequest={currentStudentRequest}
                  certificate={currentStudentCert}
                  activePeriods={store.periods}
                  notifications={store.notifications}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    if (tab !== 'student-clearance') setIsWizardMode(false);
                  }}
                  onStartClearance={handleStartClearance}
                  onOpenCertificate={() => currentStudentCert && setActiveCertificate(currentStudentCert)}
                />
              )}

              {activeTab === 'student-clearance' && (
                isWizardMode || !currentStudentRequest ? (
                  <ClearanceWizard
                    student={currentStudent}
                    activePeriods={store.periods}
                    departments={store.departments}
                    requirements={store.requirements}
                    onSubmitClearance={handleSubmitClearanceWizard}
                    onCancel={() => {
                      setIsWizardMode(false);
                      setActiveTab('student-dashboard');
                    }}
                  />
                ) : (
                  <ClearanceTracker
                    request={currentStudentRequest}
                    departments={store.departments}
                    requirements={store.requirements}
                    documents={store.documents}
                    onUploadDocument={handleUploadDoc}
                    onNavigateToCertificate={() => currentStudentCert && setActiveCertificate(currentStudentCert)}
                  />
                )
              )}

              {activeTab === 'student-documents' && (
                <StudentDocuments
                  documents={store.documents}
                  activeRequest={currentStudentRequest}
                  onUploadDocument={handleUploadDoc}
                />
              )}

              {activeTab === 'student-certificate' && (
                currentStudentCert ? (
                  <div className="space-y-6">
                    <ClearanceCertificateDocument
                      certificate={currentStudentCert}
                      request={currentStudentRequest}
                      student={currentStudent}
                      departments={store.departments}
                      showControls={true}
                    />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60 shadow-sm">
                      <Award className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                        Clearance Certificate In Progress
                      </h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                        Clearance certificates are officially generated and cryptographically stamped by the University Registrar once all 8 mandatory departments have approved your clearance.
                      </p>
                    </div>
                    {currentStudentRequest && (
                      <div className="pt-2">
                        <button
                          onClick={() => setActiveTab('student-clearance')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all"
                        >
                          Check Clearance Progress ({currentStudentRequest.progressPercentage}% Completed)
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}

              {activeTab === 'student-notifications' && (
                <StudentNotifications
                  notifications={store.notifications}
                  onMarkAsRead={(id) => store.markNotificationRead(id)}
                  onMarkAllAsRead={() => store.markAllNotificationsRead()}
                />
              )}

              {activeTab === 'student-profile' && (
                <StudentProfile
                  student={currentStudent}
                  user={store.currentUser!}
                  onUpdateProfile={(id, updates) => store.updateStudentProfile(id, updates)}
                />
              )}
            </>
          )}

          {/* ================= OFFICER WORKSPACE ================= */}
          {store.currentRole === 'OFFICER' && currentOfficerDept && (
            <>
              {(activeTab === 'officer-dashboard' || activeTab === 'officer-queue') && (
                <OfficerDashboard
                  currentUser={store.currentUser!}
                  department={currentOfficerDept}
                  clearanceRequests={store.clearanceRequests}
                  students={store.students}
                  requirements={store.requirements}
                  documents={store.documents}
                  onApproveItem={handleApproveItem}
                  onRejectItem={handleRejectItem}
                  onRequestDocItem={handleRequestDocItem}
                />
              )}

              {activeTab === 'officer-students' && (
                <OfficerStudentDirectory
                  students={store.students}
                  clearanceRequests={store.clearanceRequests}
                />
              )}

              {activeTab === 'officer-reports' && (
                <OfficerReports
                  department={currentOfficerDept}
                  requests={store.clearanceRequests}
                />
              )}

              {activeTab === 'officer-notifications' && (
                <StudentNotifications
                  notifications={store.notifications}
                  onMarkAsRead={(id) => store.markNotificationRead(id)}
                  onMarkAllAsRead={() => store.markAllNotificationsRead()}
                />
              )}

              {activeTab === 'officer-profile' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl mx-auto space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Officer Profile</h2>
                  <div className="space-y-2 text-xs">
                    <p><strong>Name:</strong> {store.currentUser?.fullName}</p>
                    <p><strong>Username:</strong> {store.currentUser?.username}</p>
                    <p><strong>Email:</strong> {store.currentUser?.email}</p>
                    <p><strong>Assigned Unit:</strong> {currentOfficerDept.name} ({currentOfficerDept.code})</p>
                    <p><strong>Role:</strong> Department Clearance Officer</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ================= REGISTRAR / ADMIN WORKSPACE ================= */}
          {(store.currentRole === 'REGISTRAR' || store.currentRole === 'ADMIN' || store.currentRole === 'SUPER_ADMIN') && (
            <>
              {activeTab === 'admin-dashboard' && (
                <AdminDashboard
                  requests={store.clearanceRequests}
                  certificates={store.certificates}
                  departments={store.departments}
                  students={store.students}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenCertificateModal={(cert) => setActiveCertificate(cert)}
                  onIssueCertificate={handleIssueCertificate}
                />
              )}

              {activeTab === 'admin-clearances' && (
                <ClearanceManagement
                  requests={store.clearanceRequests}
                  certificates={store.certificates}
                  departments={store.departments}
                  students={store.students}
                  onIssueCertificate={handleIssueCertificate}
                  onOpenCertificateModal={(cert) => setActiveCertificate(cert)}
                />
              )}

              {activeTab === 'admin-certificates' && (
                <CertificateRegistry
                  certificates={store.certificates}
                  requests={store.clearanceRequests}
                  students={store.students}
                  onOpenCertificateModal={(cert) => setActiveCertificate(cert)}
                />
              )}

              {activeTab === 'admin-students' && (
                <OfficerStudentDirectory
                  students={store.students}
                  clearanceRequests={store.clearanceRequests}
                />
              )}

              {activeTab === 'admin-departments' && (
                <DepartmentSetup
                  departments={store.departments}
                />
              )}

              {activeTab === 'admin-periods' && (
                <ClearancePeriods
                  periods={store.periods}
                />
              )}

              {activeTab === 'admin-audit' && (
                <AuditLogsViewer
                  logs={store.auditLogs}
                />
              )}

              {activeTab === 'admin-reports' && (
                <OfficerReports
                  department={store.departments[0]}
                  requests={store.clearanceRequests}
                />
              )}
            </>
          )}

        </main>
      </div>

      {/* Public Certificate Verification Modal */}
      <PublicVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        certificates={store.certificates}
        onOpenCertificateFull={(cert) => {
          setActiveCertificate(cert);
          setShowVerificationModal(false);
        }}
      />

      {/* Global Printable Certificate Modal */}
      {activeCertificate && (
        <CertificateModal
          certificate={activeCertificate}
          request={store.clearanceRequests.find(r => r.id === activeCertificate.clearanceRequestId)}
          student={store.students.find(s => s.studentId === activeCertificate.studentIdNumber)}
          departments={store.departments}
          onClose={() => setActiveCertificate(null)}
        />
      )}

    </div>
  );
}
