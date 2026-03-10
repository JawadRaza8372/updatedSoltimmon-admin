import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import SunCalc from "suncalc";
import { useSearchParams } from "react-router-dom";
import jsonLang from "../assets/translation.json";

const MIN_ZOOM = 11;
const MAX_ZOOM = 17;
function CommonMap({ locations }) {
	const getTodayDateString = () => {
		const dateObj = new Date();
		const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
		const day = ("0" + dateObj.getDate()).slice(-2);
		const year = dateObj.getFullYear();
		return `${year}-${month}-${day}`;
	};
	const [searchParams] = useSearchParams();
	const [sunTimes, setsunTimes] = useState({ sunSet: "", sunRise: "" });
	const currentLang = searchParams.get("lang") ?? "en";
	const textStrings = currentLang === "en" ? jsonLang.en : jsonLang.sw;
	const currentLat = searchParams.get("lat") ?? 0;
	const currentLng = searchParams.get("lng") ?? 0;
	const centerPosition =
		currentLat !== 0 && currentLng !== 0
			? [currentLng, currentLat]
			: [-74.0059, 40.7064];
	const mapRef = useRef();
	const markersRef = useRef([]);
	const mapContainerRef = useRef();
	const dateInputRef = useRef(null);

	const getCurrentSeconds = () => {
		const now = new Date();
		return now.getHours() * 3600 + now.getMinutes() * 60;
	};
	const [seconds, setSeconds] = useState(getCurrentSeconds);
	const [selectedDate, setSelectedDate] = useState(getTodayDateString());

	const secondsToTime = (sec) => {
		const h = Math.floor(sec / 3600);
		const m = Math.floor((sec % 3600) / 60);
		return { h, m };
	};
	const sendMessageToApp = (data) => {
		try {
			const formattedData =
				typeof data !== "string" ? JSON.stringify(data) : data;
			Promise.resolve().then(() => {
				window.ReactNativeWebView?.postMessage(formattedData);
			});
		} catch (error) {
			console.log("check", error);
		}
	};
	const formatTime = (sec) => {
		const { h, m } = secondsToTime(sec);
		return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
	};
	useEffect(() => {
		window.sendToApp = (data) => {
			const payload = {
				type: "OPEN_PLACE_DETAILS",
				data,
			};

			if (window.ReactNativeWebView) {
				sendMessageToApp(payload);
			}
		};

		return () => {
			delete window.sendToApp;
		};
	}, []);
	const formatDateTime = (date) =>
		`${String(date.getHours()).padStart(2, "0")}:${String(
			date.getMinutes(),
		).padStart(2, "0")}`;
	const updateSun = (map, sec) => {
		if (!map.isStyleLoaded()) return;

		const date = new Date();
		date.setHours(Math.floor(sec / 3600));
		date.setMinutes(Math.floor(sec / 60) % 60);

		const center = map.getCenter();
		const sun = SunCalc.getPosition(date, center.lat, center.lng);

		const altitude = sun.altitude;

		let brightness = 100;

		if (altitude <= 0) {
			brightness = 50;
		} else if (altitude < 0.2) {
			brightness = altitude * 250 + 50;
		} else {
			brightness = 100;
		}

		// // 🔥 Apply CSS brightness like your Leaflet code
		if (mapContainerRef.current) {
			mapContainerRef.current.style.filter = `brightness(${brightness}%)`;
		}

		// optional: keep light realistic for buildings
		const altitudeDeg = (altitude * 180) / Math.PI;
		const azimuthDeg = (sun.azimuth * 180) / Math.PI;
		map.setLight({
			anchor: "map",
			position: [1.5, 180 + azimuthDeg, 90 - altitudeDeg],
			intensity: altitude <= 0 ? 0.2 : 0.8,
			color: altitude <= 0 ? "#999" : "#ffffff",
		});
	};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: "mapbox://styles/mapbox/streets-v11",
			center: centerPosition,
			antialias: true,
			maxZoom: 17,
			minZoom: 11,
			zoom: 15,
		});
		mapRef.current.on("load", () => {
			// Add 3D buildings (same as your HTML)
			mapRef.current.addLayer(
				{
					id: "3d-buildings",
					source: "composite",
					"source-layer": "building",
					type: "fill-extrusion",
					minzoom: 10,
					paint: {
						"fill-extrusion-color": "#ddd",
						"fill-extrusion-height": ["number", ["get", "height"], 5],
						"fill-extrusion-base": ["number", ["get", "min_height"], 0],
						"fill-extrusion-opacity": 1,
					},
				},
				"road-label",
			);

			updateSun(mapRef.current, seconds);
			const center = mapRef.current.getCenter();
			const formattedDate = new Date(selectedDate);
			const times = SunCalc.getTimes(formattedDate, center.lat, center.lng);

			setsunTimes({
				sunRise: formatDateTime(times.sunriseEnd),
				sunSet: formatDateTime(times.sunsetStart),
			});
			mapRef.current.setMinZoom(MIN_ZOOM);
			mapRef.current.setMaxZoom(MAX_ZOOM);

			mapRef.current.on("zoom", () => {
				const zoom = mapRef.current.getZoom();
				const zoomMsg = document.getElementById("zoom-message");

				// Show message at MIN zoom
				if (zoom <= 13.5) {
					zoomMsg.style.display = "block";
				} else {
					zoomMsg.style.display = "none";
				}

				// Hard stop at MAX zoom
				if (zoom >= MAX_ZOOM) {
					mapRef.current.setZoom(MAX_ZOOM);
				}
			});
		});

		return () => {
			mapRef.current.remove();
		};
	}, []);
	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		if (map.isStyleLoaded()) {
			updateSun(map, seconds);
		}
	}, [seconds]);
	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		if (!map || locations?.length <= 0) return;

		markersRef.current.forEach((m) => m.remove());
		markersRef.current = [];
		locations.forEach((loc) => {
			const markerEl = document.createElement("div");
			markerEl.style.width = "40px"; // set your desired size
			markerEl.style.height = "40px";
			markerEl.style.borderRadius = "50%"; // optional, for round icons
			markerEl.style.overflow = "hidden";

			// Add the image inside the marker element
			const img = document.createElement("img");

			img.src = "new-marker-icon.png"; // your marker image
			img.style.width = "100%";
			img.style.height = "100%";
			img.style.objectFit = "contain"; // or cover if you want

			markerEl.appendChild(img);
			markerEl.addEventListener("click", () => {
				const screenWidth = window.innerWidth;

				// adjust this value if needed
				const horizontalOffset = screenWidth < 480 ? 0.00008 : 0;

				mapRef.current.flyTo({
					center: [loc.lng + horizontalOffset, loc.lat],
					zoom: Math.max(mapRef.current.getZoom(), 12),
					speed: 1.2,
					curve: 1.4,
					easing: (t) => t,
				});
			});
			const popup = new mapboxgl.Popup({ anchor: "bottom" }).setHTML(`			 
    <div  style="
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 15px;
	width:100%;  
	z-index:4;
">
    <!-- Google Icon Container -->
    <div style="
        width: 46px;
        height: 46px;
        border-radius: 8px;
        background-color: #E7F0FF;
        display: flex;
        align-items: center;
        justify-content: center;
    ">
        <img src="google-icon.png" alt="Google Icon" style="
            width: 80%;
            height: 80%;
            object-fit: contain;
        " />
    </div>

    <!-- Text Container -->
    <div style="
	flex:1;
        display: flex;
        flex-direction: column;
        gap: 16px;
		overflow:hidden;
    ">
        <!-- Title Line Container -->
       <div style="
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            width: 100%;
        ">
            <span style="
                font-size: 14px;
                font-weight: 600;
                color: #000000;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1;
            ">
                ${loc.name}
            </span>
            <button style="
                width: 24px;
                height: 24px;
                border-radius: 20px;
                background-color: #006FFF;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none !important;
				outline:none !important;
                cursor: pointer;
				padding:10px 0px;
				"
            id="popup-close-btn">
                <img src="close-icon.png" alt="Close" style="
                    width: 10px;
                    height: 10px;
                    object-fit: contain;
					filter: brightness(0) invert(1);
                " />
            </button>
	 </div>

        <!-- Open Hours -->
		<div style="width:100%;display:flex;flex-direction:column;height:auto;">
		 <p style="
            font-size: 12px;
            font-weight: 400;
            color: #000000;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
			margin:0px !important;
        ">
           ${textStrings.openingHours}: ${loc?.openingHours}
		</p>
		 <p style="
            font-size: 12px;
            font-weight: 400;
            color: #000000;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
			margin:0px !important;
        ">
		   ${textStrings.sunHours}: ${loc?.sunHours}
        </p>
		</div>
        

        <!-- Learn More Button -->
        <button style="
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 4px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
        "       onclick="sendToApp('${encodeURIComponent(JSON.stringify(loc))}')">
            <span style="
                font-size: 14px;
                font-weight: 700;
                color: #006FFF;
            ">${textStrings.learnMore}</span>
            <img src="learn-icon.png" alt="Learn Icon" style="
                width: 17px;
                height: 17px;
                object-fit: contain;
                filter: invert(28%) sepia(93%) saturate(2579%) hue-rotate(204deg) brightness(97%) contrast(101%);
            " />
        </button>
    </div>
</div>
      `);
			const marker = new mapboxgl.Marker({ element: markerEl })
				.setLngLat([loc.lng, loc.lat])
				.setPopup(popup)
				.addTo(mapRef.current); // force above
			popup.on("open", () => {
				const popupEl = popup.getElement(); // get THIS popup element only
				const closeBtn = popupEl.querySelector("#popup-close-btn");

				if (closeBtn) {
					closeBtn.addEventListener("click", () => {
						popup.remove();
					});
				}
			});
			markersRef.current.push(marker);
		});
	}, [locations]);

	useEffect(() => {
		const map = mapRef?.current;
		if (!map) return;

		const calculateTimes = () => {
			const center = map.getCenter();
			const formattedDate = new Date(selectedDate);
			const times = SunCalc.getTimes(formattedDate, center.lat, center.lng);
			setsunTimes({
				sunRise: formatDateTime(times.sunriseEnd),
				sunSet: formatDateTime(times.sunsetStart),
			});
		};

		if (map.isStyleLoaded()) {
			calculateTimes();
		}

		map.on("moveend", calculateTimes);

		return () => {
			map.off("moveend", calculateTimes);
		};
	}, [selectedDate]);

	return (
		<>
			<div className="map-container-main">
				<div
					style={{
						position: "absolute",
						top: "30px",
						left: "20px",
						zIndex: 1000,
						width: "55px",
					}}>
					<div
						onClick={() => {
							if (typeof dateInputRef.current.showPicker === "function") {
								dateInputRef.current?.showPicker(); // ✅ Android WebView / Chrome
							} else {
								dateInputRef.current?.focus(); // ✅ iOS WebView fallback
							}
						}}
						className="datepicker-wrapper-custom">
						<input
							hidden={true}
							ref={dateInputRef}
							className="datepicker"
							type="date"
							style={{
								borderRadius: "10px",
								borderColor: "black",
								pointerEvents: "none", // wrapper handles interaction
								opacity: 0, // hide but clickable
							}}
							value={selectedDate}
							onChange={(e) => {
								setSelectedDate(e.target.value);
							}}
						/>
						<img
							src="calendar-icon.png"
							className="calendar-icon"
							alt="calendar"
						/>
					</div>
				</div>

				<div
					id="map-container"
					ref={mapContainerRef}
				/>
				<img
					id="zoom-message"
					src="ZoomMessage2.png"
					alt="Zoom in"
					style={{
						position: "absolute",
						top: "40%",
						left: "50%",
						right: "50%",
						transform: "translate(-50%, -50%)",
						zIndex: 2000,
						display: "none",
						pointerEvents: "none",
						objectFit: "contain",
						width: "90%",
						maxWidth: "420px",
						opacity: 0.7,
					}}
				/>
			</div>
			<div
				style={{
					position: "absolute",
					top: "calc(85vh + 5px)",
					right: "0px",
					left: "0px",
					zIndex: 1000,
					width: "90%",
					margin: "0px auto",
					display: "flex",
					flexDirection: "column",
				}}>
				<div
					style={{
						width: "90%",
						height: "40px",
						backgroundColor: "rgba(255,255,255,0.9)",
						margin: "0px auto",
						borderRadius: "25px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-evenly",
						flexDirection: "row",
					}}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexDirection: "row",
							gap: "5px",
						}}>
						<span
							htmlFor="sunrisetime"
							style={{ fontSize: "12px", fontWeight: "normal" }}>
							{formatTime(seconds)}
						</span>
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexDirection: "row",
							gap: "5px",
						}}>
						<img src="sunrise-icon.png" />
						<span
							htmlFor="sunrisetime"
							style={{ fontSize: "12px", fontWeight: "normal" }}>
							{sunTimes.sunRise}
						</span>
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexDirection: "row",
							gap: "5px",
						}}>
						<img
							src="sunset-icon.png"
							style={{ marginLeft: "5px" }}
						/>
						<span
							htmlFor="sunsettime"
							style={{ fontSize: "12px", fontWeight: "normal" }}>
							{sunTimes.sunSet}
						</span>
					</div>
				</div>
			</div>
			<div
				style={{
					height: "10px",
					width: "90%",
					margin: "37px 0px auto auto",
				}}>
				<input
					type="range"
					min="0"
					max="86400"
					value={seconds}
					onChange={(e) => setSeconds(Number(e.target.value))}
					style={{
						width: "90%",
					}}
				/>
			</div>
		</>
	);
}

export default CommonMap;
