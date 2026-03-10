import classNames from "classnames";
import React from "react";

const AddSpotInput = ({ title, value, placeholder, onChangeValue, id }) => {
	return (
		<div className="field-wrapper">
			<label
				className="field-label"
				htmlFor="productName">
				{title ?? ""}
			</label>
			<input
				className={classNames("field-input")}
				id={`${id}`}
				type="text"
				placeholder={placeholder ?? ""}
				value={value}
				onChange={(e) => onChangeValue(e.target.value)}
			/>
		</div>
	);
};

export default AddSpotInput;
