import axios from "axios";

const BASE_URL = "http://localhost/geopharma/backend";

// Instance axios avec token automatique
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Intercepteur réponse : déconnexion auto si token expiré
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

/// ─── AUTH ───────────────────────────────────────────────
export const connexion = (telephone, mot_de_passe) =>
  api.post("/index.php?route=auth&action=connexion", { telephone, mot_de_passe });

export const inscription = (data) =>
  api.post("/index.php?route=auth&action=inscription", data);

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


// ─── NOTIFICATIONS ──────────────────────────────────────
export const getNotifications = () =>
  api.get("/index.php?route=livreur&action=notifications");

export const marquerNotificationLue = (id_notification) =>
  api.put("/index.php?route=livreur&action=notification-lue", { id_notification });