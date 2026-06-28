import { useState } from "react";
import { FiCheckCircle, FiClock, FiChevronUp, FiChevronDown } from "react-icons/fi";
import styles from "./Historique.module.css";

const LIMITE = 5;

export default function Historique({ historique = [] }) {
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