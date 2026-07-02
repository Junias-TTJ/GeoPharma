import { useState, useEffect } from "react";
import { FiShoppingBag, FiPackage, FiXCircle, FiClock, FiBell } from "react-icons/fi";
import {
  getNotificationsPharmacien,
  marquerNotifPharmacienLue,
  toutMarquerCommeLu,
} from "../../api.js";
import styles from "./NotificationsPage.module.css";

const CONFIG_TYPE = {
  NOUVELLE_COMMANDE:  { icone: FiShoppingBag, label: "Nouvelle commande",   style: "iconeCommande"  },
  LIVRAISON_TERMINEE: { icone: FiPackage,     label: "Livraison terminée",   style: "iconeLivraison" },
  COMMANDE_ANNULEE:   { icone: FiXCircle,     label: "Commande annulée",     style: "iconeAnnulee"   },
  RAPPEL_GARDE:       { icone: FiClock,       label: "Rappel de garde",      style: "iconeGarde"     },
  ACCEPTATION:        { icone: FiShoppingBag, label: "Commande acceptée",    style: "iconeCommande"  },
};

function formaterDate(dateString) {
  const date      = new Date(dateString.replace(" ", "T"));
  const maintenant = new Date();
  const diffMs    = maintenant - date;
  const diffMin   = Math.floor(diffMs / 60000);

  if (diffMin < 1)  return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `Il y a ${diffH}h`;
  const diffJ = Math.floor(diffH / 24);
  if (diffJ === 1)  return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function NotificationsPage({
  notifications,
  chargement,
  erreur,
  setNotifications,
  chargerNotifications,
}) {
  useEffect(() => {
    chargerNotifications();
  }, []);

  const handleClicNotification = async (notification) => {
    if (Number(notification.lue) === 1) return;
    try {
      await marquerNotifPharmacienLue(notification.id_notification);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id_notification === notification.id_notification ? { ...n, lue: 1 } : n
        )
      );
    } catch (e) {
      console.error("Erreur marquage notification:", e);
    }
  };

  const handleToutMarquer = async () => {
    try {
      await toutMarquerCommeLu();
      setNotifications((prev) => prev.map((n) => ({ ...n, lue: 1 })));
    } catch (e) {
      console.error("Erreur tout marquer comme lu:", e);
    }
  };

  const nombreNonLues = notifications.filter((n) => !Number(n.lue)).length;

  if (chargement) {
    return <div className={styles.chargement}>Chargement...</div>;
  }

  if (erreur) {
    return <div className={styles.erreurBanner}>{erreur}</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.enTete}>
        <div className={styles.titreZone}>
          {nombreNonLues > 0 && <span className={styles.puce} />}
          <h2 className={styles.titre}>
            Notifications
            {nombreNonLues > 0 && (
              <span className={styles.compteur}> ({nombreNonLues} non lue{nombreNonLues > 1 ? "s" : ""})</span>
            )}
          </h2>
        </div>

        {nombreNonLues > 0 && (
          <button className={styles.boutonToutLire} onClick={handleToutMarquer}>
            ✓ Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className={styles.vide}>
          <FiBell size={40} className={styles.iconeVide} />
          <p>Aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className={styles.liste}>
          {notifications.map((notification) => {
            const config = CONFIG_TYPE[notification.type] || {
              icone: FiBell,
              label: notification.type,
              style: "iconeDefaut",
            };
            const Icone = config.icone;

            return (
              <button
                key={notification.id_notification}
                className={`${styles.item} ${!Number(notification.lue) ? styles.itemNonLue : ""}`}
                onClick={() => handleClicNotification(notification)}
              >
                <div className={`${styles.iconeZone} ${styles[config.style]}`}>
                  <Icone size={18} />
                </div>

                <div className={styles.contenu}>
                  <div className={styles.ligneHaut}>
                    <span className={styles.labelType}>{config.label}</span>
                    {!Number(notification.lue) && <span className={styles.pointNonLu} />}
                  </div>
                  <p className={styles.message}>{notification.message}</p>
                  <p className={styles.date}>{formaterDate(notification.date_envoi)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}