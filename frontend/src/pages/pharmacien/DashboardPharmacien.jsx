import { useState, useEffect } from "react";
import Sidebar from "./Sidebar.jsx";
import Commandes from "./Commandes.jsx";
import Horaires from "./Horaires.jsx";
import Gardes from "./Gardes.jsx";
import NotificationsPage from "./NotificationsPage.jsx";
import ProfilPharmacien from "./ProfilPharmacien.jsx";
import { getNotificationsPharmacien } from "../../api.js";
import styles from "./DashboardPharmacien.module.css";

const TITRES = {
  commandes: "Nos commandes",
  horaires: "Nos horaires",
  gardes: "Nos gardes",
  notifications: "Notifications",
  profil: "Mon profil",
};

const STATUT_PHARMACIE = {
  OUVERTE: { label: "Ouvert",   style: "badgeOuverte" },
  FERMEE:  { label: "Fermé",    style: "badgeFermee"  },
  GARDE:   { label: "Garde",    style: "badgeGarde"   },
};

export default function DashboardPharmacien() {
  const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
  const [page, setPage] = useState("commandes");

  const [notifications, setNotifications] = useState([]);
  const [chargementNotifs, setChargementNotifs] = useState(true);
  const [erreurNotifs, setErreurNotifs] = useState(null);

  const chargerNotifications = async () => {
    try {
      const res = await getNotificationsPharmacien();
      setNotifications(res.data);
      setErreurNotifs(null);
    } catch (e) {
      setErreurNotifs("Impossible de charger les notifications.");
    } finally {
      setChargementNotifs(false);
    }
  };

  useEffect(() => {
    chargerNotifications();
    const intervalle = setInterval(chargerNotifications, 25000);
    return () => clearInterval(intervalle);
  }, []);

  const nbNotificationsNonLues = notifications.filter((n) => !Number(n.lue)).length;
  const statutInfo = STATUT_PHARMACIE[userLocal?.statut_pharmacie] || null;

  return (
    <div className={styles.page}>
      <Sidebar
        pharmacien={userLocal}
        pageCourante={page}
        onNaviguer={setPage}
        nbNotificationsNonLues={nbNotificationsNonLues}
      />

      <main className={styles.contenu}>
        <div className={styles.enTete}>
          <div>
            <h1 className={styles.titre}>{TITRES[page]}</h1>
          </div>

          {userLocal?.nom_pharmacie && (
            <div className={styles.pharmacieRattachee}>
              <span className={styles.labelPharmacie}>Pharmacie rattachée :</span>
              <span className={styles.badgePharmacie}>{userLocal.nom_pharmacie}</span>
              {statutInfo && (
                <span className={styles[statutInfo.style]}>{statutInfo.label}</span>
              )}
            </div>
          )}
        </div>

        {page === "commandes"     && <Commandes />}
        {page === "horaires"      && <Horaires />}
        {page === "gardes"        && <Gardes />}
        {page === "notifications" && (
          <NotificationsPage
            notifications={notifications}
            setNotifications={setNotifications}
            chargerNotifications={chargerNotifications}
            chargement={chargementNotifs}
            erreur={erreurNotifs}
          />
        )}
        {page === "profil" && (
          <ProfilPharmacien pharmacien={userLocal} />
        )}
      </main>
    </div>
  );
}