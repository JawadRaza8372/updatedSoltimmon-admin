// components
import { NavLink } from "react-router-dom";

// utils
import { memo } from "react";

// assets
import dark from "@assets/logo.png";

const Logo = ({ size, textClass, showImage }) => {
	return (
		<NavLink
			className="logo"
			to="/spots">
			{showImage && (
				<img
					style={{
						width: size ?? "40px",
						height: size ?? "40px",
						objectFit: "contain",
					}}
					src={dark}
					alt="media"
				/>
			)}
			<h4 className={`logo_text ${textClass || ""}`}>Soltimman</h4>
		</NavLink>
	);
};

export default memo(Logo);
