import CommonMap from "./CommonMap";
import { useSelector } from "react-redux";

function MapWithShadows() {
	const { clientSpots } = useSelector((state) => state?.auth);

	return (
		<>
			<div
				style={{
					position: "relative",
					height: "100vh",
					overflow: "hidden",
				}}>
				<CommonMap locations={clientSpots} />
			</div>
		</>
	);
}

export default MapWithShadows;
