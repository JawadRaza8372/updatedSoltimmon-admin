import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
	fetchUserId,
	isCheckLogin,
	setContacts,
	setSpots,
	setWholeAdData,
} from "../store/reducer";
import { getAdImage, getSpotFirebaseFn } from "../firebase/realtimeFn";
import { getDataFromFirestore } from "../firebase/firestoreFn";
export const useLoadingWithRefreash = () => {
	const [isLoading, setisLoading] = useState(true);
	const dispatch = useDispatch();
	const isCalled = useRef(false); // Prevent multiple calls
	const checklogin = useCallback(async () => {
		try {
			if (isCalled.current) return; // Prevent duplicate execution
			isCalled.current = true;
			const result = await fetchUserId();

			if (result) {
				dispatch(isCheckLogin({ isAuth: "loggedIn" }));
				await getSpotFirebaseFn()
					.then((response) => {
						dispatch(
							setSpots({
								spots: response,
							}),
						);
					})
					.catch((err) => {
						toast.error(err);
					});
				await getAdImage()
					.then((dat) => {
						dispatch(setWholeAdData({ wholeAdData: dat }));
					})
					.catch((err) => {
						toast.error(err);
					});
				await getDataFromFirestore("contactUs")
					.then((dat) => {
						dispatch(setContacts({ contacts: dat }));
					})
					.catch((err) => {
						toast.error(err);
					});
				setisLoading(false);
			} else {
				setisLoading(false);
			}
		} catch (error) {
			toast.error(error);
			setisLoading(false);
		}
	}, [dispatch]);

	useEffect(() => {
		checklogin();
	}, [checklogin]);
	return { isLoading };
};
