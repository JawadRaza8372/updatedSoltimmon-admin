// components
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../layout/PageHeader";
import { toast } from "react-toastify";
import { useCallback, useEffect, useState } from "react";
import { getAdImage, updateAdImage } from "../firebase/realtimeFn";
import { setWholeAdData } from "../store/reducer";
import UpdateImageAd from "@components/UpdateImageAd";
import Pagination from "@ui/Pagination";
import usePagination from "@hooks/usePagination";
import Spring from "@components/Spring";
import StyledTable from "@styles/SpotRequestStyleTable";
import Empty from "@components/Empty";
import classNames from "classnames";
import { useWindowSize } from "react-use";
import { SPOT_MARKERS_COLUMN_DEFS } from "@constants/columnDefs";
import SpotMobileItemAd from "@components/SpotMobileItemAd";
import Select from "@ui/Select";
import Loader from "@components/Loader";

const Banners = () => {
	const { width } = useWindowSize();
	const options = [
		{ label: "Image", value: "image" },
		{ label: "Spots", value: "spot" },
		{ label: "None", value: "none" },
	];
	const [isLoadingModal, setisLoadingModal] = useState(false);
	const [activeCollapse, setActiveCollapse] = useState("");
	const [searchTerm, setsearchTerm] = useState("");
	const [currentAdType, setcurrentAdType] = useState("");
	const { wholeAdData, spots } = useSelector((state) => state.auth);
	const apotsByCategory = spots.filter((spot) => {
		const matchCategory = spot?.status === "active";

		const matchSearch =
			searchTerm === "" ||
			spot?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			spot?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			spot?.city?.toLowerCase().includes(searchTerm.toLowerCase());

		return matchCategory && matchSearch;
	});
	const pagination = usePagination(
		apotsByCategory?.slice(0, apotsByCategory?.length),
		15,
	);
	const sortedData = pagination.currentItems();
	useEffect(() => {
		setActiveCollapse("");
	}, [pagination.currentPage, width]);

	const handleCollapse = (id) => {
		if (activeCollapse === id) {
			setActiveCollapse("");
		} else {
			setActiveCollapse(id);
		}
	};

	useEffect(() => {
		if (wholeAdData) {
			setcurrentAdType(wholeAdData?.addType);
		}
	}, [wholeAdData]);

	const dispatch = useDispatch();
	const fetchAdBanner = useCallback(async () => {
		try {
			setisLoadingModal(true);
			await getAdImage().then((dat) => {
				dispatch(setWholeAdData({ wholeAdData: dat }));
			});
		} catch (error) {
			const formattedError = typeof error === "string" ? error : error?.message;
			toast.error(formattedError);
		} finally {
			setisLoadingModal(false);
		}
	}, [dispatch]);

	const hideAdfun = async () => {
		try {
			setisLoadingModal(true);
			await updateAdImage({
				addType: currentAdType ?? "none",
			});
			await fetchAdBanner();
			toast.success("AD has been hidden");
		} catch (error) {
			const formattedMessage =
				typeof error === "string" ? error : error?.message;
			toast.error(formattedMessage);
		} finally {
			setisLoadingModal(false);
		}
	};
	const updateSpotAdFun = async () => {
		try {
			setisLoadingModal(true);
			await updateAdImage({
				addType: currentAdType ?? "spot",
				imageAd: wholeAdData?.imageAd ?? "",
				imageExternalLink: wholeAdData?.imageExternalLink ?? "",
				locationAd: wholeAdData?.locationAd ?? "",
				highlightedSpots: wholeAdData?.highlightedSpots ?? [],
			});
			await fetchAdBanner();
			toast.success("AD updated");
		} catch (error) {
			const formattedMessage =
				typeof error === "string" ? error : error?.message;
			toast.error(formattedMessage);
		} finally {
			setisLoadingModal(false);
		}
	};
	const updateImageAdFun = async ({ image, externalWeb }) => {
		try {
			setisLoadingModal(true);
			await updateAdImage({
				addType: currentAdType ?? "image",
				imageAd: image,
				imageExternalLink: externalWeb,
				locationAd: wholeAdData?.locationAd ?? "",
				highlightedSpots: wholeAdData?.highlightedSpots ?? [],
			});
			await fetchAdBanner();
			toast.success("AD updated");
		} catch (error) {
			const formattedMessage =
				typeof error === "string" ? error : error?.message;
			toast.error(formattedMessage);
		} finally {
			setisLoadingModal(false);
		}
	};
	return (
		<>
			<PageHeader title="Banners" />
			{isLoadingModal ? (
				<Loader />
			) : (
				<div className="widgets-grid grid-cols-1">
					<p className="text-base md:text-xl text-black opacity-75 text-left">
						Admin Notice:
						<br />
						Only one Ad Type can be enabled at a time.
						<br />
						<br />
						<b>Image Ad:</b> Displays a normal advertisement image with a
						website link.
						<br />
						<b>Spot Ad:</b> Allows you to highlight a location on the map or
						remove the highlight.
						<br />
						<b>None:</b> No advertisement will be applied.
						<br />
						<br />
						After changing the Ad Type or modifying its settings, you must click
						the "Update" button for the changes to take effect.
						<br />
						Please make sure to finalize your selection and then click Update
						every time you make a change.
					</p>

					<div className="w-full max-w-[580px] mx-auto field-wrapper">
						<p className="text-base md:text-xl text-red font-bold text-left">
							Current AD type:{" "}
							{
								options?.find((dat) => dat?.value === wholeAdData?.addType)
									?.label
							}
						</p>
						<label
							className="field-label"
							htmlFor="adType">
							AD type
						</label>
						<Select
							id="adType"
							value={options?.find((dat) => dat?.value === currentAdType)}
							onChange={(value) => setcurrentAdType(value?.value)}
							options={options}
						/>
					</div>

					{currentAdType === "none" && (
						<div className="w-full min-h-[250px] flex flex-col items-center justify-center gap-4">
							<p className="text-lg md:text-3xl text-black opacity-75 text-center">
								Please click on below button
								<br />
								if you want to hide the ADs on the app
							</p>
							<button
								onClick={hideAdfun}
								type="button"
								className="btn mt-5 btn--primary max-w-[150px]">
								Update
							</button>
						</div>
					)}
					{currentAdType === "image" && (
						<UpdateImageAd
							dbImage={wholeAdData?.imageAd}
							externalWebLink={wholeAdData?.imageExternalLink}
							handlePublish={updateImageAdFun}
						/>
					)}
					{currentAdType === "spot" && (
						<>
							<div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-3 mb-5 md:mb-[30px]">
								<div className="field-wrapper">
									<label
										className="field-label"
										htmlFor="spotName">
										Search by Name/Address
									</label>
									<input
										className={classNames("field-input")}
										id="spotName"
										type="text"
										placeholder="Enter Spot Name or address"
										value={searchTerm}
										onChange={(e) => setsearchTerm(e.target.value)}
									/>
								</div>
								<div className="field-wrapper">
									<label
										className="field-label opacity-0"
										htmlFor="brandName">
										D
									</label>
									<button
										onClick={updateSpotAdFun}
										type="button"
										className="btn btn--primary max-w-[150px]">
										Update
									</button>
								</div>
								<div className="field-wrapper">
									<label
										className="field-label opacity-0"
										htmlFor="brandName">
										D
									</label>
								</div>
							</div>
							<Spring className="flex flex-col flex-1 gap-5">
								{width >= 768 ? (
									<StyledTable
										columns={SPOT_MARKERS_COLUMN_DEFS}
										dataSource={sortedData}
										locale={{
											emptyText: <Empty text="No Spot Requests found" />,
										}}
										rowKey={(record) => record.id}
										pagination={false}
									/>
								) : (
									<div className="flex flex-col flex-1 gap-4">
										{sortedData.map((item) => (
											<SpotMobileItemAd
												handleCollapse={handleCollapse}
												activeCollapse={activeCollapse}
												data={item}
												key={item.id}
											/>
										))}
									</div>
								)}
								{pagination.maxPage > 1 && (
									<Pagination pagination={pagination} />
								)}
							</Spring>
						</>
					)}
				</div>
			)}
		</>
	);
};

export default Banners;
