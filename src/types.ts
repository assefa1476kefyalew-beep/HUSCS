export type Role = 'STUDENT' | 'OFFICER' | 'REGISTRAR' | 'ADMIN' | 'SUPER_ADMIN';

export type ClearanceOverallStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PARTIALLY_CLEARED'
  | 'REJECTED'
  | 'APPROVED'
  | 'COMPLETED'
  | 'CERTIFICATE_ISSUED'
  | 'CANCELLED';

export type ItemClearanceStatus = 
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'CLEARED'
  | 'REJECTED'
  | 'NEEDS_DOCUMENT';

export type ClearanceReasonType = 
  | 'GRADUATION'
  | 'WITHDRAWAL'
  | 'END_OF_YEAR'
  | 'TRANSFER'
  | 'DISMISSAL'
  | 'OTHER';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  departmentId?: string; // For department clearance officers
  departmentName?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastLogin?: string;
  studentId?: string; // Reference to student record if role is STUDENT
}

export interface Student {
  id: string;
  studentId: string; // e.g. HU/1476/14
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  phone: string;
  email: string;
  college: string;
  department: string;
  program: 'REGULAR' | 'EXTENSION' | 'WEEKEND' | 'SUMMER' | 'POSTGRADUATE';
  degreeLevel: 'UNDERGRADUATE' | 'MASTERS' | 'PHD';
  campus: string; // e.g. Main Campus, Technology Campus, Agriculture Campus
  admissionYear: string;
  expectedGraduationYear: string;
  currentYearSemester: string;
  dormitoryNumber?: string;
  blockNumber?: string;
  status: 'ENROLLED' | 'GRADUATING' | 'WITHDRAWN' | 'CLEARED';
  avatarUrl?: string;
}

export interface Department {
  id: string;
  code: string; // e.g. LIB, FIN, REG, DOR, ICT, CAF, DEP, SA
  name: string;
  description: string;
  category: 'ACADEMIC' | 'ADMINISTRATIVE' | 'STUDENT_SERVICE' | 'FINANCIAL';
  assignedOfficerIds: string[];
  isMandatory: boolean;
  order: number;
  iconName: string;
  active: boolean;
}

export interface ClearanceRequirement {
  id: string;
  departmentId: string;
  title: string;
  description: string;
  isMandatory: boolean;
  requiresDocumentUpload: boolean;
  requiredDocumentName?: string;
  applicablePrograms: string[]; // ['ALL'] or specific
  applicableColleges: string[]; // ['ALL'] or specific
  applicableReasons: ClearanceReasonType[]; // ['ALL'] or specific
  active: boolean;
  checklistItems: string[]; // e.g. ['Return all library books', 'Clear library late penalty fines']
}

export interface ClearanceDecision {
  id: string;
  clearanceItemId: string;
  officerId: string;
  officerName: string;
  departmentName: string;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_DOC' | 'HOLD' | 'OVERRIDE';
  reason?: string;
  remedyInstructions?: string;
  outstandingObligation?: string;
  attachedDocumentUrl?: string;
  timestamp: string;
}

export interface SupportingDocument {
  id: string;
  title: string;
  documentType: 'ID_CARD' | 'RECEIPT' | 'COST_SHARING' | 'LAB_SLIP' | 'LIBRARY_CLEARANCE' | 'OTHER';
  fileName: string;
  fileSize: number; // in bytes
  fileUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  clearanceItemId?: string;
  clearanceRequestId: string;
  uploadedAt: string;
  status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
}

export interface ClearanceItem {
  id: string;
  clearanceRequestId: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  isMandatory: boolean;
  status: ItemClearanceStatus;
  reviewedByOfficerId?: string;
  reviewedByOfficerName?: string;
  reviewedAt?: string;
  comments?: string;
  rejectionReason?: string;
  remedyInstructions?: string;
  outstandingBalance?: number; // e.g. 250 ETB for lost book
  outstandingItemsList?: string[];
  requiredDocumentUploaded?: boolean;
  supportingDocumentIds: string[];
  decisions: ClearanceDecision[];
  order: number;
}

export interface ClearanceRequest {
  id: string;
  studentId: string; // Foreign key to Student.id
  studentStudentId: string; // HU/1476/14
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentCollege: string;
  studentDepartment: string;
  studentProgram: string;
  academicYearId: string;
  academicYearLabel: string;
  clearancePeriodId: string;
  clearancePeriodTitle: string;
  reason: ClearanceReasonType;
  customReasonNote?: string;
  overallStatus: ClearanceOverallStatus;
  submissionDate: string;
  lastUpdatedDate: string;
  completedDate?: string;
  certificateId?: string;
  items: ClearanceItem[];
  rejectionCount: number;
  progressPercentage: number;
}

export interface ClearanceCertificate {
  id: string;
  certificateNumber: string; // e.g. HU-CLR-2026-000842
  clearanceRequestId: string;
  studentId: string;
  studentStudentId: string;
  studentName: string;
  studentCollege: string;
  studentDepartment: string;
  studentProgram: string;
  degreeLevel: string;
  graduationAcademicYear: string;
  issueDate: string;
  issuedByOfficerName: string;
  issuedByOfficerTitle: string;
  verificationUrl: string;
  qrCodeDataUrl?: string;
  status: 'VALID' | 'REVOKED';
  securityHash: string;
  // Optional convenience aliases
  studentIdNumber?: string;
  college?: string;
  department?: string;
  program?: string;
  academicYearLabel?: string;
  purpose?: string;
  registrarName?: string;
  departmentApprovals?: Array<{
    departmentId: string;
    departmentName: string;
    departmentCode: string;
    officerName: string;
    approvedAt: string;
    status: string;
    remarks?: string;
  }>;
}

export interface AcademicYear {
  id: string;
  yearLabel: string; // e.g. "2025/2026 E.C. (2026 G.C.)"
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export interface ClearancePeriod {
  id: string;
  academicYearId: string;
  title: string; // e.g. "2026 Summer Class Regular Graduation Clearance"
  reason: ClearanceReasonType;
  startDate: string;
  endDate: string;
  eligiblePrograms: string[];
  status: 'UPCOMING' | 'ACTIVE' | 'CLOSED';
  description: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
  linkUrl?: string;
  relatedEntityId?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userFullName: string;
  userRole: Role;
  action: string; // e.g. "CLEARANCE_APPROVED", "STUDENT_SUBMITTED"
  entity: string; // "ClearanceRequest", "Department", "Requirement"
  entityId: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  ipAddress: string;
  timestamp: string;
  userAgent: string;
}

export interface SystemSettings {
  universityNameEn: string;
  universityNameAm: string;
  motto: string;
  logoUrl: string;
  registrarOfficerName: string;
  registrarOfficerTitle: string;
  allowStudentDocumentResubmission: boolean;
  enableAutoFinalApproval: boolean;
  supportEmail: string;
  supportPhone: string;
  themeColor: string;
  enableAuditLogging: boolean;
}
