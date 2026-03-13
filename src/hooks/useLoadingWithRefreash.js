import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
	setContacts,
	setSpots,
	setWholeAdData,
	setClientPaidSpots,
	setClientSpots,
	fetchUserId,
} from "../store/reducer";
import {
	fetchAdminHighlightedSpots,
	fetchLocationSpots,
	getAdImage,
	getSpotFirebaseFn,
} from "../firebase/realtimeFn";
import { getDataFromFirestore } from "../firebase/firestoreFn";
export const useLoadingWithRefreash = () => {
	const { isAuth } = useSelector((state) => state?.auth);
	const [isLoading, setisLoading] = useState(true);
	const dispatch = useDispatch();

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
			const result = await fetchUserId();
			if (isAuth?.length > 0 || (result && result?.length > 0)) {
				console.log("auth runed");
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
				console.log("unauth runed");
				await fetchAllMarkers();
				setisLoading(false);
			}
		} catch (error) {
			toast.error(error);
			setisLoading(false);
		}
	}, [dispatch, fetchAllMarkers, isAuth]);
	useEffect(() => {
		checklogin();
	}, [checklogin, isAuth]);
	return { isLoading };
};
