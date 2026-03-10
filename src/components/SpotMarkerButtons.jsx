import { getAdImage, updateAdImage } from "../firebase/realtimeFn";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setWholeAdData } from "../store/reducer";
import binIcon from "@assets/bin-icon.png";
import CustomTooltip from "@ui/CustomTooltip";

const SpotMarkerButtons = ({ id }) => {
	const { wholeAdData } = useSelector((state) => state.auth);
	const isCurrentHighlighted = wholeAdData?.highlightedSpots?.find(
		(dat) => dat === id,
	)
		? true
		: false;

	const dispatch = useDispatch();
	const fetchAdBanner = async () => {
		try {
			await getAdImage().then((dat) => {
				dispatch(setWholeAdData({ wholeAdData: { ...dat, addType: "spot" } }));
			});
		} catch (error) {
			const formattedError = typeof error === "string" ? error : error?.message;
			toast.error(formattedError);
		} finally {
		}
	};
	const deleteMarker = async (uid) => {
		if (!window.confirm(`Are you sure you want to delete Spot?`)) {
			return;
		} else {
			const updatedSpots = wholeAdData?.highlightedSpots?.filter(
				(dat) => dat !== uid,
			);
			await updateAdImage({
				highlightedSpots: updatedSpots,
			})
				.then(async () => {
					await fetchAdBanner();
					toast.success("Highlighted Spots Updated");
				})
				.catch((e) => {
					toast.error(`Error: ${e}`);
				});
		}
	};
	const addMarker = async (uid) => {
		if (!window.confirm(`Are you sure you want to add this`)) {
			return;
		} else {
			const updatedSpots = [...(wholeAdData?.highlightedSpots ?? []), uid];
			await updateAdImage({
				highlightedSpots: updatedSpots,
			})
				.then(async () => {
					await fetchAdBanner();
					toast.success("Highlighted Spots Updated");
				})
				.catch((e) => {
					toast.error(`Error: ${e}`);
				});
		}
	};
	return (
		<div className="flex flex-row items-center justify-end gap-4">
			{isCurrentHighlighted ? (
				<CustomTooltip title={"Remove"}>
					<div
						onClick={() => deleteMarker(id)}
						className="cursor-pointer"
						aria-label="remove">
						<img
							src={binIcon}
							className="w-[25px] h-[25px] object-contain"
							alt="bin"
						/>
					</div>
				</CustomTooltip>
			) : (
				<CustomTooltip title={"Add"}>
					<div
						onClick={() => addMarker(id)}
						className="cursor-pointer"
						aria-label="add">
						<i
							className="icon-circle-plus-regular"
							style={{ fontSize: "25px" }}
						/>
					</div>
				</CustomTooltip>
			)}
		</div>
	);
};

export default SpotMarkerButtons;
