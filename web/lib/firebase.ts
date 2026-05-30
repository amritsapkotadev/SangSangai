import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
  }
}

export const messaging = admin.messaging;

export async function sendPushNotification(
  deviceToken: string,
  title: string,
  body: string
): Promise<boolean> {
  try {
    if (!admin.apps.length) {
      console.warn("Firebase not initialized, skipping notification");
      return false;
    }
    await admin.messaging().send({
      token: deviceToken,
      notification: { title, body },
    });
    return true;
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return false;
  }
}
