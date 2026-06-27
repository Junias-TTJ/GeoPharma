import { useState } from "react";
import { FiCheckCircle, FiClock, FiChevronUp, FiChevronDown } from "react-icons/fi";
import styles from "./Historique.module.css";

const historiqueTest = [
  { id_commande: 10, nom_patient: "Ousmane Ndoye", date_commande: "27 juin 2026" },
  { id_commande: 9, nom_patient: "Aissatou Diop", date_commande: "25 juin 2026" },
  { id_commande: 8, nom_patient: "Cheikh Fall", date_commande: "24 juin 2026" },
  { id_commande: 7, nom_patient: "Mariama Sow", date_commande: "23 juin 2026" },
  { id_commande: 6, nom_patient: "Ibrahima Gueye", date_commande: "22 juin 2026" },
  { id_commande: 5, nom_patient: "Rokhaya Diagne", date_commande: "21 juin 2026" },
  { id_commande: 4, nom_patient: "Moussa Cissé", date_commande: "20 juin 2026" },
  { id_commande: 3, nom_patient: "Fatou Mbaye", date_commande: "19 juin 2026" },
];

const LIMITE = 5;

export default function Historique({ historique = historiqueTest }) {
  const [ouvert, setOuvert] = useState(true);
  const [voirTout, setVoirTout] = useState(false);

  if (historique.length === 0) return null;

  const entrees = voirTout ? historique : historique.slice(0, LIMITE);
  const restantes = historique.length - LIMITE;

  return (
    <section className={styles.section}>
      <div className={styles.titreSection} onClick={() => setOuvert(!ouvert)}>
        <div className={styles.titreDroite}>
          <FiClock className={styles.iconeTitre} />
          <h2 className={styles.titre}>Historique</h2>
          <span className={styles.compteur}>({historique.length} livraisons)</span>
        </div>
        {ouvert ? <FiChevronUp /> : <FiChevronDown />}
      </div>

      {ouvert && (
        <div className={styles.liste}>
          {entrees.map((livraison, index) => (
            <div
              key={livraison.id_commande}
              className={`${styles.ligne} ${index < entrees.length - 1 ? styles.avecSeparateur : ""}`}
            >
              <div className={styles.gauche}>
                <div className={styles.iconeCheck}>
                  <FiCheckCircle />
                </div>
                <div>
                  <p className={styles.nomPatient}>{livraison.nom_patient}</p>
                  <p className={styles.date}>{livraison.date_commande}</p>
                </div>
              </div>
              <span className={styles.badgeLivree}>Livrée</span>
            </div>
          ))}

          {!voirTout && restantes > 0 && (
            <button className={styles.voirPlus} onClick={() => setVoirTout(true)}>
              Voir plus ({restantes} restantes)
            </button>
          )}
        </div>
      )}
    </section>
  );
}