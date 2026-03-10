import React, { useEffect, useState } from "react";
import AddSpotInput from "./AddSpotInput";
import DropFiles from "./DropFiles";
import { uploadImageFun } from "../firebase/firebaseInit";
import { toast } from "react-toastify";

const UpdateImageAd = ({ dbImage, externalWebLink, handlePublish }) => {
	const [formDataWebLink, setformDataWebLink] = useState("");
	const [formImahge, setformImahge] = useState(null);
	const handlePublishInnerFun = async (e) => {
		e.preventDefault();
		const urlRegex =
			/^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

		const isValidExternalLink = urlRegex.test(
			`${formDataWebLink}`?.toLowerCase(),
		);
		if (formDataWebLink?.length > 0 && !isValidExternalLink) {
			toast.error("Please enter valid external website url.");
			return;
		}
		const resultImageLink =
			formImahge && typeof formImahge === "object"
				? await uploadImageFun(formImahge)
				: dbImage;

		await handlePublish({
			image: resultImageLink,
			externalWeb: formDataWebLink,
		});
		setformDataWebLink("");
		setformImahge(null);
	};
	useEffect(() => {
		if (externalWebLink?.length > 0) {
			setformDataWebLink(externalWebLink);
		}
	}, [externalWebLink]);

	return (
		<form
			onSubmit={handlePublishInnerFun}
			className="grid w-full max-w-[650px] mx-auto grid-cols-1">
			<div className="grid grid-cols-1 gap-y-4 gap-x-2">
				<div className="h-[120px] w-full flex flex-col  items-center rounded-md overflow-hidden justify-center">
					<img
						className="w-full h-full object-contain"
						src={
							formImahge && typeof formImahge === "object"
								? URL.createObjectURL(formImahge)
								: `${dbImage}`
						}
						alt={"AD"}
					/>
				</div>
				<DropFiles
					type="image"
					multiple={false}
					onChange={(e) => setformImahge(e[0])}
					wrapperClass="flex justify-center h-[3rem] mt-[-15px] gap-2 px-8 items-center btn--primary rounded-[20px] mx-auto">
					Change Image
				</DropFiles>
				<AddSpotInput
					id={"spotName"}
					value={formDataWebLink}
					onChangeValue={(value) => setformDataWebLink(value)}
					placeholder={"http://"}
					title={"External Weblink (Opens whrn user click on AD)"}
				/>
				<button
					type="submit"
					className="btn mt-5 btn--primary max-w-[150px]">
					Update
				</button>
			</div>
		</form>
	);
};

export default UpdateImageAd;
