import CommonMap from "./CommonMap";
import { useSelector } from "react-redux";

function MapWithPaidMarkers() {
	const { clientPaidSpots } = useSelector((state) => state?.auth);

	return (
		<>
			<div
				style={{
					position: "relative",
					height: "100vh",
					overflow: "hidden",
				}}>
				<CommonMap locations={clientPaidSpots} />
			</div>
		</>
	);
}

export default MapWithPaidMarkers;
