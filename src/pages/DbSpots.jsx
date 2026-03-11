// components
import PageHeader from "@layout/PageHeader";
import Spring from "@components/Spring";
import StyledTable from "@styles/SpotRequestStyleTable";
import Empty from "@components/Empty";
import { useState, useEffect } from "react";
import usePagination from "@hooks/usePagination";
import { useWindowSize } from "react-use";
import { MARKERS_COLUMN_DEFS } from "@constants/columnDefs";
import Select from "@ui/Select";
import Pagination from "@ui/Pagination";
import { useSelector } from "react-redux";
import SpotMobileItem from "@components/SpotMobileItem";
import classNames from "classnames";

const DbSpots = () => {
	const options = [
		{ label: "All", value: "all" },
		{ label: "Pending", value: "pending" },
		{ label: "Active", value: "active" },
		{ label: "Inactive", value: "inactive" },
	];
	const { width } = useWindowSize();
	const { spots } = useSelector((state) => state?.auth);
	const [activeCollapse, setActiveCollapse] = useState("");
	const [searchTerm, setsearchTerm] = useState("");
	const [category, setCategory] = useState(options[0]);

	const apotsByCategory = spots.filter((spot) => {
		const matchCategory =
			category.value === "all" || spot?.status === category.value;

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

	return (
		<>
			<PageHeader title="Spots" />
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
						className="field-label"
						htmlFor="brandName">
						Search by Status
					</label>
					<Select
						id="brandName"
						value={category}
						onChange={setCategory}
						options={options}
					/>
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
						columns={MARKERS_COLUMN_DEFS}
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
							<SpotMobileItem
								handleCollapse={handleCollapse}
								activeCollapse={activeCollapse}
								data={item}
								key={item.id}
							/>
						))}
					</div>
				)}
				{pagination.maxPage > 1 && <Pagination pagination={pagination} />}
			</Spring>
		</>
	);
};

export default DbSpots;
