import axios from "axios";

const BASE_URL = "http://localhost/geopharma/backend";

// Instance axios avec token automatique
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isConnexionRequest = err.config?.url?.includes("route=auth&action=connexion");
    if (err.response?.status === 401 && !isConnexionRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/connexion";
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ───────────────────────────────────────────────
export const connexion = (telephone, mot_de_passe) =>
  api.post("/index.php?route=auth&action=connexion", { telephone, mot_de_passe });

export const inscription = (data) =>
  api.post("/index.php?route=auth&action=inscription", data);

export const getPharmacies = () =>
  axios.get(`${BASE_URL}/index.php?route=auth&action=pharmacies`);

// ─── LIVREUR ────────────────────────────────────────────
export const getLivraisons = () =>
  api.get("/index.php?route=livreur&action=livraisons");

export const getHistorique = () =>
  api.get("/index.php?route=livreur&action=historique");

export const changerStatut = (id_commande, statut) =>
  api.put("/index.php?route=livreur&action=statut", { id_commande, statut });

export const getProfilLivreur = () =>
  api.get("/index.php?route=livreur&action=profil");

// ─── UTILISATEUR ────────────────────────────────────────
export const modifierInfos = (data) =>
  api.put("/index.php?route=utilisateur&action=modifier-infos", data);

export const modifierMdp = (actuel, nouveau, confirmer) =>
  api.put("/index.php?route=utilisateur&action=modifier-mdp", { actuel, nouveau, confirmer });

export const supprimerCompte = () =>
  api.delete("/index.php?route=utilisateur&action=supprimer");

// ─── NOTIFICATIONS LIVREUR ──────────────────────────────
export const getNotifications = () =>
  api.get("/index.php?route=livreur&action=notifications");

export const marquerNotificationLue = (id_notification) =>
  api.put("/index.php?route=livreur&action=notification-lue", { id_notification });

// ─── PHARMACIEN — COMMANDES ─────────────────────────────
export const getCommandesAttente = () =>
  api.get("/index.php?route=pharmacien&action=commandes-attente");

export const getCommandesEnCours = () =>
  api.get("/index.php?route=pharmacien&action=commandes-en-cours");

export const getHistoriqueCommandes = (filtre = "toutes") =>
  api.get(`/index.php?route=pharmacien&action=historique-commandes&filtre=${filtre}`);

export const getDetailsCommande = (id_commande) =>
  api.get(`/index.php?route=pharmacien&action=details-commande&id_commande=${id_commande}`);

export const accepterCommande = (id_commande) =>
  api.put("/index.php?route=pharmacien&action=accepter-commande", { id_commande });

export const refuserCommande = (id_commande, motif_refus) =>
  api.put("/index.php?route=pharmacien&action=refuser-commande", { id_commande, motif_refus });

export const marquerRemisAuPatient = (id_commande) =>
  api.put("/index.php?route=pharmacien&action=remis-au-patient", { id_commande });

// ─── PHARMACIEN — HORAIRES ──────────────────────────────
export const getHoraires = () =>
  api.get("/index.php?route=pharmacien&action=horaires");

export const enregistrerHoraires = (horaires) =>
  api.put("/index.php?route=pharmacien&action=horaires", { horaires });

// ─── PHARMACIEN — GARDES ────────────────────────────────
export const getGardes = () =>
  api.get("/index.php?route=pharmacien&action=gardes");

// ─── PHARMACIEN — NOTIFICATIONS ─────────────────────────
export const getNotificationsPharmacien = () =>
  api.get("/index.php?route=pharmacien&action=notifications");

export const marquerNotifPharmacienLue = (id_notification) =>
  api.put("/index.php?route=pharmacien&action=notification-lue", { id_notification });

export const toutMarquerCommeLu = () =>
  api.put("/index.php?route=pharmacien&action=notifications-toutes-lues");

// ─── ADMIN ──────────────────────────────────────────────
export const getStatsAdmin = () =>
  api.get("/index.php?route=admin&action=stats");

export const getComptesEnAttente = () =>
  api.get("/index.php?route=admin&action=comptes-attente");

export const validerCompte = (id_utilisateur) =>
  api.put("/index.php?route=admin&action=valider-compte", { id_utilisateur });

export const refuserCompte = (id_utilisateur) =>
  api.put("/index.php?route=admin&action=refuser-compte", { id_utilisateur });

export const getTousUtilisateurs = () =>
  api.get("/index.php?route=admin&action=utilisateurs");

export const suspendreCompte = (id_utilisateur) =>
  api.put("/index.php?route=admin&action=suspendre-compte", { id_utilisateur });

export const reactiverCompte = (id_utilisateur) =>
  api.put("/index.php?route=admin&action=reactiver-compte", { id_utilisateur });

export const getToutesPharmacies = () =>
  api.get("/index.php?route=admin&action=pharmacies");

export const ajouterPharmacie = (data) =>
  api.post("/index.php?route=admin&action=ajouter-pharmacie", data);

export const modifierPharmacie = (data) =>
  api.put("/index.php?route=admin&action=modifier-pharmacie", data);

export const desactiverPharmacie = (id_pharmacie) =>
  api.put("/index.php?route=admin&action=desactiver-pharmacie", { id_pharmacie });

export const getGardesAdmin = () =>
  api.get("/index.php?route=admin&action=gardes");

export const validerGarde = (id_garde) =>
  api.put("/index.php?route=admin&action=valider-garde", { id_garde });

export const declarerGarde = (data) =>
  api.post("/index.php?route=admin&action=declarer-garde", data);

export const getNotificationsAdmin = () =>
  api.get("/index.php?route=admin&action=notifications");

export const marquerNotifAdminLue = (id_notification) =>
  api.put("/index.php?route=admin&action=notification-lue", { id_notification });

export const toutMarquerCommeLuAdmin = () =>
  api.put("/index.php?route=admin&action=notifications-toutes-lues");