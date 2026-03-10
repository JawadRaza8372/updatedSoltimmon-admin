import React from "react";
import AddSpotInput from "./AddSpotInput";
import classNames from "classnames";
import Select from "@ui/Select";
import DropFiles from "./DropFiles";
import binIcon from "@assets/bin-icon.png";

const AddSpotForm = ({ formData, setformData, handlePublish }) => {
	const options = [
		{ label: "Pending", value: "pending" },
		{ label: "Active", value: "active" },
		{ label: "Inactive", value: "inactive" },
	];
	return (
		<form
			onSubmit={handlePublish}
			className="grid w-full max-w-[650px] mx-auto grid-cols-1">
			<div className="grid grid-cols-1 gap-y-4 gap-x-2">
				<div className="flex flex-col items-center justify-center">
					<DropFiles
						type="image"
						multiple={true}
						onChange={(e) =>
							setformData({ ...formData, images: [...formData?.images, ...e] })
						}
						wrapperClass="flex justify-center h-[120px] items-center w-[120px] btn--primary rounded-[120px] mx-auto">
						<i
							className="icon-circle-plus-regular"
							style={{ fontSize: "3rem" }}
						/>
					</DropFiles>
					{formData?.images?.length > 0 && (
						<div className="w-full flex flex-wrap gap-2 mt-5">
							{formData?.images?.map((dat, index) => {
								return (
									<div className="relative h-[50px] w-[50px] flex flex-col bg-[#1976d2] items-center rounded-md overflow-hidden justify-center">
										<img
											className="w-full h-full object-cover"
											src={
												typeof dat === "object"
													? URL.createObjectURL(dat)
													: `${dat}`
											}
											alt={index}
										/>
										<div
											onClick={() => {
												const filteredImage = formData?.images?.filter(
													(dat, ind) => ind !== index,
												);
												setformData({ ...formData, images: filteredImage });
											}}
											className="w-full cursor-pointer absolute top-0 left-0 h-full flex items-center justify-center"
											style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
											<img
												src={binIcon}
												className="w-[20px] h-[20px] object-contain"
												alt="bin"
											/>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
					<AddSpotInput
						id={"spotName"}
						value={formData.name}
						onChangeValue={(value) => setformData({ ...formData, name: value })}
						placeholder={"KFC"}
						title={"Spot Name"}
					/>
					<AddSpotInput
						id={"openingHours"}
						value={formData.openingHours}
						onChangeValue={(value) =>
							setformData({ ...formData, openingHours: value })
						}
						placeholder={"10am-09:30pm"}
						title={"Opening Hours"}
					/>
				</div>
				<div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
					<AddSpotInput
						id={"phoneNumber"}
						value={formData.phoneNumbeer}
						onChangeValue={(value) =>
							setformData({ ...formData, phoneNumbeer: value })
						}
						placeholder={"+xxxxxxxxx"}
						title={"Phone Number"}
					/>
					<div className="field-wrapper">
						<label
							className="field-label"
							htmlFor="status">
							Status
						</label>
						<Select
							id="status"
							value={options?.find((dat) => dat?.value === formData.status)}
							onChange={(value) =>
								setformData({ ...formData, status: value?.value })
							}
							options={options}
						/>
					</div>
				</div>
				<div className="field-wrapper">
					<label
						className="field-label"
						htmlFor="productName">
						Description
					</label>
					<textarea
						className={classNames("field-input h-[120px]")}
						id="productName"
						type="text"
						value={formData.discript}
						placeholder=""
						onChange={(e) =>
							setformData({ ...formData, discript: e.target.value })
						}
					/>
				</div>
				<div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
					<AddSpotInput
						id={"internalNote"}
						value={formData.internalNote}
						onChangeValue={(value) =>
							setformData({ ...formData, internalNote: value })
						}
						placeholder={""}
						title={"Internal Note (opional)"}
					/>
					<AddSpotInput
						id={"externalWebsite"}
						value={formData.externalWebsite}
						onChangeValue={(value) =>
							setformData({ ...formData, externalWebsite: value })
						}
						placeholder={""}
						title={"External Website (optional)"}
					/>
				</div>
				<button
					type="submit"
					className="btn mt-5 btn--primary max-w-[150px]">
					Publish
				</button>
			</div>
		</form>
	);
};

export default AddSpotForm;
