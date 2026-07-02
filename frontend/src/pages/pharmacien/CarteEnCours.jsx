import { FiTruck, FiCheck } from "react-icons/fi";
import styles from "./CarteEnCours.module.css";

const LABEL_STATUT = {
  ACCEPTEE: "Acceptée",
  EN_LIVRAISON: "En livraison",
};

export default function CarteEnCours({ commande, onVoirDetails, onRemisAuPatient }) {
  const { nom_patient, prenom_patient, mode, statut, nom_livreur, prenom_livreur } = commande;

  return (
    <div className={styles.carte}>
      <div className={styles.infos}>
        <div className={styles.ligneHaut}>
          <span className={styles.nomPatient}>{prenom_patient} {nom_patient}</span>
          <span className={mode === "LIVRAISON" ? styles.badgeLivraison : styles.badgeRetrait}>
            {mode === "LIVRAISON" ? "Livraison à domicile" : "Retrait en pharmacie"}
          </span>
          <span className={styles.badgeStatut}>{LABEL_STATUT[statut] || statut}</span>
        </div>

        {mode === "LIVRAISON" && nom_livreur && (
          <p className={styles.livreur}>
            <FiTruck /> Livreur : {prenom_livreur} {nom_livreur}
          </p>
        )}

        {mode === "RETRAIT" && (
          <p className={styles.attenteRetrait}>En attente de retrait par le patient</p>
        )}
      </div>

      <div className={styles.actionsCarte}>
        {mode === "RETRAIT" && (
          <button className={styles.boutonRemis} onClick={onRemisAuPatient}>
            <FiCheck /> Remis au patient
          </button>
        )}
        <button className={styles.boutonDetails} onClick={onVoirDetails}>
          Voir détails
        </button>
      </div>
    </div>
  );
}