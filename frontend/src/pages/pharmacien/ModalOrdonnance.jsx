import { FiX, FiDownload } from "react-icons/fi";
import styles from "./ModalOrdonnance.module.css";

const BASE_URL = "http://localhost/geopharma/backend";

export default function ModalOrdonnance({ ordonnance, onFermer }) {
  const { fichier, type_fichier } = ordonnance;
  const urlFichier = `${BASE_URL}/uploads/${fichier}`;

  return (
    <div className={styles.overlay} onClick={onFermer}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.enTete}>
          <h2 className={styles.titre}>
            {type_fichier === "TEXTE" ? "Médicaments demandés" : "Ordonnance"}
          </h2>
          <div className={styles.actions}>
            {type_fichier !== "TEXTE" && (
              <a
                href={urlFichier}
                download={fichier}
                className={styles.boutonTelechargement}
                onClick={(e) => e.stopPropagation()}
              >
                <FiDownload /> Télécharger
              </a>
            )}
            <button className={styles.boutonFermer} onClick={onFermer}>
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className={styles.contenu}>
          {type_fichier === "IMAGE" && (
            <img
              src={urlFichier}
              alt="Ordonnance"
              className={styles.image}
            />
          )}

          {type_fichier === "PDF" && (
            <iframe
              src={urlFichier}
              className={styles.pdf}
              title="Ordonnance PDF"
            />
          )}

          {type_fichier === "TEXTE" && (
            <div className={styles.texte}>
              <p>{fichier}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}