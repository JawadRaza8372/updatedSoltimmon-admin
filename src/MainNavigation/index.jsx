import React, { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import MarkerPage from "@pages/MarkerPage";
import PaidMarkerPage from "@pages/PaidMarkerPage";
import Donation from "@pages/Donation";
import LoaderModal from "@components/Loader";
import { useLoadingWithRefreash } from "@hooks/useLoadingWithRefreash";
const UpdateSpot = lazy(() => import("@pages/UpdateSpot"));
const DbSpots = lazy(() => import("@pages/DbSpots"));
const ContactRequests = lazy(() => import("@pages/ContactRequests"));
const Login = lazy(() => import("@pages/Login"));
const Banners = lazy(() => import("@pages/Banners"));
const AddSpot = lazy(() => import("@pages/AddSpot"));
const PageNotFound = lazy(() => import("@pages/PageNotFound"));
const MainNaviagtion = () => {
	let ProtectedRoute = ({ children }) => {
		const { isAuth } = useSelector((state) => state.auth);
		if (isAuth) {
			return children;
		}
		return <Navigate to="/login" />;
	};
	let AuthRoute = ({ children }) => {
		const { isAuth } = useSelector((state) => state.auth);
		if (isAuth) {
			return <Navigate to="/" />;
		}
		return children;
	};
	const { isLoading } = useLoadingWithRefreash();
	if (isLoading) {
		return <LoaderModal />;
	}
	return (
		<Routes>
			<Route
				path="/client"
				element={<MarkerPage />}
			/>
			<Route
				path="/client/top-spots"
				element={<PaidMarkerPage />}
			/>
			<Route
				path="/client/donation"
				element={<Donation />}
			/>
			<Route
				path="/login"
				element={
					<AuthRoute>
						<Login />
					</AuthRoute>
				}
			/>

			<Route
				path="/"
				element={
					<ProtectedRoute>
						<DbSpots />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/addSpot"
				element={
					<ProtectedRoute>
						<AddSpot />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/updateSpot/:id"
				element={
					<ProtectedRoute>
						<UpdateSpot />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/contacts"
				element={
					<ProtectedRoute>
						<ContactRequests />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/adBanner"
				element={
					<ProtectedRoute>
						<Banners />
					</ProtectedRoute>
				}
			/>
			<Route
				path="*"
				element={<Navigate to={"/404"} />}
			/>
			<Route
				path="/404"
				element={<PageNotFound />}
			/>
		</Routes>
	);
};

export default MainNaviagtion;
