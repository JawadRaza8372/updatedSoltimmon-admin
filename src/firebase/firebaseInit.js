import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyBYSNEKWZASxgpvNwmIdRzUmXktKSPaIeg",
	authDomain: "solspringan-v1.firebaseapp.com",
	databaseURL: "https://solspringan-v1-default-rtdb.firebaseio.com",
	projectId: "solspringan-v1",
	storageBucket: "solspringan-v1.firebasestorage.app",
	messagingSenderId: "754995795636",
	appId: "1:754995795636:web:3b8f3b8eaf30e4468da9e1",
	measurementId: "G-68DSZYGRLZ",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
export const uploadImageFun = async (imageUri) => {
	try {
		// Convert image to blob

		// Create unique filename
		const fileName = `images/${Date.now()}.jpg`;

		const storageRef = ref(storage, fileName);

		// Upload
		await uploadBytes(storageRef, imageUri);

		// Get download URL
		const downloadURL = await getDownloadURL(storageRef);

		return downloadURL;
	} catch (error) {
		console.error("Error posting data:", error);
	}
};
export { app, db, firestore };
