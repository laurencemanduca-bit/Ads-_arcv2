
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { GeneratedCampaign, GeneratedMetaCampaign, AuditReport } from '../types';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCZ0BvgkVHBroo1GmbGtvyLEwwKPnOSub0",
    authDomain: "ads-architect-858e8.firebaseapp.com",
    projectId: "ads-architect-858e8",
    storageBucket: "ads-architect-858e8.firebasestorage.app",
    messagingSenderId: "505506977278",
    appId: "1:505506977278:web:1a04839139637dbbbd1caf"
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length > 0) {
    app = getApp();
} else {
    app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export const authInstance = auth;
export const dbInstance = db;
export const storageInstance = storage;

// --- Helper: Data Sanitization ---
// Firestore rejects 'undefined' values. This recursively cleans the object.
const sanitizePayload = <T>(data: T): T => {
    return JSON.parse(JSON.stringify(data, (key, value) => {
        return value === undefined ? null : value;
    }));
};

// --- Auth Functions ---

export const signInWithGoogle = async () => {
    return signInWithPopup(auth, googleProvider);
};

export const loginEmail = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (!userCredential.user.emailVerified) {
        await firebaseSignOut(auth);
        const error: any = new Error("Email not verified");
        error.code = "auth/email-not-verified";
        throw error;
    }

    return userCredential;
};

export const signupEmail = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    await firebaseSignOut(auth);
    return userCredential;
};

export const resetPasswordEmail = async (email: string) => {
    return sendPasswordResetEmail(auth, email);
};

export const logout = async () => {
    return firebaseSignOut(auth);
};

export const subscribeToAuth = (callback: (user: any) => void) => {
    return onAuthStateChanged(auth, callback);
};

// --- Firestore Helpers (User Isolated) ---

const getUserCollection = (collectionName: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return collection(db, 'users', user.uid, collectionName);
};

// Clients (Folders)
export const addClient = async (name: string, industry: string) => {
    const col = getUserCollection('folders');
    const payload = sanitizePayload({
        name,
        industry,
        createdAt: Date.now(),
        updatedAt: Date.now()
    });
    const docRef = await addDoc(col, payload);
    return { id: docRef.id, ...payload };
};

export const getClients = async () => {
    const col = getUserCollection('folders');
    const q = query(col, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteClient = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'folders', id));
};

export const updateClient = async (id: string, data: any) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    const docRef = doc(db, 'users', user.uid, 'folders', id);
    await updateDoc(docRef, sanitizePayload(data));
};

export const updateFile = async (id: string, data: any) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    const docRef = doc(db, 'users', user.uid, 'files', id);
    await updateDoc(docRef, sanitizePayload(data));
};

// Files (Campaigns, Audits, Assets)

export const saveGeneratedCampaign = async (campaign: GeneratedCampaign | GeneratedMetaCampaign, type: 'google' | 'meta', folderId?: string) => {
    const col = getUserCollection('files');
    const name = (campaign as any).businessName
        ? `${(campaign as any).businessName} - ${type === 'google' ? 'Search' : 'Meta'} Strategy`
        : 'Untitled Campaign';

    const jsonString = JSON.stringify(campaign);
    const sizeLabel = jsonString.length > 1024
        ? `${(jsonString.length / 1024).toFixed(1)} KB`
        : `${jsonString.length} B`;

    const payload = sanitizePayload({
        name,
        folderId: folderId || '',
        type: type === 'google' ? 'campaign_google' : 'campaign_meta',
        data: campaign,
        size: sizeLabel,
        status: 'Active',
        schemaVersion: '2026.1', // Track version for future migrations
        createdAt: Date.now(),
        updatedAt: Date.now()
    });

    const docRef = await addDoc(col, payload);
    return { id: docRef.id, ...payload.data };
};

export const updateProjectFile = async (id: string, data: any) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const sizeLabel = JSON.stringify(data).length > 1024
        ? `${(JSON.stringify(data).length / 1024).toFixed(1)} KB`
        : `${JSON.stringify(data).length} B`;

    const docRef = doc(db, 'users', user.uid, 'files', id);

    // Sanitize specifically the data payload to prevent partial updates from failing
    const cleanData = sanitizePayload(data);

    await updateDoc(docRef, {
        data: cleanData,
        size: sizeLabel,
        updatedAt: Date.now()
    });
    return { id, data: cleanData };
};

export const saveGeneratedAudit = async (audit: AuditReport, folderId?: string) => {
    const col = getUserCollection('files');
    const name = audit.businessName ? `${audit.businessName} - Audit` : 'Performance Audit';

    const payload = sanitizePayload({
        name,
        folderId: folderId || '',
        type: 'audit',
        data: audit,
        size: 'Report',
        status: 'Active',
        schemaVersion: '1.0',
        createdAt: Date.now(),
        updatedAt: Date.now()
    });

    const docRef = await addDoc(col, payload);
    return { id: docRef.id, ...audit };
};

export const uploadProjectFile = async (file: File, folderId?: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    // Organized Storage Path: users/{uid}/clients/{clientId}/assets/{timestamp}_{name}
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folderPath = folderId ? `clients/${folderId}/assets` : 'general_uploads';
    const storagePath = `users/${user.uid}/${folderPath}/${Date.now()}_${safeName}`;

    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    const col = getUserCollection('files');
    const sizeLabel = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    let fileType = 'document';
    if (file.type.includes('image')) fileType = 'asset_image';
    else if (file.type.includes('video')) fileType = 'asset_video';
    else if (file.type.includes('pdf')) fileType = 'report_pdf';

    const payload = sanitizePayload({
        name: file.name,
        folderId: folderId || '',
        type: fileType,
        size: sizeLabel,
        status: 'Active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        downloadUrl,
        storagePath,
        data: {} // Empty for raw files
    });

    const docRef = await addDoc(col, payload);

    return { id: docRef.id, ...payload };
};

export const getFiles = async () => {
    const col = getUserCollection('files');
    const q = query(col, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteFile = async (id: string, storagePath?: string) => {
    const user = auth.currentUser;
    if (!user) return;

    if (storagePath) {
        try {
            const storageRef = ref(storage, storagePath);
            await deleteObject(storageRef);
        } catch (e) {
            console.warn("Storage delete failed or file missing:", e);
        }
    }

    await deleteDoc(doc(db, 'users', user.uid, 'files', id));
};

// Team Members
export const addTeamMember = async (name: string, role: string, email: string) => {
    const col = getUserCollection('teamMembers');
    const payload = sanitizePayload({
        name,
        role,
        email,
        createdAt: Date.now()
    });
    const docRef = await addDoc(col, payload);
    return { id: docRef.id, ...payload };
};

export const getTeamMembers = async () => {
    const col = getUserCollection('teamMembers');
    const q = query(col, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteTeamMember = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'teamMembers', id));
};
