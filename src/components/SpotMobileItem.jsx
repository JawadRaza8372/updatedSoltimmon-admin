// components
import Collapse from "@mui/material/Collapse";
import MarkerButtons from "./MarkerButtons";

const SpotMobileItem = ({ data, activeCollapse, handleCollapse }) => {
	const { id, ...rest } = data;
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
							<td>Opening Hours:</td>
							<td>
								{data?.openingHours?.length > 0 ? data?.openingHours : "--"}
							</td>
						</tr>
						<tr>
							<td>Sun Hours:</td>
							<td>{data?.sunHours?.length > 0 ? data?.sunHours : "--"}</td>
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
							<td>Internal Note:</td>
							<td>
								{data?.internalNote?.length > 0 ? data?.internalNote : "--"}
							</td>
						</tr>
						<tr>
							<td>External Website:</td>
							<td>
								{data?.externalWebsite?.length > 0
									? data?.externalWebsite
									: "--"}
							</td>
						</tr>
						<tr>
							<td>Images:</td>
							<td>
								{data?.additionalImages?.length > 0
									? data?.additionalImages?.length
									: 0}{" "}
							</td>
						</tr>
						<tr>
							<td>Source:</td>
							<td className="text-header font-bold capitalize">
								{data?.source ?? "--"}
							</td>
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
						<tr>
							<td colSpan={2}>Coordinates:</td>
						</tr>
						<tr>
							<td>Lat:</td>
							<td>{data?.lat ?? "--"}</td>
						</tr>
						<tr>
							<td>Lng:</td>
							<td>{data?.lng ?? "--"}</td>
						</tr>

						<tr>
							<td colSpan={2}>Actions</td>
						</tr>
						<tr>
							<td colSpan={2}>
								<MarkerButtons
									id={id}
									data={rest}
									status={data?.status}
								/>
							</td>
						</tr>
					</tbody>
				</table>
			</Collapse>
		</div>
	);
};

export default SpotMobileItem;
