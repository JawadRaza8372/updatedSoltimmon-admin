// components
import PageHeader from "@layout/PageHeader";
import Spring from "@components/Spring";
import { toast } from "react-toastify";
import SunCalc from "suncalc";
import Papa from "papaparse";
// hooks
import { addSpotFirebaseFn, getSpotFirebaseFn } from "../firebase/realtimeFn";
import { useDispatch } from "react-redux";
import { setSpots } from "../store/reducer";
import { uploadImageFun } from "../firebase/firebaseInit";
import { useState } from "react";
import LocationInput from "@components/LocationInput";
import AddSpotForm from "@components/AddSpotForm";
import Loader from "@components/Loader";
const AddSpot = () => {
	const dispatch = useDispatch();
	const [csvSummary, setCsvSummary] = useState(null);
	const [validRows, setValidRows] = useState([]);
	const [invalidRows, setInvalidRows] = useState([]);
	const [isLoading, setisLoading] = useState(false);
	const [formData, setformData] = useState({
		name: "",
		address: "",
		discript: "",
		images: [],
		openingHours: "",
		coords: {
			lat: 0,
			lng: 0,
		},
		city: "",
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

	const formatDateTime = (date) =>
		`${String(date.getHours()).padStart(2, "0")}:${String(
			date.getMinutes(),
		).padStart(2, "0")}`;

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
		if (
			formData?.address?.length < 3 ||
			(formData?.coords?.lng === 0 && formData?.coords?.lng === 0)
		) {
			toast.error("Please select a valid address.");
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
			const times = SunCalc.getTimes(
				new Date(),
				formData?.coords?.lat,
				formData?.coords?.lng,
			);
			const sunTimes = {
				sunRise: formatDateTime(times.sunriseEnd),
				sunSet: formatDateTime(times.sunsetStart),
			};
			await addSpotFirebaseFn({
				additionalImages: uploadedGalleryUrls,
				address: formData?.address,
				city: formData?.city,
				description: formData?.discript,
				lat: formData?.coords?.lat,
				lng: formData?.coords?.lng,
				name: formData?.name,
				openingHours: formattedOpeningHours,
				phoneNumber: formData?.phoneNumbeer,
				sunHours: `${sunTimes.sunRise} - ${sunTimes.sunSet}`,
				createdAt: Date.now(),
				status: formData?.status,
				source: "manual",
				internalNote: formData?.internalNote,
				externalWebsite: formData?.externalWebsite?.toLowerCase(),
			});
			const resultSpots = await getSpotFirebaseFn();
			dispatch(setSpots({ spots: resultSpots }));

			setformData({
				name: "",
				address: "",
				discript: "",
				images: [],
				openingHours: "",
				coords: {
					lat: 0,
					lng: 0,
				},
				city: "",
				phoneNumbeer: "",
				internalNote: "",
				externalWebsite: "",
				status: "pending",
			});
			toast.success("Craeted successfully");
		} catch (error) {
			const formattedError = typeof error === "string" ? error : error?.message;
			toast.error(formattedError);
		} finally {
			setisLoading(false);
		}
	};
	const onIncomingDataFun = (data) => {
		setformData({
			...formData,
			name: data?.name ?? "",
			address: data?.description ?? "",
			discript: data?.description ?? "",
			images: data?.images ?? [],
			openingHours: data?.openingHours ?? "",
			coords: data?.coords ?? {
				lat: 0,
				lng: 0,
			},
			city: data?.city ?? "",
			phoneNumbeer: data?.phone ?? "",
			externalWebsite: data?.website ?? "",
		});
	};
	const handleCsvImport = (event) => {
		const file = event.target.files[0];

		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: (results) => {
				const rows = results.data;
				const invalid = [];
				const valid = [];

				const openingHoursRegex =
					/^\s*(?:(0|24|\d{1,2}(:[0-5]\d)?))\s*-\s*(0|24|\d{1,2}(:[0-5]\d)?)\s*$|^\s*(\d{1,2}(:[0-5]\d)?(am|pm))\s*-\s*(\d{1,2}(:[0-5]\d)?(am|pm))\s*$/i;

				const urlRegex =
					/^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

				rows.forEach((row, index) => {
					let error = "";

					const isValidOpeningHours = openingHoursRegex.test(
						`${row?.openingHours}`?.toLowerCase(),
					);

					const isValidExternalLink = urlRegex.test(
						`${row?.externalWebsite}`?.toLowerCase(),
					);

					if (row?.name?.length < 3) {
						error = "Name must be at least 3 characters";
					} else if (
						row?.address?.length < 3 ||
						(row?.lat === 0 && row?.lng === 0 && !row?.city)
					) {
						error = "Invalid address";
					} else if (row?.description?.length < 15) {
						error = "Description must be at least 15 characters";
					} else if (!isValidOpeningHours) {
						error = "Invalid opening hours format";
					} else if (row?.phoneNumber?.length < 7) {
						error = "Invalid phone number";
					} else if (row?.externalWebsite?.length > 0 && !isValidExternalLink) {
						error = "Invalid website URL";
					}

					if (error) {
						invalid.push({
							row: index + 1,
							name: row?.name,
							reason: error,
						});
					} else {
						valid.push(row);
					}
				});

				setValidRows(valid);
				setInvalidRows(invalid);

				setCsvSummary({
					total: rows.length,
					valid: valid.length,
					invalid: invalid.length,
				});
			},
		});
	};
	const importValidRows = async () => {
		try {
			for (const row of validRows) {
				const times = SunCalc.getTimes(
					new Date(),
					Number(row.lat),
					Number(row.lng),
				);

				const sunTimes = {
					sunRise: formatDateTime(times.sunriseEnd),
					sunSet: formatDateTime(times.sunsetStart),
				};

				const formattedOpeningHours = formatOpeningHoursInput(
					row?.openingHours,
				);

				await addSpotFirebaseFn({
					additionalImages: [
						"https://firebasestorage.googleapis.com/v0/b/solspringan-v1.firebasestorage.app/o/placeholder%2Ficon.png?alt=media",
					],
					name: row?.name ?? "",
					address: row?.address ?? "",
					description: row?.description ?? "",
					lat: Number(row?.lat),
					lng: Number(row?.lng),
					city: row?.city,
					openingHours: formattedOpeningHours,
					phoneNumber: row?.phoneNumber,
					externalWebsite: row?.externalWebsite ?? "",
					internalNote: row?.internalNote ?? "",
					status: row?.status ?? "pending",
					source: "import",
					createdAt: Date.now(),
					sunHours: `${sunTimes.sunRise} - ${sunTimes.sunSet}`,
				});
			}
			const resultSpots = await getSpotFirebaseFn();
			dispatch(setSpots({ spots: resultSpots }));
			toast.success(`${validRows.length} spots imported`);
			setCsvSummary(null);
		} catch (error) {
			toast.error(error.message);
		}
	};
	return (
		<>
			<PageHeader title="Add Spot" />
			{isLoading ? (
				<Loader />
			) : (
				<Spring className="card flex-1  mx-auto w-full xl:py-10">
					{(formData?.coords?.lat === 0 && formData?.coords?.lng === 0) ||
					formData?.coords?.address?.length > 0 ? (
						<LocationInput
							onSelectedValueFun={onIncomingDataFun}
							handleCsvImport={handleCsvImport}
							csvSummary={csvSummary}
							importValidRows={importValidRows}
							invalidRows={invalidRows}
							resetFunction={() => {
								setCsvSummary(null);
								setInvalidRows([]);
								setValidRows([]);
							}}
							validRows={validRows}
						/>
					) : (
						<AddSpotForm
							formData={formData}
							setformData={setformData}
							handlePublish={handlePublish}
						/>
					)}
				</Spring>
			)}
		</>
	);
};

export default AddSpot;
