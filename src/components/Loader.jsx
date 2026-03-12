import loadingImg from "@assets/loading2.gif";
const Loader = () => {
	return (
		<div className="flex flex-1 justify-center items-center">
			<div className="w-[40px] h-[40px] text-accent">
				<img
					className="w-full h-full object-contain"
					src={loadingImg}
					alt="loading"
				/>
			</div>
		</div>
	);
};

export default Loader;
