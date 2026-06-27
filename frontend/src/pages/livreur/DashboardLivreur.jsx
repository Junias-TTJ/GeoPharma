import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import LivraisonEnCours from "./LivraisonEnCours.jsx";
import ListeAttente from "./ListeAttente.jsx";
import Historique from "./Historique.jsx";
import ProfilLivreur from "./ProfilLivreur.jsx";
import { getLivraisons, getHistorique, changerStatut } from "../../api.js";
import styles from "./DashboardLivreur.module.css";

export default function DashboardLivreur() {
  const navigate = useNavigate();

  const userLocal = JSON.parse(localStorage.getItem("user") || "{}");

  const [page, setPage] = useState("livraisons");
  const [livraisonActive, setLivraisonActive] = useState(null);
  const [livraisonsEnAttente, setLivraisonsEnAttente] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [nomPharmacie, setNomPharmacie] = useState("");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // Charger les livraisons au montage
  useEffect(() => {
    chargerLivraisons();
    chargerHistorique();
  }, []);

  const chargerLivraisons = async () => {
    try {
      setChargement(true);
      const res = await getLivraisons();
      const data = res.data;

      if (data.length > 0) setNomPharmacie(data[0].nom_pharmacie);

      // Séparer active (EN_LIVRAISON en premier) et en attente
      const enCours = data.find((l) => l.statut === "EN_LIVRAISON") || null;
      const enAttente = data.filter((l) => l !== enCours);

      setLivraisonActive(enCours);
      setLivraisonsEnAttente(enAttente);
    } catch (e) {
      setErreur("Impossible de charger les livraisons.");
    } finally {
      setChargement(false);
    }
  };

  const chargerHistorique = async () => {
    try {
      const res = await getHistorique();
      setHistorique(res.data);
    } catch (e) {
      console.error("Erreur historique:", e);
    }
  };

  const handleStatutChange = async (nouveauStatut) => {
    try {
      await changerStatut(livraisonActive.id_commande, nouveauStatut);
      if (nouveauStatut === "LIVREE") {
        setHistorique([{ ...livraisonActive, statut: "LIVREE" }, ...historique]);
        setLivraisonActive(null);
      } else {
        setLivraisonActive({ ...livraisonActive, statut: nouveauStatut });
      }
    } catch (e) {
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleRetourFile = async () => {
    try {
      await changerStatut(livraisonActive.id_commande, "ACCEPTEE");
      setLivraisonsEnAttente([...livraisonsEnAttente, { ...livraisonActive, statut: "ACCEPTEE" }]);
      setLivraisonActive(null);
    } catch (e) {
      alert("Erreur lors du retour en file.");
    }
  };

  const handleActiver = (idCommande) => {
    const nouvelleActive = livraisonsEnAttente.find((l) => l.id_commande === idCommande);
    if (!nouvelleActive) return;

    const resteEnAttente = livraisonsEnAttente.filter((l) => l.id_commande !== idCommande);
    if (livraisonActive) resteEnAttente.unshift(livraisonActive);

    setLivraisonActive(nouvelleActive);
    setLivraisonsEnAttente(resteEnAttente);
  };

  const handleVoirDetails = (idCommande) => {
    console.log("Voir détails commande", idCommande);
  };

  const handleDeconnexion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/connexion");
  };

  const nombreEnAttente = livraisonsEnAttente.length;
  const sousTitre =
    nombreEnAttente === 0
      ? "Aucune livraison en attente"
      : `Vous avez ${nombreEnAttente} livraison${nombreEnAttente > 1 ? "s" : ""} en attente`;

  if (chargement) {
    return (
      <div className={styles.chargement}>
        Chargement...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Sidebar
        livreur={userLocal}
        pageCourante={page}
        onNaviguer={setPage}
      />

      <main className={styles.contenu}>
        {erreur && <div className={styles.erreurBanner}>{erreur}</div>}

        {page === "livraisons" && (
          <>
            <div className={styles.enTete}>
              <div>
                <h1 className={styles.titre}>Mes livraisons</h1>
                <p className={styles.sousTitre}>{sousTitre}</p>
              </div>
              {nomPharmacie && (
                <span className={styles.badgePharmacie}>{nomPharmacie}</span>
              )}
            </div>

            <section className={styles.sectionActive}>
              <h2 className={styles.titreSection}>
                <span className={styles.puce} /> Livraison en cours
              </h2>
              {livraisonActive ? (
                <LivraisonEnCours
                  livraison={livraisonActive}
                  onStatutChange={handleStatutChange}
                  onRetourFile={handleRetourFile}
                />
              ) : (
                <div className={styles.aucuneActive}>
                  Aucune livraison active. Choisissez-en une dans la liste ci-dessous.
                </div>
              )}
            </section>

            <ListeAttente
              livraisons={livraisonsEnAttente}
              onActiver={handleActiver}
              onVoirDetails={handleVoirDetails}
            />

            <Historique historique={historique} />
          </>
        )}

        {page === "profil" && (
          <ProfilLivreur
            livreur={userLocal}
            onDeconnexion={handleDeconnexion}
          />
        )}
      </main>
    </div>
  );
}