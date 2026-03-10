// components
import Collapse from "@mui/material/Collapse";
import binIcon from "@assets/bin-icon.png";
import CustomTooltip from "@ui/CustomTooltip";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import {
	deleteDocFromFirestore,
	getDataFromFirestore,
} from "../firebase/firestoreFn";
import { setContacts } from "../store/reducer";

const MobileResponsiveItem = ({
	data,
	activeCollapse,
	handleCollapse,
	setLoading,
}) => {
	const dispatch = useDispatch();
	const deleteMarker = async (uid) => {
		if (!window.confirm(`Are you sure you want to delete Contact Request?`)) {
			return;
		} else {
			setLoading(true);
			await deleteDocFromFirestore("contactUs", uid)
				.then(async () => {
					await getDataFromFirestore("contactUs")
						.then((data) => {
							dispatch(setContacts({ contacts: data }));
						})
						.catch((err) => {
							toast.err("Error while fetching data");
						});
					toast.success("Contact Request Deleted");
				})
				.catch((e) => {
					toast.error(`Error: ${e}`);
				});
			setLoading(false);
		}
	};
	return (
		<div className="card">
			<div className="flex items-center w-full gap-2.5 overflow-hidden justify-between">
				<div className="flex items-center flex-1 gap-2.5 overflow-hidden">
					{data?.images?.length > 0 ? (
						<div className="img-wrapper flex items-center justify-center !w-10 !h-10">
							<img
								className="w-full h-full object-cover"
								src={data?.images[0]}
								alt={"ImageContact"}
							/>
						</div>
					) : null}
					<div className="w-full flex flex-col gap-2 overflow-hidden">
						<h6 className="flex-1 text-base truncate">
							{data?.thoughts ?? ""}
						</h6>
						<p className="text-base font-bold">
							{data?.createdAt && dayjs(data?.createdAt).format("DD/MM/YYYY")}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<button
						className={`collapse-btn p-4 ${
							activeCollapse === data.id ? "active" : ""
						}`}
						aria-label="Toggle view"
						onClick={() => handleCollapse(data.id)}>
						<i className="icon icon-caret-down-solid" />
					</button>
					<CustomTooltip title={"delete"}>
						<div
							onClick={() => deleteMarker(data?.id)}
							className="cursor-pointer p-4"
							aria-label="delete">
							<img
								src={binIcon}
								className="w-[20px] h-[20px] object-contain"
								alt="bin"
							/>
						</div>
					</CustomTooltip>
				</div>
			</div>
			<Collapse in={activeCollapse === data.id}>
				<h4 className="font-bold my-3 text-2xl">Detials</h4>
				{data?.thoughts?.length > 0 && (
					<div className="flex flex-col  gap-2 w-full">
						<p className="font-bold text-base">User Thoughts</p>
						<p className="font-medium text-base">{data?.thoughts ?? ""}</p>
					</div>
				)}
				{data?.images?.length > 0 && (
					<div className="flex flex-col gap-2 w-full">
						<p className="font-bold text-base">Images</p>
						<div className="w-full flex flex-wrap gap-2">
							{data?.images?.map((dat, index) => (
								<div
									onClick={() => window.open(dat, "_blank")}
									key={index}
									className="w-[280px] cursor-pointer h-[280px] rounded-lg overflow-hidden">
									<img
										className="w-full h-full object-cover"
										src={dat}
										alt="selectedImage"
									/>
								</div>
							))}
						</div>
					</div>
				)}
			</Collapse>
		</div>
	);
};

export default MobileResponsiveItem;
