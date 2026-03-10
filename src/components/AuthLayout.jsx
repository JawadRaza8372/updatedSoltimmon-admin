// components
import Logo from "@components/Logo";
import { toast } from "react-toastify";
import Spring from "@components/Spring";
import PasswordInput from "@components/PasswordInput";

// hooks
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useWindowSize } from "react-use";

// utils
import classNames from "classnames";

// assets
import media from "@assets/login.webp";
import { useDispatch } from "react-redux";
import { isCheckLogin } from "../store/reducer";

const AuthLayout = () => {
	const { width } = useWindowSize();
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		formState: { errors },
		control,
	} = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
	});
	const dispatch = useDispatch();
	const onSubmit = (data) => {
		if (
			data?.email === "soltimman@admin.com" &&
			data?.password === "soltimman@"
		) {
			dispatch(isCheckLogin({ isAuth: "loggedIn" }));
			navigate("/");
		} else {
			toast.error("Wrong Email or password.");
		}
	};

	return (
		<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 4xl:grid-cols-[minmax(0,_1030px)_minmax(0,_1fr)]">
			{width >= 1024 && (
				<div className="flex flex-col justify-center items-center gap-[25px] lg:p-[60px]">
					<Logo
						imgClass="w-[60px]"
						textClass="text-[28px]"
					/>
					<img
						className="max-w-[780px] h-[450px] object-contain"
						src={media}
						alt="media"
					/>
				</div>
			)}
			<div className="bg-widget flex items-center justify-center w-full py-10 px-4 lg:p-[60px]">
				<Spring
					className="max-w-[460px] w-full"
					type="slideUp"
					duration={400}
					delay={300}>
					<div className="flex flex-col gap-2.5 text-center">
						<h1>Welcome back!</h1>
					</div>
					<form
						className="mt-5"
						onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col gap-5">
							<div className="field-wrapper">
								<label
									htmlFor="email"
									className="field-label">
									E-mail
								</label>
								<input
									className={classNames("field-input", {
										"field-input--error": errors.email,
									})}
									id="email"
									type="text"
									placeholder="Your E-mail address"
									{...register("email", {
										required: true,
										pattern: /^\S+@\S+$/i,
									})}
								/>
							</div>
							<Controller
								name="password"
								control={control}
								rules={{ required: true }}
								render={({ field }) => (
									<PasswordInput
										id="password"
										placeholder="Your password"
										error={errors.password}
										innerRef={field.ref}
										isInvalid={errors.password}
										value={field.value}
										onChange={field.onChange}
									/>
								)}
							/>
						</div>
						<div className="flex flex-col items-center gap-6 mt-4 mb-10">
							<button className="btn btn--primary w-full">Log In</button>
						</div>
					</form>
				</Spring>
			</div>
		</div>
	);
};

export default AuthLayout;
