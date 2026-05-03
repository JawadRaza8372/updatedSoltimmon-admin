import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import SunCalc from "suncalc";
import { useSearchParams } from "react-router-dom";
import jsonLang from "../assets/translation.json";

const MIN_ZOOM = 9;
const MAX_ZOOM = 17;
const APP_MESSAGE_TYPES = {
	openPlaceDetails: "OPEN_PLACE_DETAILS",
	requestDate: "REQUEST_DATE_PICKER",
	requestUserLocation: "REQUEST_USER_LOCATION",
	setDate: "SET_SELECTED_DATE",
	showUserLocation: "SHOW_USER_LOCATION",
	openCurrentLocationDetails: "OPEN_CURRENT_LOCATION_DETAILS",
};
const formatDateForState = (date) => {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};
const normalizeDateValue = (value) => {
	if (!value && value !== 0) return null;

	if (value instanceof Date) {
		return formatDateForState(value);
	}

	if (typeof value === "number") {
		return formatDateForState(new Date(value));
	}

	if (typeof value !== "string") return null;

	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return value;
	}

	const parsedDate = new Date(value);
	return formatDateForState(parsedDate);
};
const normalizeIncomingMessage = (rawData) => {
	if (!rawData) return null;
	if (typeof rawData === "string") {
		try {
			return JSON.parse(rawData);
		} catch {
			return rawData;
		}
	}
	return rawData;
};
const extractDateFromMessage = (payload) => {
	if (!payload) return null;
	const directDate = normalizeDateValue(payload);
	if (directDate) return directDate;

	const candidate =
		payload?.data?.date ??
		payload?.data?.value ??
		payload?.data?.selectedDate ??
		payload?.date ??
		payload?.value ??
		payload?.selectedDate;

	return normalizeDateValue(candidate);
};
function CommonMap({ locations }) {
	const floatingActionStyle = {
		position: "absolute",
		left: "20px",
		zIndex: 1000,
		width: "55px",
	};
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
	const mapRef = useRef();
	const markersRef = useRef([]);
	const appMarkerRef = useRef(null);
	const appMarkerPopupRef = useRef(null);
	const pendingAppLocationRef = useRef(null);
	const updateSunRef = useRef(null);
	const setAppLocationMarkerRef = useRef(null);
	const mapContainerRef = useRef();
	const mapOverlayRef = useRef();

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
	const sendMessageToApp = useCallback((data) => {
		try {
			const formattedData =
				typeof data !== "string" ? JSON.stringify(data) : data;
			Promise.resolve().then(() => {
				window.ReactNativeWebView?.postMessage(formattedData);
			});
		} catch (error) {
			console.log("check", error);
		}
	}, []);
	const showDatePicker = useCallback(() => {
		sendMessageToApp({
			type: APP_MESSAGE_TYPES.requestDate,
			data: { selectedDate },
		});
	}, [selectedDate, sendMessageToApp]);
	const setAppLocationMarker = useCallback(
		(location) => {
			const map = mapRef.current;
			if (!location) return;

			if (!map) {
				pendingAppLocationRef.current = location;
				return;
			}

			const lat = Number(location?.lat ?? location?.latitude);
			const lng = Number(location?.lng ?? location?.longitude);
			if (Number.isNaN(lat) || Number.isNaN(lng)) return;

			pendingAppLocationRef.current = null;
			appMarkerRef.current?.remove();
			appMarkerPopupRef.current?.remove();

			const markerEl = document.createElement("div");
			markerEl.style.width = "40px";
			markerEl.style.height = "40px";
			markerEl.style.borderRadius = "50%";
			markerEl.style.overflow = "hidden";
			markerEl.style.boxShadow = "0 0 0 3px rgba(0, 111, 255, 0.2)";

			const img = document.createElement("img");
			img.src = "/new-marker-icon.png";
			img.style.width = "100%";
			img.style.height = "100%";
			img.style.objectFit = "contain";
			img.style.filter = "hue-rotate(170deg) saturate(1.5)";
			markerEl.appendChild(img);

			markerEl.addEventListener("pointerdown", (e) => {
				e.stopPropagation();
				if (window.ReactNativeWebView) {
					sendMessageToApp({
						type: APP_MESSAGE_TYPES.openCurrentLocationDetails,
					});
				}
			});

			const marker = new mapboxgl.Marker({ element: markerEl })
				.setLngLat([lng, lat])
				.addTo(map);

			appMarkerRef.current = marker;

			map.flyTo({
				center: [lng, lat],
				zoom: Math.max(map.getZoom(), 14),
				speed: 1.2,
				curve: 1.4,
				easing: (t) => t,
			});
		},
		[textStrings],
	);
	const requestUserLocation = useCallback(() => {
		if (window.ReactNativeWebView) {
			sendMessageToApp({
				type: APP_MESSAGE_TYPES.requestUserLocation,
			});
			return;
		}

		if (!navigator.geolocation) return;

		navigator.geolocation.getCurrentPosition((position) => {
			setAppLocationMarker({
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			});
		});
	}, [sendMessageToApp, setAppLocationMarker]);
	const formatTime = (sec) => {
		const { h, m } = secondsToTime(sec);
		return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
	};
	useEffect(() => {
		window.sendToApp = (locationId) => {
			const payload = {
				type: APP_MESSAGE_TYPES.openPlaceDetails,
				data: { id: locationId },
			};

			if (window.ReactNativeWebView) {
				sendMessageToApp(payload);
			}
		};
		window.setSelectedDateFromApp = (value) => {
			const nextDate = extractDateFromMessage(value);
			if (nextDate) {
				setSelectedDate(nextDate);
			}
		};
		window.showUserLocationFromApp = (location) => {
			setAppLocationMarker(location);
		};

		const handleIncomingMessage = (event) => {
			const payload = normalizeIncomingMessage(event?.data);
			if (!payload) return;

			const messageType = payload?.type;
			const incomingDate = extractDateFromMessage(payload);
			if (
				incomingDate &&
				(!messageType || messageType === APP_MESSAGE_TYPES.setDate)
			) {
				setSelectedDate(incomingDate);
			}

			if (messageType === APP_MESSAGE_TYPES.showUserLocation) {
				const location =
					payload?.data?.location ??
					payload?.data ??
					payload?.location ??
					payload;
				setAppLocationMarker(location);
			}
		};

		window.addEventListener("message", handleIncomingMessage);
		document.addEventListener("message", handleIncomingMessage);

		return () => {
			delete window.sendToApp;
			delete window.setSelectedDateFromApp;
			delete window.showUserLocationFromApp;
			window.removeEventListener("message", handleIncomingMessage);
			document.removeEventListener("message", handleIncomingMessage);
		};
	}, [sendMessageToApp, setAppLocationMarker]);
	const formatDateTime = (date) =>
		`${String(date.getHours()).padStart(2, "0")}:${String(
			date.getMinutes(),
		).padStart(2, "0")}`;
	const updateSun = useCallback(
		async (map) => {
			const date = new Date(selectedDate);
			date.setHours(Math.floor(seconds / 3600));
			date.setMinutes(Math.floor(seconds / 60) % 60);
			const center = mapRef.current.getCenter();
			const sun = SunCalc.getPosition(date, center.lat, center.lng);
			const times = SunCalc.getTimes(date, center.lat, center.lng);

			setsunTimes({
				sunRise: formatDateTime(times.sunriseEnd),
				sunSet: formatDateTime(times.sunsetStart),
			});

			const altitude = sun.altitude;

			let brightness = 100;

			if (altitude <= 0) {
				brightness = 50;
			} else if (altitude < 0.2) {
				brightness = altitude * 250 + 50;
			} else {
				brightness = 100;
			}

			// // 🔥 Apply overlay opacity to fix iOS webgl brightness filter issue
			if (mapOverlayRef.current) {
				const opacity = 1 - brightness / 100;
				mapOverlayRef.current.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
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
		},
		[selectedDate, seconds],
	);
	useEffect(() => {
		updateSunRef.current = updateSun;
	}, [updateSun]);
	useEffect(() => {
		setAppLocationMarkerRef.current = setAppLocationMarker;
	}, [setAppLocationMarker]);
	useEffect(() => {
		mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: "mapbox://styles/mapbox/streets-v11",
			center: true ? [-74.0059, 40.7064] : [16.7158, 62.8576],
			antialias: true,
			maxZoom: 17,
			minZoom: 11,
			zoom: 15,
			dragPitch: false,
			pitchWithRotate: false,
			pitch: 0,
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
			if (pendingAppLocationRef.current) {
				setAppLocationMarkerRef.current?.(pendingAppLocationRef.current);
			}
			updateSunRef.current?.(mapRef.current);
		});

		return () => {
			appMarkerRef.current?.remove();
			appMarkerPopupRef.current?.remove();
			mapRef.current.remove();
		};
	}, []);
	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		if (map.isStyleLoaded()) {
			updateSun(map);
		}
	}, [updateSun]);
	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;

		markersRef.current.forEach((m) => m.remove());
		markersRef.current = [];
		if (!locations?.length) return;
		locations.forEach((loc) => {
			const markerEl = document.createElement("div");
			markerEl.style.width = "40px"; // set your desired size
			markerEl.style.height = "40px";
			markerEl.style.borderRadius = "50%"; // optional, for round icons
			markerEl.style.overflow = "hidden";

			// Add the image inside the marker element
			const img = document.createElement("img");

			img.src = "/new-marker-icon.png"; // your marker image
			img.style.width = "100%";
			img.style.height = "100%";
			img.style.objectFit = "contain"; // or cover if you want

			markerEl.appendChild(img);
			markerEl.addEventListener("pointerdown", (e) => {
				e.stopPropagation();
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

				if (window.sendToApp) {
					window.sendToApp(loc.id);
				}
			});
			const marker = new mapboxgl.Marker({ element: markerEl })
				.setLngLat([loc.lng, loc.lat])
				.addTo(mapRef.current); // force above

			markersRef.current.push(marker);
		});
	}, [locations, textStrings]);

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
				<div style={{ ...floatingActionStyle, top: "30px" }}>
					<div
						onClick={() => {
							showDatePicker();
						}}
						className="datepicker-wrapper-custom">
						<img
							src="/calendar-icon.png"
							className="calendar-icon"
							alt="calendar"
						/>
					</div>
				</div>
				<div style={{ ...floatingActionStyle, bottom: "30px" }}>
					<div
						onClick={() => {
							requestUserLocation();
						}}
						className="datepicker-wrapper-custom">
						<img
							src="/plan-icon.png"
							className="calendar-icon"
							alt="location"
						/>
					</div>
				</div>

				<div
					id="map-container"
					ref={mapContainerRef}
				/>
				<div
					ref={mapOverlayRef}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						backgroundColor: "rgba(0,0,0,0)",
						pointerEvents: "none",
						zIndex: 10,
						transition: "background-color 0.3s ease",
					}}
				/>
				<img
					id="zoom-message"
					src="/ZoomMessage2.png"
					alt="Zoom in"
					style={{
						position: "absolute",
						top: "48%",
						left: "50%",
						right: "50%",
						transform: "translate(-50%, -50%)",
						zIndex: 2000,
						display: "none",
						pointerEvents: "none",
						objectFit: "contain",
						width: "90%",
						maxWidth: "220px",
						opacity: 0.6,
					}}
				/>
			</div>
			<div
				style={{
					position: "absolute",
					top: "calc(83vh)",
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
						<img
							src="/sunrise-icon.png"
							alt="sun-rise"
						/>
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
							src="/sunset-icon.png"
							alt="sun-set"
							style={{ marginLeft: "5px" }}
						/>
						<span
							htmlFor="sunsettime"
							style={{ fontSize: "12px", fontWeight: "normal" }}>
							{sunTimes.sunSet}
						</span>
					</div>
				</div>
				<div
					style={{
						height: "20px",
						width: "90%",
						margin: "18px 0px auto auto",
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
			</div>
		</>
	);
}

export default CommonMap;
