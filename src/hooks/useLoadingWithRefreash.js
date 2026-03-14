import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
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
			const [spots, adData, contacts] = await Promise.all([
				getSpotFirebaseFn(),
				getAdImage(),
				getDataFromFirestore("contactUs"),
			]);
			dispatch(
				setSpots({
					spots: spots,
				}),
			);
			dispatch(setWholeAdData({ wholeAdData: adData }));
			dispatch(setContacts({ contacts: contacts }));
			await fetchAllMarkers();
		} catch (error) {
			toast.error(error);
		} finally {
			setisLoading(false);
		}
	}, [dispatch, fetchAllMarkers]);
	useEffect(() => {
		checklogin();
	}, [checklogin]);
	return { isLoading };
};
