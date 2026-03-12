import { ref, update, remove, get, child, push } from "firebase/database";
import { db } from "./firebaseInit";
export const fetchLocationSpots = async () => {
	const starCountRef = ref(db, "markersData/");
	try {
		const snapshot = await get(starCountRef);
		const data = snapshot.exists() ? snapshot.val() : {};

		if (typeof data === "object" && !Array.isArray(data)) {
			return Object.entries(data)
				.filter(([_, value]) => value.status === "active")
				.map(([key, value]) => {
					const {
						createdAt,
						status,
						source,
						externalWebsite,
						internalNote,
						...rest
					} = value;
					return {
						id: key,
						...rest,
					};
				});
		}
		return [];
	} catch (error) {
		console.error("Error fetching location spots:", error);
		return [];
	}
};
export const fetchAdminHighlightedSpots = async () => {
	const starCountRef = ref(db, "appAd/highlightedSpots");
	try {
		const snapshot = await get(starCountRef);
		const data = snapshot.exists() ? snapshot.val() : [];
		return data;
	} catch (error) {
		console.error("Error fetching location spots:", error);
		return {};
	}
};
export const addSpotFirebaseFn = (data) => {
	return push(ref(db, "markersData"), data);
};
export const updateSpotFirebaseFn = async (id, updates) => {
	return await update(ref(db, `markersData/${id}`), updates);
};
export const updateAdImage = async (updates) => {
	return await update(ref(db, `appAd`), updates);
};
export const deleteSpotFirebaseFn = async (id) => {
	return await remove(ref(db, `markersData/${id}`));
};
export const getSpotFirebaseFn = async () => {
	const snapshot = await get(child(ref(db), "markersData"));
	const data = snapshot.exists() ? snapshot.val() : [];
	if (typeof data === "object" && !Array.isArray(data)) {
		return Object.entries(data).map(([key, value]) => ({
			id: key,
			...value,
		}));
	}
};
export const getAdImage = async () => {
	const snapshot = await get(child(ref(db), "appAd"));
	const data = snapshot.exists() ? snapshot.val() : "";
	return data;
};

export const UploadImageApi = async (imageUri) => {
	try {
		const formData = new FormData();
		formData.append("image", imageUri);

		const response = await fetch(
			`https://imageupload.91.108.126.5.sslip.io/file/upload`,
			{
				method: "POST",
				body: formData,
			},
		);

		if (response.ok) {
			const data = await response.json();
			return data?.imageUrl;
		} else {
			const errorData = await response.json();
			throw new Error(errorData.message || "File upload failed");
		}
	} catch (err) {
		throw new Error(err.message || "An error occurred");
	}
};
