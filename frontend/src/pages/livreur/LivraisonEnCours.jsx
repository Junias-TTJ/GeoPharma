import { FiPackage, FiCheckCircle, FiUser, FiMapPin, FiHome, FiCalendar, FiRotateCcw } from "react-icons/fi";
import styles from "./LivraisonEnCours.module.css";

const livraisonTest = {
  id_commande: 2,
  mode: "LIVRAISON",
  nom_patient: "Fatou Sarr",
  adresse_livraison: "Cité Keur Gorgui, Villa 12, Dakar",
  nom_pharmacie: "Pharmacie Lat Dior",
  date_commande: "26 juin 2026",
  statut: "EN_LIVRAISON", // "ACCEPTEE" | "EN_LIVRAISON" | "LIVREE"
};

export default function LivraisonEnCours({ livraison = livraisonTest, onStatutChange, onRetourFile }) {
  const { id_commande, mode, nom_patient, adresse_livraison, nom_pharmacie, date_commande, statut } = livraison;

  // Sécurité : ce composant ne doit jamais afficher une commande en mode RETRAIT
  if (mode !== "LIVRAISON") {
    return null;
  }

  const estRecuperee = statut === "EN_LIVRAISON" || statut === "LIVREE";
  const estLivree = statut === "LIVREE";

  const handleRecuperee = () => {
    if (statut === "ACCEPTEE") {
      onStatutChange?.("EN_LIVRAISON");
    }
  };

  const handleLivree = () => {
    if (statut === "EN_LIVRAISON") {
      onStatutChange?.("LIVREE");
    }
  };

  return (
    <div className={styles.carte}>
      <div className={styles.enTete}>
        <h3 className={styles.titre}>🛵 Livraison en cours</h3>
        <span className={styles.badgeActive}>Active</span>
      </div>

      <p className={styles.numero}>Commande #{id_commande}</p>

      <div className={styles.grille}>
        <div className={styles.champ}>
          <span className={styles.label}><FiUser /> PATIENT</span>
          <span className={styles.valeur}>{nom_patient}</span>
        </div>
        <div className={styles.champ}>
          <span className={styles.label}><FiMapPin /> ADRESSE</span>
          <span className={styles.valeur}>{adresse_livraison}</span>
        </div>
        <div className={styles.champ}>
          <span className={styles.label}><FiHome /> PHARMACIE</span>
          <span className={styles.valeur}>{nom_pharmacie}</span>
        </div>
        <div className={styles.champ}>
          <span className={styles.label}><FiCalendar /> DATE COMMANDE</span>
          <span className={styles.valeur}>{date_commande}</span>
        </div>
      </div>

      <div className={styles.progression}>
        <div className={styles.etape}>
          <div className={styles.pointActif}>
            <FiCheckCircle />
          </div>
          <span className={styles.etapeLabelActif}>Assignée</span>
        </div>

        <div className={`${styles.ligne} ${estRecuperee ? styles.ligneActive : ""}`} />

        <div className={styles.etape}>
          <div className={estRecuperee ? styles.pointActif : styles.pointInactif} />
          <span className={estRecuperee ? styles.etapeLabelActif : styles.etapeLabelInactif}>
            Récupérée
          </span>
        </div>

        <div className={`${styles.ligne} ${estLivree ? styles.ligneActive : ""}`} />

        <div className={styles.etape}>
          <div className={estLivree ? styles.pointActif : styles.pointInactif} />
          <span className={estLivree ? styles.etapeLabelActif : styles.etapeLabelInactif}>
            Livrée
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={statut === "ACCEPTEE" ? styles.boutonContour : styles.boutonDisabled}
          onClick={handleRecuperee}
          disabled={statut !== "ACCEPTEE"}
        >
          <FiPackage /> Commande récupérée
        </button>

        <button
          className={statut === "EN_LIVRAISON" ? styles.boutonPlein : styles.boutonDisabled}
          onClick={handleLivree}
          disabled={statut !== "EN_LIVRAISON"}
        >
          <FiCheckCircle /> Commande livrée
        </button>
      </div>

      <button className={styles.boutonRetourFile} onClick={() => onRetourFile?.(id_commande)}>
        <FiRotateCcw /> Remettre en file d'attente
      </button>
    </div>
  );
}