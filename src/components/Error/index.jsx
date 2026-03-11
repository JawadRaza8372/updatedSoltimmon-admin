// styling
import styles from "./styles.module.scss";

const Error = () => {
	return (
		<div className={styles.container}>
			<div className={styles.main}>
				<span className={styles.main_code}>404</span>
				<h1 className={styles.main_title}>Page Not Found</h1>
			</div>
		</div>
	);
};

export default Error;
