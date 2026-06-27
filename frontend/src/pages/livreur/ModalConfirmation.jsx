import { FiAlertTriangle, FiInfo } from "react-icons/fi";
import styles from "./ModalConfirmation.module.css";

export default function ModalConfirmation({
  titre,
  message,
  labelConfirmer = "Confirmer",
  labelAnnuler = "Annuler",
  danger = false,
  onConfirmer,
  onAnnuler,
}) {
  return (
    <div className={styles.overlay} onClick={onAnnuler}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.iconeZone} ${danger ? styles.iconeZoneDanger : styles.iconeZoneInfo}`}>
          {danger ? <FiAlertTriangle /> : <FiInfo />}
        </div>

        <h2 className={styles.titre}>{titre}</h2>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button className={styles.boutonAnnuler} onClick={onAnnuler}>
            {labelAnnuler}
          </button>
          <button
            className={danger ? styles.boutonDanger : styles.boutonConfirmer}
            onClick={onConfirmer}
          >
            {labelConfirmer}
          </button>
        </div>
      </div>
    </div>
  );
}