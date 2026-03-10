// firestoreDb.js
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { firestore } from "./firebaseInit";

// Get all docs from a collection
export const getDataFromFirestore = async (collectionName) => {
  const querySnapshot = await getDocs(collection(firestore, collectionName));
  return querySnapshot.docs.length > 0
    ? querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
    : [];
};

export const deleteDocFromFirestore = async (collectionName, docId) => {
  await deleteDoc(doc(firestore, collectionName, docId));
};
