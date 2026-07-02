import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import styles from "./ModalMotifRefus.module.css";

const MOTIFS_PREDEFINIS = [
  "Rupture de stock",
  "Ordonnance illisible ou invalide",
  "Médicament disponible sur ordonnance uniquement. Veuillez soumettre une ordonnance valide.",
  "Hors zone de livraison",
  "Pharmacie fermée ou indisponible",
  "Autre",
];

export default function ModalMotifRefus({ commande, onConfirmer, onAnnuler }) {
  const [motifChoisi, setMotifChoisi] = useState("");
  const [motifLibre, setMotifLibre] = useState("");
  const [erreur, setErreur] = useState("");

  const estAutre = motifChoisi === "Autre";

  const handleConfirmer = () => {
    if (!motifChoisi) {
      setErreur("Veuillez sélectionner un motif.");
      return;
    }
    if (estAutre && !motifLibre.trim()) {
      setErreur("Veuillez préciser le motif.");
      return;
    }

    const motifFinal = estAutre ? motifLibre.trim() : motifChoisi;
    onConfirmer(motifFinal);
  };

  return (
    <div className={styles.overlay} onClick={onAnnuler}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.enTete}>
          <div className={styles.iconeZone}>
            <FiAlertTriangle />
          </div>
          <div>
            <h2 className={styles.titre}>Refuser la commande</h2>
            <p className={styles.sousTitre}>
              {commande?.prenom_patient} {commande?.nom_patient}
            </p>
          </div>
        </div>

        <p className={styles.label}>Sélectionnez un motif de refus :</p>

        <div className={styles.listeMotifs}>
          {MOTIFS_PREDEFINIS.map((motif) => (
            <label
              key={motif}
              className={motifChoisi === motif ? styles.optionActive : styles.option}
            >
              <input
                type="radio"
                name="motif"
                value={motif}
                checked={motifChoisi === motif}
                onChange={() => {
                  setMotifChoisi(motif);
                  setErreur("");
                }}
                className={styles.radio}
              />
              {motif}
            </label>
          ))}
        </div>

        {estAutre && (
          <div className={styles.champLibre}>
            <textarea
              className={styles.textarea}
              placeholder="Précisez le motif du refus..."
              value={motifLibre}
              onChange={(e) => {
                setMotifLibre(e.target.value);
                setErreur("");
              }}
              rows={3}
            />
          </div>
        )}

        {erreur && <p className={styles.erreur}>{erreur}</p>}

        <div className={styles.actions}>
          <button className={styles.boutonAnnuler} onClick={onAnnuler}>
            Annuler
          </button>
          <button className={styles.boutonConfirmer} onClick={handleConfirmer}>
            Confirmer le refus
          </button>
        </div>
      </div>
    </div>
  );
}