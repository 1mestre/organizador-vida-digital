
import { FIREBASE_CONFIG, FIRESTORE_COLLECTION_PATH, FIRESTORE_DOC_PATH } from '../constants';
import { AppState, FirebaseData } from '../types';

let db: any; // Firebase Firestore instance (compat)

export const initializeFirebase = (): void => {
  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(FIREBASE_CONFIG);
  }
  db = window.firebase.firestore();
};

export const loadSharedData = (
  onDataLoaded: (data: FirebaseData | null) => void,
  onError: (error: Error) => void
): (() => void) => { // Returns an unsubscribe function
  if (!db) {
    console.error("Firebase not initialized. Call initializeFirebase first.");
    onError(new Error("Firebase not initialized."));
    return () => {};
  }
  
  const docRef = db.collection(FIRESTORE_COLLECTION_PATH).doc(FIRESTORE_DOC_PATH);

  const unsubscribe = docRef.onSnapshot(
    (doc: any) => {
      if (doc.exists) {
        onDataLoaded(doc.data() as FirebaseData);
      } else {
        onDataLoaded(null); // No data exists, might be first time
      }
    },
    (error: Error) => {
      console.error("Error loading shared data from Firestore:", error);
      onError(error);
    }
  );
  return unsubscribe;
};

export const saveSharedData = async (data: Omit<AppState, 'overallTargetCOP'>): Promise<void> => {
  if (!db) {
    console.error("Firebase not initialized. Call initializeFirebase first.");
    throw new Error("Firebase not initialized.");
  }

  const dataToSave: FirebaseData = {
    ...data,
    lastUpdated: window.firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const docRef = db.collection(FIRESTORE_COLLECTION_PATH).doc(FIRESTORE_DOC_PATH);
    await docRef.set(dataToSave, { merge: true });
    console.log("Datos compartidos guardados en Firestore.");
  } catch (error) {
    console.error("Error saving shared data to Firestore:", error);
    throw error; // Re-throw to be handled by caller
  }
};
