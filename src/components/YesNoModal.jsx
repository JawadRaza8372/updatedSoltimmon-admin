import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useSearchParams } from "react-router-dom";
import jsonLang from "../assets/translation.json";

const YesNoModal = ({ open, title, subTitle, onYes, onNo }) => {
	const [searchParams] = useSearchParams();
	const currentLang = searchParams.get("lang") ?? "en";
	const textStrings = currentLang === "en" ? jsonLang.en : jsonLang.sw;
	return (
		<Dialog
			open={open}
			onClose={() => null}
			PaperProps={{
				sx: {
					backgroundColor: "#ffffff",
				},
			}}>
			<DialogTitle style={{ color: "#000000" }}>{title || ""}</DialogTitle>
			<DialogContent style={{ color: "#969696" }}>
				{subTitle || ""}
			</DialogContent>

			{(onYes || onNo) && (
				<DialogActions
					sx={{
						display: "flex",
						justifyContent: "flex-end",
						px: 3,
						pb: 3,
						gap: 3,
					}}>
					{onNo && (
						<button
							onClick={onNo}
							style={{
								backgroundColor: "transparent",
								color: "#589ff8",
								border: "1px solid #589ff8",
								height: "45px",
								borderRadius: "15px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
								outline: "0px",
								width: "100%",
								maxWidth: "180px",
								fontSize: "14px",
								fontWeight: "bold",
							}}>
							{textStrings?.cancel}
						</button>
					)}
					{onYes && (
						<button
							onClick={onYes}
							style={{
								background: "#589ff8",
								color: "#ffffff",
								height: "45px",
								borderRadius: "15px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
								outline: "0px",
								border: "1px solid #589ff8",
								width: "100%",
								maxWidth: "180px",
								fontSize: "14px",
								fontWeight: "bold",
							}}>
							{textStrings?.continue}
						</button>
					)}
				</DialogActions>
			)}
		</Dialog>
	);
};

export default YesNoModal;
