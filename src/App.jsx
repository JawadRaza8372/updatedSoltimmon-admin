// utils
import { Suspense } from "react";

// styles
import "@styles/index.scss";
import "react-toastify/dist/ReactToastify.min.css";
import ThemeStyles from "@styles/theme";

// fonts
import "@fonts/icomoon/icomoon.woff";

// contexts
import { SidebarProvider } from "@contexts/sidebarContext";
import { ThemeProvider } from "styled-components";

// hooks
import { useEffect, useRef } from "react";

// components
import Loader from "@components/Loader";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { fetchUserId, isCheckLogin } from "./store/reducer";
import { useDispatch } from "react-redux";
import MainNaviagtion from "./MainNavigation";
import ResponsiveAppBar from "@layout/ResponsiveAppBar";

const App = () => {
	const appRef = useRef(null);
	const path = useLocation().pathname;
	const hideTopBar =
		path !== "/login" &&
		path !== "/404" &&
		path !== "/client" &&
		path !== "/client/" &&
		path !== "/client/top-spots" &&
		path !== "/client/donation";

	// Google Analytics init

	const dispatch = useDispatch();
	useEffect(() => {
		if (
			path === "/client" ||
			path === "/client/" ||
			path === "/client/top-spots"
		) {
			document.documentElement.classList.add("transparentBg");
			document.body.classList.add("mapBg");
		} else if (path === "/client/donation") {
			document.body.classList.add("mapBg2");
		} else {
			document.documentElement.classList.remove("transparentBg");
			document.body.classList.remove("mapBg");
			document.body.classList.remove("mapBg2");
		}
	}, [path]);
	useEffect(() => {
		appRef.current && appRef.current.scrollTo(0, 0);
	}, []);
	useEffect(() => {
		const checkforAuth = async () => {
			const result = await fetchUserId();
			if (result) {
				dispatch(isCheckLogin({ isAuth: result }));
			}
		};

		if (
			path !== "/client" &&
			path !== "/client/" &&
			path !== "/client/top-spots" &&
			path !== "/client/donation"
		) {
			checkforAuth();
		}
	}, [dispatch, path]);
	return (
		<SidebarProvider>
			<ThemeProvider theme={{ theme: "light" }}>
				<ThemeStyles />
				<ToastContainer
					theme={"colored"}
					autoClose={5000}
					style={{ padding: "20px" }}
					pauseOnFocusLoss={false}
				/>
				{hideTopBar && <ResponsiveAppBar />}
				<div
					className={`app`}
					ref={appRef}>
					<div className="app_content">
						<Suspense fallback={<Loader />}>
							<div className="main">
								<MainNaviagtion />
							</div>
						</Suspense>
					</div>
				</div>
			</ThemeProvider>
		</SidebarProvider>
	);
};

export default App;
