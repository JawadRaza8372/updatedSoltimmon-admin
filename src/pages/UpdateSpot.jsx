// components
import PageHeader from "@layout/PageHeader";
import Spring from "@components/Spring";
import { toast } from "react-toastify";

// hooks
import {
	getSpotFirebaseFn,
	updateSpotFirebaseFn,
} from "../firebase/realtimeFn";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { setSpots } from "../store/reducer";
import { useDispatch, useSelector } from "react-redux";
import UpdateSpotForm from "@components/UpdateSpotForm";
import { uploadImageFun } from "../firebase/firebaseInit";
import Loader from "@components/Loader";
const UpdateSpot = () => {
	const { spots } = useSelector((state) => state?.auth);
	const dispatch = useDispatch();
	const [isLoading, setisLoading] = useState(false);
	const { id } = useParams();
	const [formData, setformData] = useState({
		name: "",
		discript: "",
		images: [],
		openingHours: "",
		phoneNumbeer: "",
		internalNote: "",
		externalWebsite: "",
		status: "pending",
	});
	function formatOpeningHoursInput(input) {
		if (!input) return "";

		// Normalize input
		const value = input
			.toLowerCase()
			.replace(/to|–|—/g, "-")
			.replace(/\s+/g, "");

		const parts = value.split("-");
		if (parts.length !== 2) return input; // only allow ranges

		const parseTime = (str) => {
			if (!str) return null;
			const match = str.match(/^(\d{1,2})(?::?(\d{2}))?(am|pm)?$/);
			if (!match) return null;

			let hour = parseInt(match[1], 10);
			let minute = parseInt(match[2] || "0", 10);
			const period = match[3];

			if (minute > 59) minute = 59;

			if (period) {
				if (hour > 12) hour = 12;
				if (period === "pm" && hour !== 12) hour += 12;
				if (period === "am" && hour === 12) hour = 0;
			} else {
				if (hour > 23) return null; // invalid hour
			}

			return hour * 60 + minute;
		};

		const to12Hour = (minutes) => {
			let h = Math.floor(minutes / 60);
			let m = minutes % 60;
			const ampm = h >= 12 ? "PM" : "AM";
			h = h % 12 || 12;
			return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
		};

		const start = parseTime(parts[0]);
		const end = parseTime(parts[1]);

		// both times must be valid
		if (start === null || end === null) return input;

		// Special case: Open 24 hours
		if ((start === 0 && end === 0) || (start === 0 && end === 24 * 60)) {
			return "Open 24 hours";
		}

		return `${to12Hour(start)} – ${to12Hour(end)}`;
	}

	const fetchSpotsFun = useCallback(async () => {
		try {
			const result = await getSpotFirebaseFn();
			dispatch(setSpots({ spots: result }));
		} catch (error) {
			toast.error(error?.message || error);
		}
	}, [dispatch]);
	useEffect(() => {
		if (spots?.length > 0 && id) {
			const result = spots?.find((spot) => spot?.id === id);
			if (result) {
				setformData({
					name: result?.name ?? "",
					discript: result?.description ?? "",
					images: result?.additionalImages ?? [],
					openingHours:
						result?.openingHours?.length > 0
							? `${result?.openingHours}`
									.toLowerCase()
									.replace(/to|–|—/g, "-")
									.replace(/\s+/g, "")
							: "",
					phoneNumbeer: result?.phoneNumber ?? "",
					internalNote: result?.internalNote ?? "",
					externalWebsite: result?.externalWebsite ?? "",
					status: result?.status ?? "pending",
				});
			} else {
				toast.error("Item not found.");
			}
		}
	}, [spots, id]);
	const handlePublish = async (e) => {
		e.preventDefault();
		const openingHoursRegex =
			/^\s*(?:(0|24|\d{1,2}(:[0-5]\d)?))\s*-\s*(0|24|\d{1,2}(:[0-5]\d)?)\s*$|^\s*(\d{1,2}(:[0-5]\d)?(am|pm))\s*-\s*(\d{1,2}(:[0-5]\d)?(am|pm))\s*$/i;

		const formattedOpeningHours = formatOpeningHoursInput(
			formData.openingHours,
		);
		const urlRegex =
			/^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
		const isValidOpeningHours = openingHoursRegex.test(
			`${formData.openingHours}`?.toLowerCase(),
		);
		const isValidExternalLink = urlRegex.test(
			`${formData.externalWebsite}`?.toLowerCase(),
		);
		if (formData?.name?.length < 3) {
			toast.error("Please enter a spot name with at least 3 characters.");
			return;
		}

		if (formData?.discript?.length < 15) {
			toast.error(
				"Please provide a detailed description with at least 15 characters.",
			);
			return;
		}
		if (isValidOpeningHours !== true) {
			toast.error(
				"Please enter valid opening hours. Allowed formats include: 9am-9pm, 09:00-21:30 and 9-21.",
			);
			return;
		}
		if (formData?.phoneNumbeer?.length < 7) {
			toast.error("Please enter a valid phone number.");
			return;
		}

		if (formData?.externalWebsite?.length > 0 && !isValidExternalLink) {
			toast.error("Please enter valid external website url.");
			return;
		}
		if (formData?.images?.length <= 0) {
			toast.error("Please upload at least one image for this spot.");
			return;
		}
		try {
			setisLoading(true);
			let uploadedGalleryUrls = [];
			if (formData?.images?.length > 0) {
				const uploadPromises = formData?.images?.map(async (img) => {
					const result =
						typeof img === "string" ? img : await uploadImageFun(img);
					return result;
				});
				uploadedGalleryUrls = await Promise.all(uploadPromises);
			}
			await updateSpotFirebaseFn(id, {
				additionalImages: uploadedGalleryUrls,
				description: formData?.discript,
				name: formData?.name,
				openingHours: formattedOpeningHours,
				phoneNumber: formData?.phoneNumbeer,
				status: formData?.status,
				internalNote: formData?.internalNote,
				externalWebsite: formData?.externalWebsite?.toLowerCase(),
			});
			await fetchSpotsFun();
			toast.success("Updated successfully");
		} catch (error) {
			const formattedError = typeof error === "string" ? error : error?.message;
			toast.error(formattedError);
		} finally {
			setisLoading(false);
		}
	};
	return (
		<>
			<PageHeader title="Update Spot" />
			{isLoading ? (
				<Loader />
			) : (
				<Spring className="card flex-1 xl:py-10">
					<UpdateSpotForm
						formData={formData}
						setformData={setformData}
						handlePublish={handlePublish}
					/>
				</Spring>
			)}
		</>
	);
};

export default UpdateSpot;
