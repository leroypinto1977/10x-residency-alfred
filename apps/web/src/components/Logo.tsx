import Image from "next/image";
import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <div className={styles.wrapper}>
      <Image
        src="/GOAT Mastermind  logo.png"
        alt="GOAT Mastermind"
        width={120}
        height={48}
        className={styles.image}
        priority
      />
    </div>
  );
}
