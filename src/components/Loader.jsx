const Loader = () => {
	return (
		<div className="flex flex-1 justify-center items-center">
			<div className="w-[150px] h-[150px] text-accent">
				<img
					className="w-full h-full object-contain"
					src="loading.gif"
					alt="loading"
				/>
			</div>
		</div>
	);
};

export default Loader;
