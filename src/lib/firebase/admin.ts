import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        // If you need to use a service account key file in development:
        // credential: admin.credential.cert(serviceAccount),
    });
}

export const db = admin.firestore();
export const auth = admin.auth();
