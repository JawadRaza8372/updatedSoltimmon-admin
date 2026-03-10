import {
	deleteSpotFirebaseFn,
	getSpotFirebaseFn,
	updateSpotFirebaseFn,
} from "../firebase/realtimeFn";
import React from "react";
import { useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { setSpots } from "../store/reducer";
import binIcon from "@assets/bin-icon.png";
import tickIcon from "@assets/tick.png";
import crossIcon from "@assets/reject.png";
import CustomTooltip from "@ui/CustomTooltip";

const MarkerButtons = ({ status, id, data }) => {
	const dispatch = useDispatch();
	const deleteMarker = async (uid) => {
		if (!window.confirm(`Are you sure you want to delete Spot?`)) {
			return;
		} else {
			await deleteSpotFirebaseFn(uid)
				.then(async () => {
					await getSpotFirebaseFn()
						.then((data) => {
							dispatch(setSpots({ spots: data }));
						})
						.catch((err) => {
							toast.error("Error white fetching spots");
						});
					toast.success("Spot Deleted");
				})
				.catch((e) => {
					toast.error(`Error: ${e}`);
				});
		}
	};
	const markActiveMarker = async (uid) => {
		if (!window.confirm(`Are you sure you want to mark spot as ACTIVE?`)) {
			return;
		} else {
			await updateSpotFirebaseFn(uid, { ...data, status: "active" })
				.then(async () => {
					await getSpotFirebaseFn()
						.then((data) => {
							dispatch(setSpots({ spots: data }));
						})
						.catch((err) => {
							toast.error("Error white fetching spots");
						});
					toast.success("Spot Updated");
				})
				.catch((e) => {
					toast.error(`Error: ${e}`);
				});
		}
	};
	const markInactiveMarker = async (uid) => {
		if (!window.confirm(`Are you sure you want to mark spot as INACTIVE?`)) {
			return;
		} else {
			await updateSpotFirebaseFn(uid, { ...data, status: "inactive" })
				.then(async () => {
					await getSpotFirebaseFn()
						.then((data) => {
							dispatch(setSpots({ spots: data }));
						})
						.catch((err) => {
							toast.error("Error white fetching spots");
						});
					toast.success("Spot Updated");
				})
				.catch((e) => {
					toast.error(`Error: ${e}`);
				});
		}
	};
	return (
		<div className="flex flex-row items-center justify-end gap-4">
			<CustomTooltip title={"Update"}>
				<NavLink to={`/updateSpot/${id}`}>
					<i className="icon icon-pen-to-square-regular text-lg leading-none" />
				</NavLink>
			</CustomTooltip>
			{status !== "active" && (
				<CustomTooltip title={"Mark Active"}>
					<div
						onClick={() => markActiveMarker(id)}
						className="cursor-pointer"
						aria-label="active">
						<img
							src={tickIcon}
							className="w-[20px] h-[20px] object-contain"
							alt="bin"
						/>
					</div>
				</CustomTooltip>
			)}
			{status !== "inactive" && (
				<CustomTooltip title={"Mark Inactive"}>
					<div
						onClick={() => markInactiveMarker(id)}
						className="cursor-pointer"
						aria-label="inactive">
						<img
							src={crossIcon}
							className="w-[20px] h-[20px] object-contain"
							alt="bin"
						/>
					</div>
				</CustomTooltip>
			)}

			<CustomTooltip title={"delete"}>
				<div
					onClick={() => deleteMarker(id)}
					className="cursor-pointer"
					aria-label="delete">
					<img
						src={binIcon}
						className="w-[20px] h-[20px] object-contain"
						alt="bin"
					/>
				</div>
			</CustomTooltip>
		</div>
	);
};

export default MarkerButtons;
