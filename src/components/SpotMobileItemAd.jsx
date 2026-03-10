// components
import Collapse from "@mui/material/Collapse";
import SpotMarkerButtons from "./SpotMarkerButtons";

const SpotMobileItemAd = ({ data, activeCollapse, handleCollapse }) => {
	const id = data?.id;
	return (
		<div className="card">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2.5">
					{data?.additionalImages?.[0] ? (
						<div className="img-wrapper flex items-center justify-center w-10 h-10">
							<img
								className="max-w-[28px]"
								src={data?.additionalImages?.[0]}
								alt={data?.name}
							/>
						</div>
					) : null}
					<h6 className="max-w-[110px] truncate xs:max-w-[160px]">
						{data?.name}
					</h6>
				</div>
				<div className="flex items-center gap-4">
					<button
						className={`collapse-btn ${
							activeCollapse === data.id ? "active" : ""
						}`}
						aria-label="Toggle view"
						onClick={() => handleCollapse(data.id)}>
						<i className="icon icon-caret-down-solid" />
					</button>
					<SpotMarkerButtons id={id} />
				</div>
			</div>
			<Collapse in={activeCollapse === data.id}>
				<table className="basic-table">
					<tbody>
						<tr>
							<td>Name:</td>
							<td>{data?.name ?? "--"}</td>
						</tr>
						<tr>
							<td>Phone:</td>
							<td>{data?.phoneNumber ?? "--"}</td>
						</tr>
						<tr>
							<td>City:</td>
							<td>{data?.city?.length > 0 ? data?.city : "--"}</td>
						</tr>
						<tr>
							<td>Address:</td>
							<td>{data?.address?.length > 0 ? data?.address : "--"}</td>
						</tr>
						<tr>
							<td>Status:</td>
							<td>
								<div
									className="flex flex-col w-auto capitalize items-center text-black font-medium text-base justify-center p-3 rounded-lg"
									style={{
										backgroundColor:
											data?.status === "pending"
												? "#f9c74f"
												: data?.status === "active"
													? "#90be6d"
													: data?.status === "inactive"
														? "#f94144"
														: "white",
									}}>
									{data?.status ?? "-"}
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</Collapse>
		</div>
	);
};

export default SpotMobileItemAd;
