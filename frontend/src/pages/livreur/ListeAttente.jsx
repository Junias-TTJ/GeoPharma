import { FiMapPin, FiHome, FiCalendar } from "react-icons/fi";
import styles from "./ListeAttente.module.css";

// Données fictives pour test
const livraisonsTest = [
  {
    id_commande: 3,
    nom_patient: "Mamadou Ba",
    adresse_livraison: "HLM 5, Appartement B3, Dakar",
    nom_pharmacie: "Pharmacie Lat Dior",
    date_commande: "26 juin 2026",
    statut: "ACCEPTEE",
    mode: "LIVRAISON",
  },
  {
    id_commande: 4,
    nom_patient: "Khady Diallo",
    adresse_livraison: "Parcelles Assainies, Unité 11",
    nom_pharmacie: "Pharmacie Lat Dior",
    date_commande: "26 juin 2026",
    statut: "EN_LIVRAISON",
    mode: "LIVRAISON",
  },
];

const LABEL_STATUT = {
  EN_LIVRAISON: "Récupérée",
};

export default function ListeAttente({ livraisons = livraisonsTest, onActiver, onVoirDetails }) {
  if (livraisons.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.titreSection}>
        Livraisons assignées <span className={styles.compteur}>{livraisons.length}</span>
      </h2>

      <div className={styles.liste}>
        {livraisons.map((livraison) => (
          <div
            key={livraison.id_commande}
            className={styles.carte}
            onClick={() => onActiver?.(livraison.id_commande)}
          >
            <div className={styles.enTeteCarte}>
                <span className={styles.nomPatient}>{livraison.nom_patient}</span>
                {livraison.statut === "EN_LIVRAISON" && (
                    <span className={styles.badgeStatut}>Récupérée</span>
                )}
                <button
                    className={styles.boutonDetails}
                    onClick={(e) => { e.stopPropagation(); onVoirDetails?.(livraison.id_commande); }}
                >
                    Voir détails
                </button>
            </div>

            <div className={styles.infosCarte}>
                <p className={styles.ligneInfo}><FiMapPin /> {livraison.adresse_livraison}</p>
                <p className={styles.ligneInfo}><FiHome /> {livraison.nom_pharmacie}</p>
                <p className={styles.ligneInfo}><FiCalendar /> {livraison.date_commande}</p>
            </div>

            <div className={styles.piedCarte}>
                <button
                    className={styles.boutonDetails}
                    onClick={(e) => { e.stopPropagation(); onVoirDetails?.(livraison.id_commande); }}
                >
                    Voir détails
                </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}