import admin from "firebase-admin";
import fs from "fs";
import { config } from "../config.js"; // Import config

let dbRef; // Declare dbRef outside, but do not initialize yet

// Initialize Firebase and return a promise that resolves once completed
export async function initializeFirebase() {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    return true;
  } catch (err) {
    console.log(`Err: ${err.toString()}`);
    return false;
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
