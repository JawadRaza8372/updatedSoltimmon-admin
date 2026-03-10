// styling
import styles from "./styles.module.scss";

// components
import { NavLink } from "react-router-dom";

const Error = () => {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <span className={styles.main_code}>404</span>
        <h1 className={styles.main_title}>Page Not Found</h1>
        <NavLink className={`${styles.main_btn} btn btn--primary`} to="/">
          Back to Home Page
        </NavLink>
      </div>
    </div>
  );
};

export default Error;
