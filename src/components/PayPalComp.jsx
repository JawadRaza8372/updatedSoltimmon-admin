import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSearchParams } from "react-router-dom";
import jsonLang from "../assets/translation.json";
import { useState } from "react";
import {
	isPaymentUnsafeBrowser,
	redirectToSafeBrowser,
} from "../firebase/useAbleFun";
import YesNoModal from "./YesNoModal";
export default function PayPalComp() {
	const [searchParams] = useSearchParams();
	const currentLang = searchParams.get("lang") ?? "en";
	const textStrings = currentLang === "en" ? jsonLang.en : jsonLang.sw;
	const [priceValueState, setpriceValueState] = useState("");
	const [paymentStates, setpaymentStates] = useState({
		price: "",
		status: "entering",
	});
	const checkBroser = isPaymentUnsafeBrowser();

	const onFormSubmitFun = async (e) => {
		e?.preventDefault();
		setpriceValueState(paymentStates.price);
		setpaymentStates({ status: "initailizing", price: "" });
	};
	return (
		<div className="payment-container">
			<YesNoModal
				open={checkBroser}
				onYes={redirectToSafeBrowser}
				title={textStrings?.warning}
				subTitle={textStrings?.broswerIncompatible}
			/>
			<img
				className="logo"
				src="logo.png"
				alt="logo"
			/>
			<div className="textContainer">
				<h4
					style={{
						textAlign:
							paymentStates.status === "paymentSuccess" ||
							paymentStates.status === "paymentError"
								? "center"
								: "left",
					}}>
					{paymentStates.status === "paymentSuccess"
						? textStrings.paymentSuccess
						: paymentStates.status === "paymentError"
							? textStrings.paymentFailed
							: textStrings.donationTitle}
				</h4>
				{paymentStates.status !== "paymentSuccess" &&
				paymentStates.status !== "paymentError" ? (
					<p>{textStrings.donationDesc}</p>
				) : null}
			</div>
			{paymentStates.status === "initailizing" ? (
				<div className="inputMainContainer">
					<PayPalScriptProvider
						options={{
							clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID_DEV,
							currency: "USD",
							intent: "capture",
							components: "buttons",
							//disableFunding: "card",
						}}>
						<PayPalButtons
							forceReRender={[priceValueState]}
							fundingSource="paypal"
							style={{ layout: "vertical" }}
							createOrder={(data, actions) => {
								return actions.order.create({
									intent: "CAPTURE",
									purchase_units: [
										{
											amount: {
												value: priceValueState,
											},
										},
									],
								});
							}}
							onApprove={(data, actions) => {
								return actions.order.capture().then((details) => {
									setpaymentStates({ price: "", status: "paymentSuccess" });
								});
							}}
							onCancel={() => {
								setpaymentStates({
									price: "",
									status: "paymentError",
								});
							}}
							onError={(err) => {
								setpaymentStates({ price: "", status: "paymentError" });
							}}
						/>
					</PayPalScriptProvider>
				</div>
			) : paymentStates.status === "entering" ? (
				<form
					onSubmit={onFormSubmitFun}
					className="inputMainContainer">
					<label htmlFor="priceInput">{textStrings.enterAmountToDobate}</label>
					<input
						name="priceInput"
						id="priceInput"
						placeholder="0"
						type="number"
						value={paymentStates.price}
						onChange={(e) =>
							setpaymentStates({ ...paymentStates, price: e?.target?.value })
						}
					/>
					<button
						type="submit"
						className="payButton">
						{textStrings.continue}
					</button>
				</form>
			) : null}
			{paymentStates.status === "paymentError" ||
			paymentStates.status === "paymentSuccess" ? (
				<button
					onClick={() => {
						setpaymentStates({ price: "", status: "entering" });
						setpriceValueState("");
					}}
					type="button"
					className="refreshButton">
					{textStrings.continue}
				</button>
			) : null}
		</div>
	);
}
