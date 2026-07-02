import { useState, useEffect } from "react";
import CarteCommandeAttente from "./CarteCommandeAttente.jsx";
import CarteEnCours from "./CarteEnCours.jsx";
import TableauHistorique from "./TableauHistorique.jsx";
import ModalMotifRefus from "./ModalMotifRefus.jsx";
import ModalDetailsCommande from "./ModalDetailsCommande.jsx";
import {
  getCommandesAttente,
  getCommandesEnCours,
  getHistoriqueCommandes,
  accepterCommande,
  refuserCommande,
  marquerRemisAuPatient,
} from "../../api.js";
import styles from "./Commandes.module.css";

export default function Commandes() {
  const [enAttente, setEnAttente] = useState([]);
  const [enCours, setEnCours] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [filtreHistorique, setFiltreHistorique] = useState("toutes");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [commandeARefuser, setCommandeARefuser] = useState(null);
  const [commandeADetailler, setCommandeADetailler] = useState(null);

  useEffect(() => {
    chargerTout();
  }, []);

  useEffect(() => {
    chargerHistorique();
  }, [filtreHistorique]);

  const chargerTout = async () => {
    try {
      setChargement(true);
      const [resAttente, resEnCours, resHistorique] = await Promise.all([
        getCommandesAttente(),
        getCommandesEnCours(),
        getHistoriqueCommandes(filtreHistorique),
      ]);
      setEnAttente(resAttente.data);
      setEnCours(resEnCours.data);
      setHistorique(resHistorique.data);
    } catch (e) {
      setErreur("Impossible de charger les commandes.");
    } finally {
      setChargement(false);
    }
  };

  const chargerHistorique = async () => {
    try {
      const res = await getHistoriqueCommandes(filtreHistorique);
      setHistorique(res.data);
    } catch (e) {
      console.error("Erreur historique:", e);
    }
  };

  const handleAccepter = async (idCommande) => {
    try {
      await accepterCommande(idCommande);
      const commande = enAttente.find((c) => c.id_commande === idCommande);
      setEnAttente(enAttente.filter((c) => c.id_commande !== idCommande));
      setEnCours([{ ...commande, statut: "ACCEPTEE" }, ...enCours]);
    } catch (e) {
      alert("Erreur lors de l'acceptation de la commande.");
    }
  };

  const handleConfirmerRefus = async (motif) => {
    try {
      await refuserCommande(commandeARefuser.id_commande, motif);
      setEnAttente(enAttente.filter((c) => c.id_commande !== commandeARefuser.id_commande));
      if (filtreHistorique === "toutes" || filtreHistorique === "refusees") {
        setHistorique([
          { ...commandeARefuser, statut: "REFUSEE", motif_refus: motif },
          ...historique,
        ]);
      }
      setCommandeARefuser(null);
    } catch (e) {
      alert("Erreur lors du refus de la commande.");
    }
  };

  const handleRemisAuPatient = async (idCommande) => {
    try {
      await marquerRemisAuPatient(idCommande);
      const commande = enCours.find((c) => c.id_commande === idCommande);
      setEnCours(enCours.filter((c) => c.id_commande !== idCommande));
      if (filtreHistorique === "toutes" || filtreHistorique === "livrees") {
        setHistorique([{ ...commande, statut: "LIVREE" }, ...historique]);
      }
    } catch (e) {
      alert("Erreur lors de la mise à jour de la commande.");
    }
  };

  if (chargement) {
    return <div className={styles.chargement}>Chargement...</div>;
  }

  return (
    <div className={styles.page}>
      {erreur && <div className={styles.erreurBanner}>{erreur}</div>}

      <section className={styles.section}>
        <h2 className={styles.titreSection}>
          Commandes en attente
          {enAttente.length > 0 && (
            <span className={styles.compteurAttente}>{enAttente.length}</span>
          )}
        </h2>

        {enAttente.length === 0 ? (
          <p className={styles.vide}>Aucune commande en attente pour le moment.</p>
        ) : (
          <div className={styles.grilleAttente}>
            {enAttente.map((commande) => (
              <CarteCommandeAttente
                key={commande.id_commande}
                commande={commande}
                onAccepter={() => handleAccepter(commande.id_commande)}
                onRefuser={() => setCommandeARefuser(commande)}
              />
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.titreSection}>
          En cours de traitement
          {enCours.length > 0 && (
            <span className={styles.compteurEnCours}>{enCours.length}</span>
          )}
        </h2>

        {enCours.length === 0 ? (
          <p className={styles.vide}>Aucune commande en cours de traitement.</p>
        ) : (
          <div className={styles.listeEnCours}>
            {enCours.map((commande) => (
              <CarteEnCours
                key={commande.id_commande}
                commande={commande}
                onVoirDetails={() => setCommandeADetailler(commande)}
                onRemisAuPatient={() => handleRemisAuPatient(commande.id_commande)}
              />
            ))}
          </div>
        )}
      </section>

      <TableauHistorique
        historique={historique}
        filtreActif={filtreHistorique}
        onChangerFiltre={setFiltreHistorique}
      />

      {commandeARefuser && (
        <ModalMotifRefus
          commande={commandeARefuser}
          onConfirmer={handleConfirmerRefus}
          onAnnuler={() => setCommandeARefuser(null)}
        />
      )}

      {commandeADetailler && (
        <ModalDetailsCommande
          commande={commandeADetailler}
          onFermer={() => setCommandeADetailler(null)}
        />
      )}
    </div>
  );
}