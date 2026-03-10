// components
import binIcon from "@assets/bin-icon.png";
// utils
import dayjs from "dayjs";
import {
	deleteSpotFirebaseFn,
	getSpotFirebaseFn,
} from "../firebase/realtimeFn";
import store from "../store/store";
import { setContacts, setSpotRequests, setSpots } from "../store/reducer";
import { toast } from "react-toastify";
import {
	deleteDocFromFirestore,
	getDataFromFirestore,
} from "../firebase/firestoreFn";
import MarkerButtons from "@components/MarkerButtons";
import SpotMarkerButtons from "@components/SpotMarkerButtons";

export const MARKERS_COLUMN_DEFS = [
	{
		title: (
			<div className="flex mr-1 items-center justify-start">
				<i className="icon-image-regular text-[26px]" />
			</div>
		),
		render: (data) => {
			return (
				<div className="img-wrapper w-[45px] h-[45px] mr-1 flex items-center justify-center">
					<img
						src={`${data?.additionalImages?.[0]}`}
						className="w-[100%] h-[100%] object-cover"
						alt="product"
					/>
				</div>
			);
		},
	},
	{
		title: "Spot Info",
		render: (data) => {
			return (
				<div className="flex flex-col gap-1 w-full max-w-[280px]">
					<span className="">
						<span className="font-bold text-header">Name:</span>{" "}
						{data?.name ?? "--"}
					</span>
					<span className="truncate">
						<span className="font-bold text-header">Phone:</span>{" "}
						{data?.phoneNumber ?? "--"}
					</span>
					<span className="truncate">
						<span className="font-bold text-header">Opening Hours:</span>{" "}
						{data?.openingHours?.length > 0 ? data?.openingHours : "--"}
					</span>
					<span className="truncate">
						<span className="font-bold text-header">Sun Hours:</span>{" "}
						{data?.sunHours?.length > 0 ? data?.sunHours : "--"}
					</span>
					<span className="truncate">
						<span className="font-bold text-header">City:</span>{" "}
						{data?.city ?? "--"}
					</span>
					<span className="">
						<span className="font-bold text-header">Address:</span>{" "}
						{data?.address?.length > 0 ? data?.address : "--"}
					</span>
				</div>
			);
		},
	},
	{
		title: "Extra Info",
		render: (data) => {
			return (
				<div className="flex flex-col gap-1 w-full max-w-[280px]">
					<span className="truncate">
						<span className="font-bold text-header">Internal Note:</span>{" "}
						{data?.internalNote?.length > 0 ? data?.internalNote : "--"}
					</span>
					<span className="truncate">
						<span className="font-bold text-header">External Website:</span>{" "}
						{data?.externalWebsite?.length > 0 ? data?.externalWebsite : "--"}
					</span>
					<span className="truncate">
						<span className="font-bold text-header">Images:</span>{" "}
						{data?.additionalImages?.length > 0
							? data?.additionalImages?.length
							: 0}
					</span>
					<span className="font-bold text-header">Coordinates: </span>
					<div className="flex flex-col gap-[10px]">
						<span>
							<span className="underline">Lat:</span> {data?.lat ?? "--"}
						</span>
						<span>
							<span className="underline">Lng:</span> {data?.lng ?? "-"}
						</span>
					</div>
				</div>
			);
		},
	},
	// {
	// 	title: "Description",
	// 	dataIndex: "description",
	// 	width: 150,
	// 	render: (data) => {
	// 		return (
	// 			<div className="flex flex-col gap-1 w-full max-w-[350px]">
	// 				<span className="">{data ?? "-"}</span>
	// 			</div>
	// 		);
	// 	},
	// },
	{
		title: "Source",
		dataIndex: "source",
		render: (data) => {
			return (
				<div className="flex flex-col gap-1 w-full max-w-[350px]">
					<span className="text-header font-bold capitalize">
						{data ?? "-"}
					</span>
				</div>
			);
		},
	},
	{
		title: "Status",
		dataIndex: "status",
		render: (data) => {
			return (
				<div
					className="flex flex-col w-auto capitalize items-center text-black font-medium text-base justify-center p-3 rounded-lg"
					style={{
						backgroundColor:
							data === "pending"
								? "#f9c74f"
								: data === "active"
									? "#90be6d"
									: data === "inactive"
										? "#f94144"
										: "white",
					}}>
					{data ?? "-"}
				</div>
			);
		},
	},
	{
		title: "Actions",
		render: (data) => {
			const { id, ...rest } = data;
			return (
				<MarkerButtons
					id={id}
					status={data?.status}
					data={rest}
				/>
			);
		},
	},
];
export const SPOT_MARKERS_COLUMN_DEFS = [
	{
		title: (
			<div className="flex mr-1 items-center justify-start">
				<i className="icon-image-regular text-[26px]" />
			</div>
		),
		render: (data) => {
			return (
				<div className="img-wrapper w-[45px] h-[45px] mr-1 flex items-center justify-center">
					<img
						src={`${data?.additionalImages?.[0]}`}
						className="w-[100%] h-[100%] object-cover"
						alt="product"
					/>
				</div>
			);
		},
	},
	{
		title: "Spot Info",
		render: (data) => {
			return (
				<div className="flex flex-col gap-1 w-full max-w-[280px]">
					<span className="">
						<span className="font-bold text-header">Name:</span>{" "}
						{data?.name ?? "--"}
					</span>
					<span className="truncate">
						<span className="font-bold text-header">Phone:</span>{" "}
						{data?.phoneNumber ?? "--"}
					</span>
					<span className="truncate">
						<span className="font-bold text-header">City:</span>{" "}
						{data?.city ?? "--"}
					</span>
					<span className="">
						<span className="font-bold text-header">Address:</span>{" "}
						{data?.address?.length > 0 ? data?.address : "--"}
					</span>
				</div>
			);
		},
	},
	{
		title: "Status",
		dataIndex: "status",
		render: (data) => {
			return (
				<div
					className="flex flex-col w-auto capitalize items-center text-black font-medium text-base justify-center p-3 rounded-lg"
					style={{
						backgroundColor:
							data === "pending"
								? "#f9c74f"
								: data === "active"
									? "#90be6d"
									: data === "inactive"
										? "#f94144"
										: "white",
					}}>
					{data ?? "-"}
				</div>
			);
		},
	},
	{
		title: "Actions",
		render: (data) => {
			return <SpotMarkerButtons id={data?.id} />;
		},
	},
];
export const MARKERS_COLUMN_DEFS_MOB = {
	headerImage: null,
	headerTitle: "name",
	fields: [
		{
			title: "Spot Name",
			dataIndex: "name",
		},
		{ title: "Address", dataIndex: "adress" },
		{
			title: "Latitude",
			dataIndex: "lat",
		},
		{
			title: "Longitude",
			dataIndex: "lng",
		},
		{
			title: "Link",
			btnTitle: "Learn More",
			type: "btn",
			dataIndex: "link",
			onClickFun: (link) => window.open(link, "_blank"),
		},
	],
	actions: [
		{
			icon: (
				<img
					src={binIcon}
					className="w-[20px] h-[20px] object-contain"
					alt="bin"
				/>
			),
			onClickFun: async (uid) => {
				if (!window.confirm(`Are you sure you want to delete Spot?`)) {
					return;
				} else {
					await deleteSpotFirebaseFn(uid)
						.then(async () => {
							await getSpotFirebaseFn()
								.then((data) => {
									store.dispatch(setSpots({ spots: data }));
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
			},
		},
		{
			icon: (
				<i className="icon icon-pen-to-square-regular text-lg leading-none" />
			),
			onClickFun: async (uid) => {
				window.open(`${window.location.origin}/updateSpot/${uid}`);
			},
		},
	],
};
export const SPOT_REQUEST_COLUMN_DEFS = [
	{
		title: (
			<div className="flex mr-1 items-center justify-center">
				<i className="icon-image-regular text-[26px]" />
			</div>
		),
		dataIndex: "image",
		width: 45,
		render: (image) => {
			return (
				<div className="img-wrapper w-[45px] h-[45px] mr-1 flex items-center justify-center">
					<img
						src={`${image}`}
						alt="product"
					/>
				</div>
			);
		},
	},
	{
		title: "Spot Name",
		dataIndex: "name",
		render: (text) => (
			<span className="inline-block h6 !text-sm max-w-[155px]">{text}</span>
		),
	},
	{ title: "Sun Hours", dataIndex: "sunHours" },
	{ title: "Discription", dataIndex: "discript" },
	{ title: "Address", dataIndex: "address" },
	{
		title: "Date",
		dataIndex: "createdAt",
		render: (date) => (
			<span className="font-bold text-header">
				{date && dayjs(date).format("DD/MM/YYYY")}
			</span>
		),
		responsive: ["lg"],
	},
	{
		title: "Actions",
		dataIndex: "id",
		render: (id) => {
			const deleteMarker = async (uid) => {
				if (!window.confirm(`Are you sure you want to delete Spot Request?`)) {
					return;
				} else {
					await deleteDocFromFirestore("addSpot", uid)
						.then(async () => {
							await getDataFromFirestore("addSpot")
								.then((data) => {
									store.dispatch(setSpotRequests({ spotRequests: data }));
								})
								.catch((err) => {
									toast.err("Error while fetching data");
								});
							toast.success("Spot Request Deleted");
						})
						.catch((e) => {
							toast.error(`Error: ${e}`);
						});
				}
			};
			return (
				<div className="flex items-center justify-end gap-11">
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
				</div>
			);
		},
	},
];
export const SPOT_REQUEST_COLUMN_DEFS_MOB = {
	headerImage: "image",
	headerTitle: "name",
	fields: [
		{
			title: "Spot Name",
			dataIndex: "name",
		},
		{ title: "Sun Hours", dataIndex: "sunHours" },
		{ title: "Discription", dataIndex: "discript" },
		{ title: "Address", dataIndex: "address" },
		{
			title: "Date",
			dataIndex: "createdAt",
			type: "date",
		},
	],
	actions: [
		{
			icon: (
				<img
					src={binIcon}
					className="w-[20px] h-[20px] object-contain"
					alt="bin"
				/>
			),
			onClickFun: async (uid) => {
				if (!window.confirm(`Are you sure you want to delete Spot Request?`)) {
					return;
				} else {
					await deleteDocFromFirestore("addSpot", uid)
						.then(async () => {
							await getDataFromFirestore("addSpot")
								.then((data) => {
									store.dispatch(setSpotRequests({ spotRequests: data }));
								})
								.catch((err) => {
									toast.err("Error while fetching data");
								});
							toast.success("Spot Request Deleted");
						})
						.catch((e) => {
							toast.error(`Error: ${e}`);
						});
				}
			},
		},
	],
};
export const CONTACTS_COLUMN_DEFS = [
	{
		title: (
			<div className="flex mr-2 items-center justify-center">
				<i className="icon-image-regular text-[26px]" />
			</div>
		),
		dataIndex: "image",
		width: 45,
		render: (image) => (
			<div className="img-wrapper mr-2 w-[45px] h-[45px] flex items-center justify-center">
				<img
					src={image}
					alt="product"
				/>
			</div>
		),
	},
	{
		title: "Description",
		dataIndex: "text",
		render: (text) => (
			<span className="inline-block h6 !text-sm max-w-[155px]">{text}</span>
		),
	},
	{
		title: "Date",
		dataIndex: "createdAt",
		render: (date) => (
			<span className="font-bold text-header">
				{date && dayjs(date).format("DD/MM/YYYY")}
			</span>
		),
		responsive: ["lg"],
	},
	{
		title: "Actions",
		dataIndex: "id",
		render: (id) => {
			const deleteMarker = async (uid) => {
				if (
					!window.confirm(`Are you sure you want to delete Contact Request?`)
				) {
					return;
				} else {
					await deleteDocFromFirestore("contactUs", uid)
						.then(async () => {
							await getDataFromFirestore("contactUs")
								.then((data) => {
									store.dispatch(setContacts({ contacts: data }));
								})
								.catch((err) => {
									toast.err("Error while fetching data");
								});
							toast.success("Contact Request Deleted");
						})
						.catch((e) => {
							toast.error(`Error: ${e}`);
						});
				}
			};
			return (
				<div className="flex items-center justify-end gap-11">
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
				</div>
			);
		},
	},
];
