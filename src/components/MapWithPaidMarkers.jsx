import { useEffect, useState } from "react";

import { fetchLocationSpots } from "../firebase/realtimeFn";
import CommonMap from "./CommonMap";

function MapWithPaidMarkers() {
	const [locations, setLocations] = useState([]);
	const [isLoading, setisLoading] = useState(true);

	useEffect(() => {
		const fetchAllMarkers = async () => {
			const result = await fetchLocationSpots();
			setLocations(result);
			setisLoading(false);
		};
		fetchAllMarkers();
	}, []);
	return (
		<>
			<div
				style={{
					position: "relative",
					height: "100vh",
					paddingTop: "20px",
					overflow: "hidden",
				}}>
				{isLoading && (
					<div className="loadingConatiner">
						<img
							src="loading.gif"
							alt="loading"
						/>
					</div>
				)}
				<CommonMap locations={locations} />
			</div>
		</>
	);
}

export default MapWithPaidMarkers;
