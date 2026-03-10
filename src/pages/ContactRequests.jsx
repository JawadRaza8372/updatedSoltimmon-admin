// components
import PageHeader from "@layout/PageHeader";
import Spring from "@components/Spring";

import { useState, useEffect } from "react";
import usePagination from "@hooks/usePagination";
import { useWindowSize } from "react-use";

import Pagination from "@ui/Pagination";
import { useSelector } from "react-redux";
import MobileResponsiveItem from "@components/MobileResponsiveItem";
import Loader from "@components/Loader";

const ContactRequests = () => {
	const { width } = useWindowSize();
	const { contacts } = useSelector((state) => state?.auth);
	const [isloading, setisloading] = useState(false);
	const [activeCollapse, setActiveCollapse] = useState("");
	const pagination = usePagination(contacts?.slice(0, contacts?.length), 15);
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
			<PageHeader title="Contact Requests" />
			{isloading ? (
				<Loader />
			) : (
				<Spring className="flex flex-col flex-1 gap-5">
					<div className="flex flex-col flex-1 gap-4">
						{sortedData.map((item) => (
							<MobileResponsiveItem
								handleCollapse={handleCollapse}
								activeCollapse={activeCollapse}
								data={item}
								setLoading={setisloading}
								key={item.id}
							/>
						))}
					</div>
					{pagination.maxPage > 1 && <Pagination pagination={pagination} />}
				</Spring>
			)}
		</>
	);
};

export default ContactRequests;
