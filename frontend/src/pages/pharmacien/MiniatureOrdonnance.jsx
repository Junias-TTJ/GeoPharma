import { FiFileText, FiAlignLeft } from "react-icons/fi";
import styles from "./MiniatureOrdonnance.module.css";

const BASE_URL = "http://localhost/geopharma/backend";

export default function MiniatureOrdonnance({ ordonnance, onClick }) {
  const { fichier, type_fichier } = ordonnance;

  if (type_fichier === "IMAGE") {
    return (
      <button className={styles.miniature} onClick={onClick} title="Voir l'ordonnance">
        <img
          src={`${BASE_URL}/uploads/${fichier}`}
          alt="Ordonnance"
          className={styles.miniatureImg}
        />
      </button>
    );
  }

  if (type_fichier === "PDF") {
    return (
      <button className={styles.miniature} onClick={onClick} title="Voir l'ordonnance PDF">
        <div className={styles.miniaturePdf}>
          <FiFileText size={22} />
          <span>PDF</span>
        </div>
      </button>
    );
  }

  if (type_fichier === "TEXTE") {
    return (
      <button className={styles.miniature} onClick={onClick} title="Voir la saisie manuelle">
        <div className={styles.miniatureTexte}>
          <FiAlignLeft size={22} />
          <span>Texte</span>
        </div>
      </button>
    );
  }

  return null;
}