import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

export enum Role {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  degree?: string;
  isSharingEnabled?: boolean;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  fileURL: string;
  type: 'prescription' | 'report';
  createdAt: any;
  fileName: string;
}
