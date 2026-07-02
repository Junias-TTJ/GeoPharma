import { useState, useEffect } from "react";
import { FiX, FiUser, FiPhone, FiMail, FiMapPin, FiTruck } from "react-icons/fi";
import MiniatureOrdonnance from "./MiniatureOrdonnance.jsx";
import ModalOrdonnance from "./ModalOrdonnance.jsx";
import { getDetailsCommande } from "../../api.js";
import styles from "./ModalDetailsCommande.module.css";

const LABEL_STATUT = {
  EN_ATTENTE: "En attente",
  ACCEPTEE: "Acceptée",
  REFUSEE: "Refusée",
  EN_LIVRAISON: "En livraison",
  LIVREE: "Livrée",
};

export default function ModalDetailsCommande({ commande, onFermer }) {
  const [details, setDetails] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [ordonnanceSelectionnee, setOrdonnanceSelectionnee] = useState(null);

  useEffect(() => {
    chargerDetails();
  }, [commande.id_commande]);

  const chargerDetails = async () => {
    try {
      setChargement(true);
      const res = await getDetailsCommande(commande.id_commande);
      setDetails(res.data);
    } catch (e) {
      setErreur("Impossible de charger les détails de la commande.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onFermer}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.enTete}>
          <h2 className={styles.titre}>Détails de la commande</h2>
          <button className={styles.boutonFermer} onClick={onFermer}>
            <FiX size={20} />
          </button>
        </div>

        <div className={styles.contenu}>
          {chargement && <p className={styles.chargement}>Chargement...</p>}
          {erreur && <p className={styles.erreurTexte}>{erreur}</p>}

          {details && (
            <>
              <div className={styles.ligneEnTete}>
                <span className={styles.numero}>Commande #{details.id_commande}</span>
                <span className={styles.badgeStatut}>{LABEL_STATUT[details.statut] || details.statut}</span>
              </div>

              <div className={styles.grille}>
                <div className={styles.champ}>
                  <span className={styles.label}><FiUser /> PATIENT</span>
                  <span className={styles.valeur}>
                    {details.prenom_patient} {details.nom_patient}
                  </span>
                </div>

                <div className={styles.champ}>
                  <span className={styles.label}><FiPhone /> TÉLÉPHONE</span>
                  <span className={styles.valeur}>{details.tel_patient || "—"}</span>
                </div>

                {details.email_patient && (
                  <div className={styles.champ}>
                    <span className={styles.label}><FiMail /> EMAIL</span>
                    <span className={styles.valeur}>{details.email_patient}</span>
                  </div>
                )}

                <div className={styles.champ}>
                  <span className={styles.label}>MODE</span>
                  <span className={styles.valeur}>
                    {details.mode === "LIVRAISON" ? "Livraison à domicile" : "Retrait en pharmacie"}
                  </span>
                </div>

                {details.mode === "LIVRAISON" && details.adresse_livraison && (
                  <div className={styles.champ}>
                    <span className={styles.label}><FiMapPin /> ADRESSE</span>
                    <span className={styles.valeur}>{details.adresse_livraison}</span>
                  </div>
                )}

                {details.mode === "LIVRAISON" && details.nom_livreur && (
                  <div className={styles.champ}>
                    <span className={styles.label}><FiTruck /> LIVREUR</span>
                    <span className={styles.valeur}>
                      {details.prenom_livreur} {details.nom_livreur}
                    </span>
                  </div>
                )}
              </div>

              {details.ordonnances && details.ordonnances.length > 0 && (
                <div className={styles.sectionOrdonnances}>
                  <span className={styles.label}>ORDONNANCE(S)</span>
                  <div className={styles.listeOrdonnances}>
                    {details.ordonnances.map((ordo) => (
                      <MiniatureOrdonnance
                        key={ordo.id_ordonnance}
                        ordonnance={ordo}
                        onClick={() => setOrdonnanceSelectionnee(ordo)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {ordonnanceSelectionnee && (
        <ModalOrdonnance
          ordonnance={ordonnanceSelectionnee}
          onFermer={() => setOrdonnanceSelectionnee(null)}
        />
      )}
    </div>
  );
}