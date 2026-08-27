import { useState, useEffect } from 'react';
import { 
  User, Student, Department, ClearanceRequirement, 
  AcademicYear, ClearancePeriod, ClearanceRequest, 
  ClearanceCertificate, NotificationItem, AuditLog, 
  SystemSettings, ClearanceReasonType, ItemClearanceStatus,
  SupportingDocument, Role
} from '../types';
import { 
  initialSystemSettings, initialAcademicYears, 
  initialClearancePeriods, initialDepartments, 
  initialRequirements, initialStudents, initialUsers, 
  initialCertificates, initialClearanceRequests, 
  initialNotifications, initialAuditLogs, initialDocuments
} from '../data/seedData';

const STORAGE_KEY = 'hawassa_clearance_system_v1';

interface AppState {
  currentUser: User | null;
  systemSettings: SystemSettings;
  academicYears: AcademicYear[];
  clearancePeriods: ClearancePeriod[];
  departments: Department[];
  requirements: ClearanceRequirement[];
  students: Student[];
  users: User[];
  clearanceRequests: ClearanceRequest[];
  certificates: ClearanceCertificate[];
  documents: SupportingDocument[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
}

function getInitialState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge users to ensure the 5 canonical email accounts are always up to date
      const mergedUsers = initialUsers.map(initU => {
        const existing = (parsed.users || []).find((u: User) => u.id === initU.id);
        return existing ? { ...existing, email: initU.email, role: initU.role } : initU;
      });

      return {
        currentUser: parsed.currentUser || initialUsers[0],
        systemSettings: parsed.systemSettings || initialSystemSettings,
        academicYears: parsed.academicYears || initialAcademicYears,
        clearancePeriods: parsed.clearancePeriods || initialClearancePeriods,
        departments: parsed.departments || initialDepartments,
        requirements: parsed.requirements || initialRequirements,
        students: parsed.students || initialStudents,
        users: mergedUsers.length > 0 ? mergedUsers : initialUsers,
        clearanceRequests: parsed.clearanceRequests || initialClearanceRequests,
        certificates: parsed.certificates || initialCertificates,
        documents: parsed.documents || initialDocuments,
        notifications: parsed.notifications || initialNotifications,
        auditLogs: parsed.auditLogs || initialAuditLogs
      };
    }
  } catch (err) {
    console.error('Error loading clearance state:', err);
  }

  return {
    currentUser: initialUsers[0], // Kassahun Tadesse (Student Pending) by default
    systemSettings: initialSystemSettings,
    academicYears: initialAcademicYears,
    clearancePeriods: initialClearancePeriods,
    departments: initialDepartments,
    requirements: initialRequirements,
    students: initialStudents,
    users: initialUsers,
    clearanceRequests: initialClearanceRequests,
    certificates: initialCertificates,
    documents: initialDocuments,
    notifications: initialNotifications,
    auditLogs: initialAuditLogs
  };
}

let globalState: AppState = getInitialState();
const listeners = new Set<() => void>();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
  } catch (e) {
    console.error('Failed to persist state:', e);
  }
  listeners.forEach(listener => listener());
}

export function resetToSeedData() {
  globalState = {
    currentUser: initialUsers[0],
    systemSettings: initialSystemSettings,
    academicYears: initialAcademicYears,
    clearancePeriods: initialClearancePeriods,
    departments: initialDepartments,
    requirements: initialRequirements,
    students: initialStudents,
    users: initialUsers,
    clearanceRequests: initialClearanceRequests,
    certificates: initialCertificates,
    documents: initialDocuments,
    notifications: initialNotifications,
    auditLogs: initialAuditLogs
  };
  notify();
}

export const store = {
  getState: () => globalState,

  // Auth / Current User
  setCurrentUser: (user: User | null) => {
    globalState.currentUser = user;
    if (user) {
      store.addAuditLog({
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        description: `User ${user.fullName} (${user.role}) logged in`
      });
    }
    notify();
  },

  switchUserById: (userId: string) => {
    const user = globalState.users.find(u => u.id === userId);
    if (user) {
      globalState.currentUser = user;
      store.addAuditLog({
        action: 'PERSONA_SWITCH',
        entity: 'User',
        entityId: user.id,
        description: `Switched active session persona to ${user.fullName} (${user.role})`
      });
      notify();
    }
  },

  switchUserByEmail: (email: string) => {
    const trimmed = email.trim().toLowerCase();
    
    // Explicit canonical mapping
    const emailToUserIdMap: Record<string, string> = {
      'studentp@hu.edu.et': 'usr-std-1',
      'studentc@hu.edu.et': 'usr-std-2',
      'library@hu.edu.et': 'usr-off-lib',
      'registrar@hu.edu.et': 'usr-off-reg',
      'superadmin@hu.edu.et': 'usr-admin-1'
    };

    const targetUserId = emailToUserIdMap[trimmed];
    let foundUser = targetUserId ? globalState.users.find(u => u.id === targetUserId) : null;

    if (!foundUser) {
      foundUser = globalState.users.find(u => u.email.toLowerCase() === trimmed) || null;
    }

    if (foundUser) {
      globalState.currentUser = foundUser;
      store.addAuditLog({
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: foundUser.id,
        description: `User ${foundUser.fullName} (${foundUser.role}) signed in`
      });
    } else {
      // Create a transient session user in memory (no persistent profile data saved)
      const username = email.split('@')[0];
      const defaultStudent = globalState.students[0];
      const tempUser: User = {
        id: `usr-firebase-${Date.now()}`,
        username: username,
        email: email,
        fullName: username.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        phone: '+251 91 100 0000',
        role: 'STUDENT',
        status: 'ACTIVE',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        studentId: defaultStudent ? defaultStudent.id : undefined,
        createdAt: new Date().toISOString()
      };
      globalState.currentUser = tempUser;
      store.addAuditLog({
        action: 'USER_SIGNUP',
        entity: 'User',
        entityId: tempUser.id,
        description: `New user ${tempUser.email} authenticated`
      });
    }
    notify();
  },

  loginWithCredentials: (identifier: string, role?: Role): { success: boolean; message?: string } => {
    const trimmed = identifier.trim().toLowerCase();
    
    // Search by username, email, or student ID
    const foundUser = globalState.users.find(u => 
      u.email.toLowerCase() === trimmed || 
      u.username.toLowerCase() === trimmed ||
      (u.studentId && globalState.students.find(s => s.id === u.studentId)?.studentId.toLowerCase() === trimmed)
    );

    if (foundUser) {
      if (foundUser.status !== 'ACTIVE') {
        return { success: false, message: 'Your account is deactivated. Please contact the Registrar administrator.' };
      }
      globalState.currentUser = foundUser;
      store.addAuditLog({
        action: 'USER_LOGIN_SUCCESS',
        entity: 'User',
        entityId: foundUser.id,
        description: `User ${foundUser.fullName} authenticated successfully`
      });
      notify();
      return { success: true };
    }

    // Role-based fallback for demo convenience
    if (role) {
      const userByRole = globalState.users.find(u => u.role === role);
      if (userByRole) {
        globalState.currentUser = userByRole;
        notify();
        return { success: true };
      }
    }

    return { success: false, message: 'Invalid credentials. Try using one of the demo accounts.' };
  },

  logout: () => {
    if (globalState.currentUser) {
      store.addAuditLog({
        action: 'USER_LOGOUT',
        entity: 'User',
        entityId: globalState.currentUser.id,
        description: `User ${globalState.currentUser.fullName} signed out`
      });
    }
    globalState.currentUser = null;
    notify();
  },

  // Audit Logs
  addAuditLog: (log: {
    action: string;
    entity: string;
    entityId: string;
    description: string;
    previousValue?: string;
    newValue?: string;
  }) => {
    if (!globalState.systemSettings.enableAuditLogging) return;

    const user = globalState.currentUser;
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user?.id || 'system',
      userFullName: user?.fullName || 'System Automated Process',
      userRole: user?.role || 'SUPER_ADMIN',
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      description: log.description,
      previousValue: log.previousValue,
      newValue: log.newValue,
      ipAddress: '197.156.78.' + Math.floor(Math.random() * 150 + 10),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent || 'Hawassa University Portal Client'
    };

    globalState.auditLogs = [newLog, ...globalState.auditLogs];
    // Keep max 200 logs
    if (globalState.auditLogs.length > 200) {
      globalState.auditLogs = globalState.auditLogs.slice(0, 200);
    }
  },

  // Notifications
  addNotification: (notif: {
    userId: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    relatedEntityId?: string;
  }) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: notif.userId,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      read: false,
      createdAt: new Date().toISOString(),
      relatedEntityId: notif.relatedEntityId
    };

    globalState.notifications = [newNotif, ...globalState.notifications];
    notify();
  },

  markNotificationAsRead: (notificationId: string) => {
    globalState.notifications = globalState.notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    notify();
  },

  markAllNotificationsAsRead: (userId: string) => {
    globalState.notifications = globalState.notifications.map(n => 
      n.userId === userId ? { ...n, read: true } : n
    );
    notify();
  },

  // Clearance Request Actions
  createClearanceRequest: (studentId: string, clearancePeriodId: string, reason: ClearanceReasonType, customNote?: string) => {
    const student = globalState.students.find(s => s.id === studentId);
    const period = globalState.clearancePeriods.find(p => p.id === clearancePeriodId);
    const academicYear = globalState.academicYears.find(ay => ay.isCurrent) || globalState.academicYears[0];

    if (!student) throw new Error('Student record not found');
    if (!period) throw new Error('Clearance period not found');

    // Build department clearance items from active departments
    const sortedDepartments = [...globalState.departments]
      .filter(d => d.active)
      .sort((a, b) => a.order - b.order);

    const items = sortedDepartments.map((dept, idx) => ({
      id: `itm-${Date.now()}-${dept.code.toLowerCase()}`,
      clearanceRequestId: '',
      departmentId: dept.id,
      departmentName: dept.name,
      departmentCode: dept.code,
      isMandatory: dept.isMandatory,
      status: 'PENDING' as ItemClearanceStatus,
      supportingDocumentIds: [],
      decisions: [],
      order: idx + 1
    }));

    const requestId = `clr-req-${Date.now()}`;
    items.forEach(item => { item.clearanceRequestId = requestId; });

    const newRequest: ClearanceRequest = {
      id: requestId,
      studentId: student.id,
      studentStudentId: student.studentId,
      studentName: student.fullName,
      studentEmail: student.email,
      studentPhone: student.phone,
      studentCollege: student.college,
      studentDepartment: student.department,
      studentProgram: student.program,
      academicYearId: academicYear.id,
      academicYearLabel: academicYear.yearLabel,
      clearancePeriodId: period.id,
      clearancePeriodTitle: period.title,
      reason: reason,
      customReasonNote: customNote,
      overallStatus: 'SUBMITTED',
      submissionDate: new Date().toISOString(),
      lastUpdatedDate: new Date().toISOString(),
      rejectionCount: 0,
      progressPercentage: 0,
      items: items
    };

    globalState.clearanceRequests = [newRequest, ...globalState.clearanceRequests];

    // Audit log
    store.addAuditLog({
      action: 'CLEARANCE_REQUEST_SUBMITTED',
      entity: 'ClearanceRequest',
      entityId: requestId,
      description: `Student ${student.fullName} (${student.studentId}) submitted clearance request for ${reason}`
    });

    // Notify student
    const studentUser = globalState.users.find(u => u.studentId === student.id);
    if (studentUser) {
      store.addNotification({
        userId: studentUser.id,
        title: 'Clearance Request Submitted',
        message: `Your clearance application has been dispatched to all ${items.length} university departments for review.`,
        type: 'INFO',
        relatedEntityId: requestId
      });
    }

    // Notify all assigned department officers
    sortedDepartments.forEach(dept => {
      dept.assignedOfficerIds.forEach(officerId => {
        store.addNotification({
          userId: officerId,
          title: `New Clearance Request (${dept.code})`,
          message: `New clearance request from ${student.fullName} (${student.studentId}, ${student.department}).`,
          type: 'INFO',
          relatedEntityId: requestId
        });
      });
    });

    notify();
    return newRequest;
  },

  approveClearanceItem: (requestId: string, itemId: string, comments?: string) => {
    const user = globalState.currentUser;
    const request = globalState.clearanceRequests.find(r => r.id === requestId);
    if (!request) throw new Error('Clearance request not found');

    const item = request.items.find(i => i.id === itemId);
    if (!item) throw new Error('Clearance item not found');

    const previousStatus = item.status;
    item.status = 'CLEARED';
    item.reviewedByOfficerId = user?.id;
    item.reviewedByOfficerName = user?.fullName || 'Authorized Officer';
    item.reviewedAt = new Date().toISOString();
    item.comments = comments || 'Approved in full. No outstanding obligations found.';
    item.rejectionReason = undefined;
    item.remedyInstructions = undefined;

    // Record decision
    item.decisions.push({
      id: `dec-${Date.now()}`,
      clearanceItemId: item.id,
      officerId: user?.id || 'sys',
      officerName: user?.fullName || 'Authorized Officer',
      departmentName: item.departmentName,
      action: 'APPROVE',
      reason: comments,
      timestamp: new Date().toISOString()
    });

    // Recalculate progress & overall status
    store.recalculateRequestStatus(request);
    request.lastUpdatedDate = new Date().toISOString();

    // Audit log
    store.addAuditLog({
      action: 'CLEARANCE_ITEM_APPROVED',
      entity: 'ClearanceItem',
      entityId: item.id,
      description: `${user?.fullName || 'Officer'} approved ${item.departmentName} clearance for ${request.studentName} (${request.studentStudentId})`,
      previousValue: previousStatus,
      newValue: 'CLEARED'
    });

    // Notify student
    const studentUser = globalState.users.find(u => u.studentId === request.studentId);
    if (studentUser) {
      store.addNotification({
        userId: studentUser.id,
        title: `${item.departmentName} Clearance Approved`,
        message: `Your ${item.departmentName} clearance has been approved by ${user?.fullName || 'Officer'}.`,
        type: 'SUCCESS',
        relatedEntityId: request.id
      });
    }

    notify();
  },

  rejectClearanceItem: (requestId: string, itemId: string, reason: string, remedyInstructions: string, outstandingBalance?: number, outstandingItems?: string[]) => {
    if (!reason || !reason.trim()) {
      throw new Error('A rejection reason is mandatory.');
    }
    const user = globalState.currentUser;
    const request = globalState.clearanceRequests.find(r => r.id === requestId);
    if (!request) throw new Error('Clearance request not found');

    const item = request.items.find(i => i.id === itemId);
    if (!item) throw new Error('Clearance item not found');

    const previousStatus = item.status;
    item.status = 'REJECTED';
    item.reviewedByOfficerId = user?.id;
    item.reviewedByOfficerName = user?.fullName || 'Authorized Officer';
    item.reviewedAt = new Date().toISOString();
    item.rejectionReason = reason;
    item.remedyInstructions = remedyInstructions || 'Please resolve the pending obligation and upload the required proof or consult the department.';
    item.outstandingBalance = outstandingBalance;
    item.outstandingItemsList = outstandingItems;

    item.decisions.push({
      id: `dec-${Date.now()}`,
      clearanceItemId: item.id,
      officerId: user?.id || 'sys',
      officerName: user?.fullName || 'Authorized Officer',
      departmentName: item.departmentName,
      action: 'REJECT',
      reason: reason,
      remedyInstructions: remedyInstructions,
      outstandingObligation: outstandingBalance ? `${outstandingBalance} ETB` : undefined,
      timestamp: new Date().toISOString()
    });

    store.recalculateRequestStatus(request);
    request.lastUpdatedDate = new Date().toISOString();

    // Audit log
    store.addAuditLog({
      action: 'CLEARANCE_ITEM_REJECTED',
      entity: 'ClearanceItem',
      entityId: item.id,
      description: `${user?.fullName || 'Officer'} rejected ${item.departmentName} clearance for ${request.studentName}: ${reason}`,
      previousValue: previousStatus,
      newValue: 'REJECTED'
    });

    // Notify student with urgent warning
    const studentUser = globalState.users.find(u => u.studentId === request.studentId);
    if (studentUser) {
      store.addNotification({
        userId: studentUser.id,
        title: `Clearance Action Required: ${item.departmentName}`,
        message: `${item.departmentName} rejected your clearance request. Reason: "${reason}". Please review remedy instructions.`,
        type: 'ERROR',
        relatedEntityId: request.id
      });
    }

    notify();
  },

  requestItemDocument: (requestId: string, itemId: string, documentRequirementNote: string) => {
    const user = globalState.currentUser;
    const request = globalState.clearanceRequests.find(r => r.id === requestId);
    if (!request) return;
    const item = request.items.find(i => i.id === itemId);
    if (!item) return;

    item.status = 'NEEDS_DOCUMENT';
    item.remedyInstructions = documentRequirementNote;
    item.reviewedAt = new Date().toISOString();
    item.reviewedByOfficerName = user?.fullName;

    item.decisions.push({
      id: `dec-${Date.now()}`,
      clearanceItemId: item.id,
      officerId: user?.id || 'sys',
      officerName: user?.fullName || 'Authorized Officer',
      departmentName: item.departmentName,
      action: 'REQUEST_DOC',
      reason: documentRequirementNote,
      timestamp: new Date().toISOString()
    });

    store.recalculateRequestStatus(request);
    request.lastUpdatedDate = new Date().toISOString();

    store.addAuditLog({
      action: 'DOCUMENT_REQUESTED',
      entity: 'ClearanceItem',
      entityId: item.id,
      description: `Officer requested additional document from ${request.studentName} for ${item.departmentName}`
    });

    const studentUser = globalState.users.find(u => u.studentId === request.studentId);
    if (studentUser) {
      store.addNotification({
        userId: studentUser.id,
        title: `Document Requested: ${item.departmentName}`,
        message: `Please upload the requested document: ${documentRequirementNote}`,
        type: 'WARNING',
        relatedEntityId: request.id
      });
    }

    notify();
  },

  // Student uploads document / responds to rejection
  uploadSupportingDocument: (
    requestId: string, 
    clearanceItemId: string, 
    title: string, 
    documentType: SupportingDocument['documentType'], 
    fileName: string, 
    fileSize: number
  ) => {
    const user = globalState.currentUser;
    const request = globalState.clearanceRequests.find(r => r.id === requestId);
    if (!request) throw new Error('Clearance request not found');

    const item = request.items.find(i => i.id === clearanceItemId);
    if (!item) throw new Error('Clearance item not found');

    const docId = `doc-${Date.now()}`;
    const newDoc: SupportingDocument = {
      id: docId,
      title: title,
      documentType: documentType,
      fileName: fileName,
      fileSize: fileSize,
      fileUrl: '#',
      uploadedBy: user?.id || 'std',
      uploadedByName: user?.fullName || request.studentName,
      clearanceItemId: item.id,
      clearanceRequestId: request.id,
      uploadedAt: new Date().toISOString(),
      status: 'SUBMITTED'
    };

    globalState.documents = [newDoc, ...globalState.documents];
    item.supportingDocumentIds.push(docId);
    item.status = 'UNDER_REVIEW'; // reset status to under review for the officer
    item.requiredDocumentUploaded = true;

    store.recalculateRequestStatus(request);
    request.lastUpdatedDate = new Date().toISOString();

    store.addAuditLog({
      action: 'DOCUMENT_UPLOADED',
      entity: 'SupportingDocument',
      entityId: docId,
      description: `${user?.fullName || 'Student'} uploaded document "${title}" (${fileName}) for ${item.departmentName}`
    });

    // Notify department officer
    const dept = globalState.departments.find(d => d.id === item.departmentId);
    if (dept) {
      dept.assignedOfficerIds.forEach(offId => {
        store.addNotification({
          userId: offId,
          title: `Supporting Document Uploaded (${dept.code})`,
          message: `${request.studentName} uploaded "${title}" for review.`,
          type: 'INFO',
          relatedEntityId: request.id
        });
      });
    }

    notify();
    return newDoc;
  },

  // Registrar issue certificate
  issueCertificate: (requestId: string) => {
    const user = globalState.currentUser;
    const request = globalState.clearanceRequests.find(r => r.id === requestId);
    if (!request) throw new Error('Clearance request not found');

    // Check mandatory items
    const mandatoryUncleared = request.items.filter(i => i.isMandatory && i.status !== 'CLEARED');
    if (mandatoryUncleared.length > 0) {
      throw new Error(`Cannot issue certificate. Mandatory department(s) uncleared: ${mandatoryUncleared.map(i => i.departmentName).join(', ')}`);
    }

    // Mark registrar item cleared if present
    const regItem = request.items.find(i => i.departmentCode === 'REG');
    if (regItem) {
      regItem.status = 'CLEARED';
      regItem.reviewedByOfficerId = user?.id;
      regItem.reviewedByOfficerName = user?.fullName || 'Central Registrar';
      regItem.reviewedAt = new Date().toISOString();
      regItem.comments = 'Registrar final degree audit verified. Clearance Certificate generated and released.';
    }

    const currentYear = new Date().getFullYear();
    const randomSeq = Math.floor(Math.random() * 900000 + 100000);
    const certNumber = `HU-CLR-${currentYear}-${randomSeq}`;
    const certId = `cert-${Date.now()}`;

    const newCert: ClearanceCertificate = {
      id: certId,
      certificateNumber: certNumber,
      clearanceRequestId: request.id,
      studentId: request.studentId,
      studentStudentId: request.studentStudentId,
      studentName: request.studentName,
      studentCollege: request.studentCollege,
      studentDepartment: request.studentDepartment,
      studentProgram: request.studentProgram,
      degreeLevel: 'UNDERGRADUATE',
      graduationAcademicYear: request.academicYearLabel,
      issueDate: new Date().toISOString().split('T')[0],
      issuedByOfficerName: user?.fullName || globalState.systemSettings.registrarOfficerName,
      issuedByOfficerTitle: globalState.systemSettings.registrarOfficerTitle,
      verificationUrl: `${window.location.origin}/verify/${certNumber}`,
      status: 'VALID',
      securityHash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    };

    globalState.certificates = [newCert, ...globalState.certificates];

    request.overallStatus = 'CERTIFICATE_ISSUED';
    request.completedDate = new Date().toISOString();
    request.certificateId = certId;
    request.progressPercentage = 100;
    request.lastUpdatedDate = new Date().toISOString();

    // Update student status
    const student = globalState.students.find(s => s.id === request.studentId);
    if (student) {
      student.status = 'CLEARED';
    }

    store.addAuditLog({
      action: 'CERTIFICATE_ISSUED',
      entity: 'ClearanceCertificate',
      entityId: certId,
      description: `Registrar ${user?.fullName || 'Officer'} released Clearance Certificate ${certNumber} for ${request.studentName} (${request.studentStudentId})`
    });

    const studentUser = globalState.users.find(u => u.studentId === request.studentId);
    if (studentUser) {
      store.addNotification({
        userId: studentUser.id,
        title: 'Clearance Certificate Issued!',
        message: `Congratulations! Your graduation clearance is 100% complete. Certificate reference ${certNumber} is now available for download.`,
        type: 'SUCCESS',
        relatedEntityId: request.id
      });
    }

    notify();
    return newCert;
  },

  recalculateRequestStatus: (request: ClearanceRequest) => {
    const total = request.items.length;
    if (total === 0) return;

    const clearedCount = request.items.filter(i => i.status === 'CLEARED').length;
    const rejectedCount = request.items.filter(i => i.status === 'REJECTED').length;
    const underReviewCount = request.items.filter(i => i.status === 'UNDER_REVIEW' || i.status === 'NEEDS_DOCUMENT').length;
    
    request.progressPercentage = Math.round((clearedCount / total) * 100);
    request.rejectionCount = rejectedCount;

    if (request.overallStatus === 'CERTIFICATE_ISSUED') {
      return;
    }

    const mandatoryItems = request.items.filter(i => i.isMandatory);
    const mandatoryCleared = mandatoryItems.every(i => i.status === 'CLEARED');

    if (mandatoryCleared) {
      request.overallStatus = 'APPROVED';
    } else if (rejectedCount > 0) {
      request.overallStatus = 'REJECTED';
    } else if (clearedCount > 0) {
      request.overallStatus = 'PARTIALLY_CLEARED';
    } else if (underReviewCount > 0) {
      request.overallStatus = 'UNDER_REVIEW';
    } else {
      request.overallStatus = 'SUBMITTED';
    }
  },

  // Admin Management Actions
  addDepartment: (deptData: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...deptData,
      id: `dep-${Date.now()}`
    };
    globalState.departments = [...globalState.departments, newDept];
    store.addAuditLog({
      action: 'DEPARTMENT_CREATED',
      entity: 'Department',
      entityId: newDept.id,
      description: `Created new clearance department: ${newDept.name} (${newDept.code})`
    });
    notify();
  },

  updateDepartment: (deptId: string, updates: Partial<Department>) => {
    globalState.departments = globalState.departments.map(d => 
      d.id === deptId ? { ...d, ...updates } : d
    );
    store.addAuditLog({
      action: 'DEPARTMENT_UPDATED',
      entity: 'Department',
      entityId: deptId,
      description: `Updated clearance department configurations`
    });
    notify();
  },

  addRequirement: (reqData: Omit<ClearanceRequirement, 'id'>) => {
    const newReq: ClearanceRequirement = {
      ...reqData,
      id: `req-${Date.now()}`
    };
    globalState.requirements = [...globalState.requirements, newReq];
    store.addAuditLog({
      action: 'REQUIREMENT_CREATED',
      entity: 'ClearanceRequirement',
      entityId: newReq.id,
      description: `Added requirement rule: ${newReq.title}`
    });
    notify();
  },

  updateRequirement: (reqId: string, updates: Partial<ClearanceRequirement>) => {
    globalState.requirements = globalState.requirements.map(r => 
      r.id === reqId ? { ...r, ...updates } : r
    );
    store.addAuditLog({
      action: 'REQUIREMENT_UPDATED',
      entity: 'ClearanceRequirement',
      entityId: reqId,
      description: `Modified requirement rule parameters`
    });
    notify();
  },

  addClearancePeriod: (periodData: Omit<ClearancePeriod, 'id'>) => {
    const newPeriod: ClearancePeriod = {
      ...periodData,
      id: `cp-${Date.now()}`
    };
    globalState.clearancePeriods = [newPeriod, ...globalState.clearancePeriods];
    store.addAuditLog({
      action: 'CLEARANCE_PERIOD_CREATED',
      entity: 'ClearancePeriod',
      entityId: newPeriod.id,
      description: `Configured new clearance intake period: ${newPeriod.title}`
    });
    notify();
  },

  updateClearancePeriod: (periodId: string, updates: Partial<ClearancePeriod>) => {
    globalState.clearancePeriods = globalState.clearancePeriods.map(p => 
      p.id === periodId ? { ...p, ...updates } : p
    );
    store.addAuditLog({
      action: 'CLEARANCE_PERIOD_UPDATED',
      entity: 'ClearancePeriod',
      entityId: periodId,
      description: `Updated clearance period status/dates`
    });
    notify();
  },

  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    globalState.users = [...globalState.users, newUser];
    store.addAuditLog({
      action: 'USER_CREATED',
      entity: 'User',
      entityId: newUser.id,
      description: `Created account for ${newUser.fullName} (${newUser.role})`
    });
    notify();
  },

  updateUser: (userId: string, updates: Partial<User>) => {
    globalState.users = globalState.users.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    );
    store.addAuditLog({
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: userId,
      description: `Updated user account status or permissions`
    });
    notify();
  },

  addStudent: (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}`
    };
    globalState.students = [...globalState.students, newStudent];
    store.addAuditLog({
      action: 'STUDENT_ENROLLED',
      entity: 'Student',
      entityId: newStudent.id,
      description: `Added student record: ${newStudent.fullName} (${newStudent.studentId})`
    });
    notify();
  },

  importStudentsBatch: (newStudentsList: Array<Omit<Student, 'id'>>) => {
    const createdStudents: Student[] = newStudentsList.map((s, idx) => ({
      ...s,
      id: `std-imp-${Date.now()}-${idx}`
    }));

    globalState.students = [...createdStudents, ...globalState.students];
    store.addAuditLog({
      action: 'STUDENTS_BATCH_IMPORTED',
      entity: 'Student',
      entityId: 'batch',
      description: `Successfully imported ${createdStudents.length} student records from CSV data`
    });
    notify();
    return createdStudents.length;
  },

  updateSystemSettings: (updates: Partial<SystemSettings>) => {
    globalState.systemSettings = { ...globalState.systemSettings, ...updates };
    store.addAuditLog({
      action: 'SYSTEM_SETTINGS_UPDATED',
      entity: 'SystemSetting',
      entityId: 'main',
      description: `Updated institutional system settings and clearance policies`
    });
    notify();
  },

  resetDatabase: () => {
    resetToSeedData();
  },

  resetToSeedData: () => {
    resetToSeedData();
  }
};

// React Hook to subscribe to store changes
export function useClearanceStore() {
  const [state, setState] = useState<AppState>(store.getState());

  useEffect(() => {
    const handleUpdate = () => {
      setState({ ...store.getState() });
    };

    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    ...state,
    ...store,
    currentRole: state.currentUser?.role || 'STUDENT',
    allUsers: state.users,
    periods: state.clearancePeriods
  };
}
