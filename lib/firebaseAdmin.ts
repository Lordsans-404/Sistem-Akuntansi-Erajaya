// lib/firebaseAdmin.ts
import admin from 'firebase-admin';

// Cek apakah admin sudah di-init sebelumnya (Singleton pattern)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Handle replace newline untuk private key di .env
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export { db };