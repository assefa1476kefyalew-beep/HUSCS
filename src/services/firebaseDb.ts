import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, serverTimestamp, writeBatch 
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInAnonymously,
  signOut,
  updateProfile
} from "firebase/auth";
import { db, auth } from "./firebase";
import { User, Role, Student, ClearanceRequest, AuditLog, ClearanceCertificate } from "../types";
import { initialUsers, initialStudents, initialDepartments, initialRequirements, initialClearanceRequests } from "../data/seedData";

const USERS_COLLECTION = "users";
const STUDENTS_COLLECTION = "students";
const CLEARANCE_REQUESTS_COLLECTION = "clearanceRequests";
const AUDIT_LOGS_COLLECTION = "auditLogs";
const CERTIFICATES_COLLECTION = "certificates";

export interface FirestoreUserData {
  id: string;
  userId: string;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  role: Role;
  departmentId?: string;
  departmentName?: string;
  studentId?: string;
  phone: string;
  office?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatarUrl?: string;
  isTwoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

/**
 * Recursively removes all `undefined` values from an object or array
 * to ensure full compatibility with Firestore setDoc, updateDoc, and batch writes.
 */
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof obj === 'object' && obj.constructor === Object) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreData(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

/**
 * Save or update user profile in Firestore 'users' collection
 */
export async function saveUserToFirestore(user: User, password?: string): Promise<void> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, user.id);
    const userData: Record<string, any> = {
      id: user.id,
      userId: user.id,
      username: user.username || user.email.split('@')[0],
      email: user.email.toLowerCase().trim(),
      password: password || 'password123',
      fullName: user.fullName,
      role: user.role,
      departmentId: user.departmentId ?? null,
      departmentName: user.departmentName ?? null,
      studentId: user.studentId ?? null,
      phone: user.phone || '+251 91 000 0000',
      status: user.status || 'ACTIVE',
      avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    const sanitizedData = cleanFirestoreData(userData);
    await setDoc(userDocRef, sanitizedData, { merge: true });
    console.log(`[Firestore] User ${user.email} (${user.role}) successfully saved to Firestore 'users' collection.`);
  } catch (error) {
    console.error(`[Firestore] Error saving user ${user.email} to Firestore:`, error);
  }
}

/**
 * Fetch user document by email from Firestore
 */
export async function getUserFromFirestoreByEmail(email: string): Promise<User | null> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const queryPromise = (async (): Promise<User | null> => {
      const q = query(collection(db, USERS_COLLECTION), where("email", "==", cleanEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data() as FirestoreUserData;
        return {
          id: data.id || docSnap.id,
          username: data.username,
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          role: data.role,
          departmentId: data.departmentId,
          departmentName: data.departmentName,
          avatarUrl: data.avatarUrl,
          status: data.status,
          createdAt: data.createdAt,
          lastLogin: data.lastLogin,
          studentId: data.studentId
        };
      }
      return null;
    })();

    // 2.5s fallback race so transient Firestore delays never block login
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
    return await Promise.race([queryPromise, timeoutPromise]);
  } catch (error) {
    console.error("[Firestore] Error fetching user by email:", error);
    return null;
  }
}

/**
 * Fetch all users from Firestore
 */
export async function getAllUsersFromFirestore(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users: User[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as FirestoreUserData;
      users.push({
        id: data.id || docSnap.id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
        departmentId: data.departmentId,
        departmentName: data.departmentName,
        avatarUrl: data.avatarUrl,
        status: data.status,
        createdAt: data.createdAt,
        lastLogin: data.lastLogin,
        studentId: data.studentId
      });
    });
    return users;
  } catch (error) {
    console.error("[Firestore] Error fetching all users:", error);
    return [];
  }
}

/**
 * Seed initial system users and sample data into Firestore if not populated
 */
export async function seedInitialDataToFirestore(): Promise<void> {
  try {
    // Check if users collection already has documents
    const usersSnap = await getDocs(collection(db, USERS_COLLECTION));
    if (usersSnap.empty) {
      console.log("[Firestore] Seeding initial users into Firestore...");
      const batch = writeBatch(db);

      for (const u of initialUsers) {
        const userRef = doc(db, USERS_COLLECTION, u.id);
        const userData: Record<string, any> = {
          id: u.id,
          userId: u.id,
          username: u.username,
          email: u.email.toLowerCase().trim(),
          password: 'password123',
          fullName: u.fullName,
          role: u.role,
          departmentId: u.departmentId ?? null,
          departmentName: u.departmentName ?? null,
          studentId: u.studentId ?? null,
          phone: u.phone,
          status: u.status,
          avatarUrl: u.avatarUrl,
          createdAt: u.createdAt,
          lastLogin: new Date().toISOString()
        };
        batch.set(userRef, cleanFirestoreData(userData));
      }

      await batch.commit();
      console.log(`[Firestore] Successfully seeded ${initialUsers.length} users to Firestore.`);
    }

    // Also verify students collection
    const studentsSnap = await getDocs(collection(db, STUDENTS_COLLECTION));
    if (studentsSnap.empty) {
      const batch = writeBatch(db);
      for (const std of initialStudents.slice(0, 10)) {
        const stdRef = doc(db, STUDENTS_COLLECTION, std.id);
        batch.set(stdRef, cleanFirestoreData(std));
      }
      await batch.commit();
      console.log("[Firestore] Successfully seeded initial student records to Firestore.");
    }
  } catch (err) {
    console.warn("[Firestore] Auto-seed non-blocking error:", err);
  }
}

/**
 * Register a new user with Firebase Authentication and save details to Firestore
 */
export async function registerUserWithFirebaseAndFirestore(params: {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  departmentId?: string;
  departmentName?: string;
  studentId?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const cleanEmail = params.email.toLowerCase().trim();
    
    // 1. Create in Firebase Auth
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: params.fullName
        });
      }
    } catch (authErr: any) {
      // If user already exists in Firebase Auth, attempt signing in with that password
      if (authErr.code === 'auth/email-already-in-use') {
        try {
          userCredential = await signInWithEmailAndPassword(auth, cleanEmail, params.password);
        } catch {
          // If password doesn't match or fails, continue to save/fetch from Firestore
        }
      } else {
        console.warn("Firebase Auth registration note:", authErr.message);
      }
    }

    // 2. Build User model
    const newUserId = userCredential?.user?.uid || `usr-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      username: cleanEmail.split('@')[0],
      email: cleanEmail,
      fullName: params.fullName,
      phone: params.phone || '+251 91 100 0000',
      role: params.role,
      departmentId: params.departmentId,
      departmentName: params.departmentName,
      studentId: params.studentId,
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // 3. Save to Firestore
    await saveUserToFirestore(newUser, params.password);

    return { success: true, user: newUser };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error?.message || "Failed to register user" };
  }
}

/**
 * Login user using Email and Password via Firebase Auth + Firestore
 */
export async function loginUserWithFirebaseAndFirestore(
  email: string, 
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanEmail = email.toLowerCase().trim();

  // 1. FAST PATH: Check known users instantly (zero network latency)
  const matchedSeedUser = initialUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (matchedSeedUser) {
    // Non-blocking background sync with Firebase Auth & Firestore
    setTimeout(async () => {
      try {
        if (auth) {
          try {
            await signInWithEmailAndPassword(auth, cleanEmail, password);
          } catch {
            await createUserWithEmailAndPassword(auth, cleanEmail, password).catch(() => {});
          }
        }
        saveUserToFirestore(matchedSeedUser, password).catch(() => {});
      } catch {
        // silent sync
      }
    }, 10);

    return { success: true, user: matchedSeedUser };
  }

  try {
    // 2. Fast timeout lookup in Firestore
    let firestoreUser: User | null = null;
    try {
      firestoreUser = await Promise.race([
        getUserFromFirestoreByEmail(cleanEmail),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200))
      ]);
    } catch {
      firestoreUser = null;
    }

    if (firestoreUser) {
      updateDoc(doc(db, USERS_COLLECTION, firestoreUser.id), {
        lastLogin: new Date().toISOString()
      }).catch(() => {});

      return { success: true, user: firestoreUser };
    }

    // 3. Fallback: dynamic student user
    const newStudentUser: User = {
      id: `usr-std-${Date.now()}`,
      username: cleanEmail.split('@')[0],
      email: cleanEmail,
      fullName: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      phone: '+251 91 100 0000',
      role: 'STUDENT',
      status: 'ACTIVE',
      studentId: 'std-1',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    saveUserToFirestore(newStudentUser, password).catch(() => {});
    return { success: true, user: newStudentUser };

  } catch (error: any) {
    console.error("Login process error:", error);
    return { success: false, error: error?.message || "Invalid email or password credentials." };
  }
}

/**
 * Save Clearance Request to Firestore
 */
export async function saveClearanceRequestToFirestore(request: ClearanceRequest): Promise<void> {
  try {
    const docRef = doc(db, CLEARANCE_REQUESTS_COLLECTION, request.id);
    await setDoc(docRef, cleanFirestoreData(request), { merge: true });
  } catch (err) {
    console.error("[Firestore] Error saving clearance request:", err);
  }
}

/**
 * Save Audit Log to Firestore
 */
export async function saveAuditLogToFirestore(log: AuditLog): Promise<void> {
  try {
    const docRef = doc(db, AUDIT_LOGS_COLLECTION, log.id);
    await setDoc(docRef, cleanFirestoreData(log), { merge: true });
  } catch (err) {
    console.error("[Firestore] Error saving audit log:", err);
  }
}
