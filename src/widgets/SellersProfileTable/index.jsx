// components
import Spring from "@components/Spring";
import StyledTable from "./styles";
import Empty from "@components/Empty";
import SellerCollapseItem from "@components/SellerCollapseItem";

// hooks
import { useState, useEffect } from "react";
import usePagination from "@hooks/usePagination";
import { useWindowSize } from "react-use";

import { MARKERS_COLUMN_DEFS } from "@constants/columnDefs";
import Pagination from "@ui/Pagination";
import { useNavigate } from "react-router-dom";

const SellersProfileTable = ({ data }) => {
  const { width } = useWindowSize();
  const [activeCollapse, setActiveCollapse] = useState("");
  const pagination = usePagination(data?.slice(0, data?.length), 10);
  const sortedData = pagination.currentItems();
  const navigate = useNavigate();
  // reset active collapse when page or window width changes
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
      <div className="flex flex-col gap-4 mb-5 md:flex-row items-center justify-between md:mb-[30px]">
        <p className="md:text-right">View: {pagination.showingOf()}</p>
        <button
          onClick={() => navigate("/addSpot")}
          className="btn btn--primary"
        >
          Add Spot <i className="icon-circle-plus-regular" />
        </button>
      </div>
      <Spring className="flex flex-col flex-1 gap-5">
        {width >= 768 ? (
          <StyledTable
            columns={MARKERS_COLUMN_DEFS}
            dataSource={sortedData}
            locale={{
              emptyText: <Empty text="No sellers found" />,
            }}
            rowKey={(record) => record.id}
            pagination={false}
          />
        ) : (
          <div className="flex flex-col flex-1 gap-4">
            {sortedData.map((item) => (
              <SellerCollapseItem
                key={item.id}
                handleCollapse={handleCollapse}
                activeCollapse={activeCollapse}
                seller={item}
              />
            ))}
          </div>
        )}
        {pagination.maxPage > 1 && <Pagination pagination={pagination} />}
      </Spring>
    </>
  );
};

export default SellersProfileTable;
