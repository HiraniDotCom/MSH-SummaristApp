import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import { UserRecord } from "firebase-admin/auth";

admin.initializeApp();

export const createUserProfile = functions.auth
    .user()
    .onCreate(async (user: UserRecord) => {
        await admin
            .firestore()
            .collection("users")
            .doc(user.uid)
            .set({
                email: user.email || null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                premium: false,
                libraryAccess: false,
            });
    });
