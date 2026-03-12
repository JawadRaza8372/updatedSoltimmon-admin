import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
	fetchUserId,
	isCheckLogin,
	setContacts,
	setSpots,
	setWholeAdData,
	setClientPaidSpots,
	setClientSpots,
} from "../store/reducer";
import {
	fetchAdminHighlightedSpots,
	fetchLocationSpots,
	getAdImage,
	getSpotFirebaseFn,
} from "../firebase/realtimeFn";
import { getDataFromFirestore } from "../firebase/firestoreFn";
export const useLoadingWithRefreash = () => {
	const [isLoading, setisLoading] = useState(true);
	const dispatch = useDispatch();
	const isCalled = useRef(false); // Prevent multiple calls
	const fetchAllMarkers = useCallback(async () => {
		const result = await fetchLocationSpots();
		const highlightedResults = await fetchAdminHighlightedSpots();
		const filteredHighlightedSpots = result?.filter((dat) =>
			highlightedResults?.includes(dat?.id),
		);
		dispatch(setClientSpots({ clientSpots: result }));
		dispatch(setClientPaidSpots({ clientPaidSpots: filteredHighlightedSpots }));
	}, [dispatch]);
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
				await fetchAllMarkers();

				setisLoading(false);
			} else {
				await fetchAllMarkers();
				setisLoading(false);
			}
		} catch (error) {
			toast.error(error);
			setisLoading(false);
		}
	}, [dispatch, fetchAllMarkers]);

	useEffect(() => {
		checklogin();
	}, [checklogin]);
	return { isLoading };
};
