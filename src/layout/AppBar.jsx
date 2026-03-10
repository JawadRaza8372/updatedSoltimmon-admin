// components
import Search from "@ui/Search";
import Headroom from "react-headroom";
import CustomTooltip from "@ui/CustomTooltip";
import ModalBase from "@ui/ModalBase";

// hooks
// import { useTheme } from "@contexts/themeContext";
import { useSidebar } from "@contexts/sidebarContext";
import { useWindowSize } from "react-use";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetLogin } from "../store/reducer";

const AppBar = () => {
	const [searchModalOpen, setSearchModalOpen] = useState(false);
	const { width } = useWindowSize();
	const { setOpen } = useSidebar();
	const dispatch = useDispatch();
	useEffect(() => {
		setSearchModalOpen(false);
	}, [width]);

	return (
		<>
			<Headroom style={{ zIndex: 999 }}>
				<div className="flex items-center justify-between">
					{width < 1920 && (
						<button
							className="icon text-2xl leading-none"
							aria-label="Open sidebar"
							onClick={() => setOpen(true)}>
							<i className="icon-bars-solid" />
						</button>
					)}

					<div className="flex items-center gap-5 md:ml-5 xl:gap-[26px]">
						<CustomTooltip title={"Logout"}>
							<div className="relative">
								<button
									className="h-8 w-8 rounded-full bg-accent text-widget text-sm flex items-center
                                    justify-center relative xl:w-11 xl:h-11 xl:text-lg"
									onClick={() => {
										if (!window.confirm(`Are you sure you want to logout?`)) {
											return;
										} else {
											//dispatch(resetLogin());
										}
									}}
									aria-label="Account menu">
									<i className="icon-user-solid" />
								</button>
								<span className="badge-online" />
							</div>
						</CustomTooltip>
					</div>
				</div>
			</Headroom>
			{width < 768 && (
				<ModalBase
					open={searchModalOpen}
					onClose={() => setSearchModalOpen(false)}>
					<div className="card max-w-[360px] w-full">
						<h3 className="mb-3">Search</h3>
						<Search placeholder="What are you looking for?" />
					</div>
				</ModalBase>
			)}
		</>
	);
};

export default AppBar;
