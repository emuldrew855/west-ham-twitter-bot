import admin from "firebase-admin";
import fs from "fs";
import { config } from "./config.js"; // Import config

let dbRef; // Declare dbRef outside, but do not initialize yet

// Initialize Firebase and return a promise that resolves once completed
export async function initializeFirebase() {
  const serviceAccountPath = config.googleCredentialsPath;
  if (!serviceAccountPath) {
    console.error("No service account path found in environment variables!");
    return false; // Indicate failure
  }

  try {
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf8")
    );
    if (!serviceAccount.project_id) {
      console.error("Service account missing project_id!");
      return false; // Indicate failure
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase initialized successfully!");
    return true; // Indicate success
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return false; // Indicate failure
  }
}

// Initialize dbRef only after Firebase is successfully initialized
export async function initializeDbRef() {
  const isFirebaseInitialized = await initializeFirebase();
  if (isFirebaseInitialized) {
    dbRef = admin.firestore().doc("tokens/demo");
    console.log("dbRef initialized successfully.");
  } else {
    console.error(
      "Firebase initialization failed. dbRef will not be initialized."
    );
  }
}

// Export dbRef after initialization is guaranteed
export { dbRef };
