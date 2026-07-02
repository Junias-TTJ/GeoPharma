import { useState, useEffect, useRef } from "react";
import { FiBell } from "react-icons/fi";
import { getNotifications, marquerNotificationLue } from "../../api.js";
import styles from "./Notifications.module.css";

const INTERVALLE_POLLING = 25000; // 25 secondes

function formaterDate(dateString) {
  const date = new Date(dateString.replace(" ", "T"));
  const maintenant = new Date();
  const diffMs = maintenant - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [ouvert, setOuvert] = useState(false);
  const conteneurRef = useRef(null);

  const chargerNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (e) {
      console.error("Erreur notifications:", e);
    }
  };

  useEffect(() => {
    chargerNotifications();
    const intervalle = setInterval(chargerNotifications, INTERVALLE_POLLING);
    return () => clearInterval(intervalle);
  }, []);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClicExterieur = (e) => {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target)) {
        setOuvert(false);
      }
    };
    document.addEventListener("mousedown", handleClicExterieur);
    return () => document.removeEventListener("mousedown", handleClicExterieur);
  }, []);

  const nombreNonLues = notifications.filter((n) => !Number(n.lue)).length;

  const handleClicNotification = async (notification) => {
    if (!Number(notification.lue)) {
      try {
        await marquerNotificationLue(notification.id_notification);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id_notification === notification.id_notification ? { ...n, lue: 1 } : n
          )
        );
      } catch (e) {
        console.error("Erreur marquage notification:", e);
      }
    }
  };

  return (
    <div className={styles.conteneur} ref={conteneurRef}>
      <button
        className={styles.boutonCloche}
        onClick={() => setOuvert(!ouvert)}
        aria-label="Notifications"
      >
        <FiBell size={20} />
        {nombreNonLues > 0 && (
          <span className={styles.badge}>{nombreNonLues > 9 ? "9+" : nombreNonLues}</span>
        )}
      </button>

      {ouvert && (
        <div className={styles.dropdown}>
          <div className={styles.enTeteDropdown}>
            <span className={styles.titreDropdown}>Notifications</span>
            {nombreNonLues > 0 && (
              <span className={styles.compteurDropdown}>{nombreNonLues} non lue{nombreNonLues > 1 ? "s" : ""}</span>
            )}
          </div>

          <div className={styles.liste}>
            {notifications.length === 0 ? (
              <p className={styles.vide}>Aucune notification pour le moment.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id_notification}
                  className={`${styles.item} ${!Number(notification.lue) ? styles.itemNonLue : ""}`}
                  onClick={() => handleClicNotification(notification)}
                >
                  {!Number(notification.lue) && <span className={styles.pointNonLu} />}
                  <div className={styles.itemContenu}>
                    <p className={styles.itemMessage}>{notification.message}</p>
                    <p className={styles.itemDate}>{formaterDate(notification.date_envoi)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}