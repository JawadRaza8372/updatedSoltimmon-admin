import classNames from "classnames";
import { useRef, useState } from "react";
import PlacesAutocomplete, {
	geocodeByAddress,
} from "react-places-autocomplete";
import { toast } from "react-toastify";
function LocationInput({
	onSelectedValueFun,
	handleCsvImport,
	csvSummary,
	invalidRows,
	validRows,
	resetFunction,
	importValidRows,
}) {
	const [address, setAddress] = useState("");
	const fileInputRef = useRef(null);

	const [selectedData, setselectedData] = useState({
		address: "",
		description: "",
		coords: {
			lat: 0,
			lng: 0,
		},
		name: "",
		openingHours: "",
		website: "",
		phone: "",
		city: "",
		images: [],
	});
	function getUnifiedOpeningHours(weekdayText = []) {
		if (!Array.isArray(weekdayText) || !weekdayText.length) return null;

		const normalize = (str) => {
			if (!str) return "";
			return str
				.replace(/\u202F|\u00A0/g, " ") // narrow & normal non-breaking spaces
				.replace(/–|—/g, "-") // en/em dash → hyphen
				.trim();
		};

		const extractTimeRange = (dayString) => {
			if (!dayString) return null;
			const normalized = normalize(dayString);
			if (/open 24 hours/i.test(normalized)) return "24H"; // special case
			const parts = normalized.split(": ");
			return parts[1] || null; // returns null if no time part
		};

		const toMinutes = (time) => {
			if (!time) return null;
			time = normalize(time);

			if (time.includes("AM") || time.includes("PM")) {
				const [clock, meridiem] = time.split(" ");
				let [h, m] = clock.split(":").map(Number);
				if (meridiem === "PM" && h !== 12) h += 12;
				if (meridiem === "AM" && h === 12) h = 0;
				return h * 60 + m;
			}

			// 24-hour format
			const [h, m] = time.split(":").map(Number);
			return h * 60 + m;
		};

		const to12Hour = (minutes) => {
			if (minutes == null) return "";
			let h = Math.floor(minutes / 60);
			const m = minutes % 60;
			const ampm = h >= 12 ? "PM" : "AM";
			h = h % 12 || 12;
			return `${h}:${m.toString().padStart(2, "0")}${ampm}`;
		};

		const ranges = weekdayText
			.map(extractTimeRange)
			.filter((r) => r && !r.toLowerCase().includes("closed"));
		if (!ranges.length) return null;
		// handle 24 hours
		if (ranges.includes("24H")) return "0-24";

		const allSame = ranges.every((r) => r === ranges[0]);
		if (allSame) {
			const [open, close] = normalize(ranges[0]).split(/\s*-\s*/);
			return `${to12Hour(toMinutes(open))} - ${to12Hour(toMinutes(close))}`;
		}

		let earliest = Infinity;
		let latest = -Infinity;

		ranges.forEach((range) => {
			if (!range) return;
			const [open, close] = normalize(range).split(/\s*-\s*/);
			const openMin = toMinutes(open);
			const closeMin = toMinutes(close);
			if (openMin != null) earliest = Math.min(earliest, openMin);
			if (closeMin != null) latest = Math.max(latest, closeMin);
		});

		if (!isFinite(earliest) || !isFinite(latest)) return null;

		return `${to12Hour(earliest)} - ${to12Hour(latest)}`;
	}
	const handleChangeAddress = (newAddress) => {
		setAddress(newAddress);
	};
	const handleSelectAddress = async (newAddress) => {
		try {
			setAddress(newAddress);
			const results = await geocodeByAddress(newAddress);
			const placeId = results[0]?.place_id;
			const placeRef = new window.google.maps.places.Place({
				id: placeId,
			});

			const { place } = await placeRef.fetchFields({
				fields: [
					"addressComponents",
					"displayName",
					"formattedAddress",
					"location",
					"postalAddress",
					"rating",
					"regularOpeningHours",
					"websiteURI",
					"nationalPhoneNumber",
					"internationalPhoneNumber",
					"photos",
				],
			});
			const formattedPlace = {
				name: place?.displayName ?? "",
				address: place?.formattedAddress ?? "",
				location: {
					lat: place?.location?.lat?.() ?? 0,
					lng: place?.location?.lng?.() ?? 0,
				},
				openingHours: place?.regularOpeningHours?.weekdayDescriptions ?? [],
				website: place?.websiteURI ?? null,
				phone:
					place?.nationalPhoneNumber ?? place?.internationalPhoneNumber ?? null,
				city:
					place?.postalAddress?.locality ??
					place?.addressComponents?.find((comp) =>
						comp?.types?.includes("locality"),
					)?.longText ??
					"",
				photosCount: place?.photos?.length ?? 0,
			};
			const currentCity =
				formattedPlace?.city ??
				results[0]?.address_components?.find((comp) =>
					comp?.types?.includes("locality"),
				)?.long_name ??
				"";
			const finalFormat = place?.photos
				?.map((photo) => photo?.getURI?.({ maxWidth: 800 }))
				?.filter((dat) => dat?.length > 0);
			const formaatedImageUrl =
				finalFormat?.length > 0
					? finalFormat?.length > 5
						? finalFormat?.slice(0, 5)
						: finalFormat
					: [];
			const finalData = {
				address: formattedPlace?.address ?? results[0]?.formatted_address ?? "",
				description:
					formattedPlace?.address ?? results[0]?.formatted_address ?? "",
				coords: {
					lat:
						formattedPlace?.location?.lat ??
						results[0]?.geometry?.location?.lat() ??
						0,
					lng:
						formattedPlace?.location?.lng ??
						results[0]?.geometry?.location?.lng() ??
						0,
				},
				name: formattedPlace?.name ?? "",
				openingHours:
					getUnifiedOpeningHours(formattedPlace?.openingHours)?.toLowerCase() ??
					"",
				website: formattedPlace?.website ?? "",
				phone: formattedPlace?.phone ?? "",
				city: currentCity ?? "",
				images: formaatedImageUrl ?? [],
			};
			setselectedData(finalData);
		} catch (error) {
			const formattedError = typeof error === "string" ? error : error?.message;
			toast.error(formattedError);
		}
	};
	const onSubmitFun = async () => {
		if (selectedData?.name?.length <= 0 || selectedData?.address?.length <= 0) {
			return;
		}
		onSelectedValueFun?.(selectedData);
	};
	return (
		<div className="w-full max-w-[650px] gap-8 mx-auto flex flex-col">
			<p className="text-xl font-bold text-gray">
				You can add spot by uploading the csv/excel file or by entering the
				location also
			</p>
			<div className="flex w-full gap-4 flex-col">
				{!csvSummary && (
					<div>
						<input
							type="file"
							accept=".csv"
							ref={fileInputRef}
							onChange={handleCsvImport}
							style={{ display: "none" }}
						/>
						<button
							onClick={() => fileInputRef.current.click()}
							className="px-8 py-2 bg-blue-500 text-white rounded-full">
							Upload CSV
						</button>
					</div>
				)}
				{csvSummary && (
					<div className="flex w-full flex-col">
						<h3 className="font-semibold mb-2">CSV Import Summary</h3>

						<p className="font-bold text-black">
							Total Rows: {csvSummary.total}
						</p>
						<p className="text-green-darker font-bold">
							Valid Rows: {csvSummary.valid}
						</p>
						<p className="text-red font-bold">
							Invalid Rows: {csvSummary.invalid}
						</p>

						{invalidRows.length > 0 && (
							<div className="mt-3 max-h-40 overflow-auto text-sm">
								{invalidRows.slice(0, 10).map((row) => (
									<div
										className="text-red font-medium"
										key={row.row}>
										Row {row.row} ({row.name || "Unnamed"}) — {row.reason}
									</div>
								))}
							</div>
						)}

						<div className="flex gap-3 mt-4">
							<button
								onClick={importValidRows}
								disabled={validRows.length === 0}
								className="btn btn--primary disabled:opacity-50">
								Import Valid Rows
							</button>

							<button
								onClick={resetFunction}
								className="btn btn--danger bg-red text-white">
								Cancel
							</button>
						</div>
					</div>
				)}
			</div>
			{!csvSummary && (
				<div className="p-4 flex flex-col items-center justify-center text-base text-gray border-2 border-r-0 border-l-0">
					or
				</div>
			)}

			{!csvSummary && (
				<div className="flex w-full flex-col">
					<div className="field-wrapper">
						<label
							className="field-label"
							htmlFor="productName">
							Spot Address (at least 10 letters)
						</label>
						<PlacesAutocomplete
							value={address}
							onChange={handleChangeAddress}
							onSelect={handleSelectAddress}>
							{({
								getInputProps,
								suggestions,
								getSuggestionItemProps,
								loading,
							}) => (
								<div>
									<div
										className={`flex flex-row items-center gap-2 !px-[15px] justify-start ${classNames("field-input")}`}>
										<input
											{...getInputProps({
												placeholder: "Search Places ...",
												className: "h-full !px-0 flex-1 !outline-none",
											})}
										/>
										{loading && (
											<div className="w-[20px] h-[30px] flex flex-col items-center justify-center text-accent">
												<img
													className="w-full h-full object-contain"
													src="loading2.gif"
													alt="loading"
												/>
											</div>
										)}
									</div>

									{suggestions?.length > 0 && (
										<div className="mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
											{suggestions?.map((suggestion, index) => {
												const active = suggestion.active;
												return (
													<div
														key={suggestion.placeId + index}
														{...getSuggestionItemProps(suggestion)}
														className={`px-4 py-3 text-sm cursor-pointer transition 
                        ${
													active
														? "bg-blue-50 text-blue-700"
														: "hover:bg-gray-100"
												}`}>
														<span>{suggestion.description}</span>
													</div>
												);
											})}
										</div>
									)}
								</div>
							)}
						</PlacesAutocomplete>
					</div>
					<button
						disabled={
							selectedData?.name?.length <= 0 ||
							selectedData?.address?.length <= 0
						}
						onClick={onSubmitFun}
						type="button"
						className="btn mt-5 btn--primary max-w-[150px]">
						Next
					</button>
				</div>
			)}
		</div>
	);
}
export default LocationInput;
