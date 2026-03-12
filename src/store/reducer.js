import { createSlice } from "@reduxjs/toolkit";
const AsyncStorage = window.localStorage;

const theme = createSlice({
	name: "theme",
	initialState: {
		isAuth: null,
		spots: [],
		spotRequests: [],
		contacts: [],
		adImage: "",
		wholeAdData: null,
		clientSpots: [],
		clientPaidSpots: [],
	},
	reducers: {
		isCheckLogin: (state, action) => {
			storeUserId(action.payload.isAuth);
			state.isAuth = action.payload.isAuth;
		},
		resetLogin: (state, action) => {
			removeUserId();
			state.isAuth = null;
		},
		setSpotRequests: (state, action) => {
			state.spotRequests = action.payload.spotRequests;
		},
		setSpots: (state, action) => {
			state.spots = action.payload.spots;
		},
		setContacts: (state, action) => {
			state.contacts = action.payload.contacts;
		},
		setClientSpots: (state, action) => {
			state.clientSpots = action.payload.clientSpots;
		},
		setClientPaidSpots: (state, action) => {
			state.clientPaidSpots = action.payload.clientPaidSpots;
		},
		setWholeAdData: (state, action) => {
			state.wholeAdData = action.payload.wholeAdData ?? null;
		},
		setAdImage: (state, action) => {
			state.adImage = action.payload;
		},
	},
});

export const {
	isCheckLogin,
	resetLogin,
	setAdImage,
	setContacts,
	setSpotRequests,
	setSpots,
	setWholeAdData,
	setClientPaidSpots,
	setClientSpots,
} = theme.actions;
export default theme.reducer;
export const storeUserId = async (value) => {
	return await AsyncStorage.setItem(
		"soltimon_admin_login",
		JSON.stringify(value),
	);
};
export const removeUserId = async () => {
	return await AsyncStorage.removeItem("soltimon_admin_login");
};
export const fetchUserId = async () => {
	return Promise.resolve(
		await AsyncStorage.getItem("soltimon_admin_login"),
	).then((result) => {
		return result ? JSON.parse(result) : null;
	});
};
