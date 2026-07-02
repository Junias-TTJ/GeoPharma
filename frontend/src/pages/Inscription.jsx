import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { inscription, getPharmacies } from "../api.js";
import { FiEye, FiEyeOff, FiUser, FiUsers, FiTruck } from "react-icons/fi";
import styles from "./Connexion.module.css";
import logo from "../../../geopharma_logo_v2.svg";

const ROLES = [
  { id: "PATIENT",    label: "Patient",     icone: FiUser,   desc: "Je cherche des médicaments" },
  { id: "PHARMACIEN", label: "Pharmacien",  icone: FiUsers,  desc: "Je gère une pharmacie"      },
  { id: "LIVREUR",    label: "Livreur",     icone: FiTruck,  desc: "Je livre des commandes"     },
];

export default function Inscription() {
  const navigate = useNavigate();

  const [role, setRole]           = useState("PATIENT");
  const [pharmacies, setPharmacies] = useState([]);
  const [form, setForm]           = useState({
    nom:           "",
    prenom:        "",
    telephone:     "",
    email:         "",
    mot_de_passe:  "",
    confirmation:  "",
    id_pharmacie:  "",
  });
  const [erreur, setErreur]           = useState("");
  const [chargement, setChargement]   = useState(false);
  const [voirMdp, setVoirMdp]         = useState(false);
  const [voirConfirm, setVoirConfirm] = useState(false);

  useEffect(() => {
    if (role === "PHARMACIEN" || role === "LIVREUR") {
      chargerPharmacies();
    }
  }, [role]);

  const chargerPharmacies = async () => {
    try {
      const res = await getPharmacies();
      setPharmacies(res.data);
    } catch (e) {
      console.error("Erreur chargement pharmacies:", e);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreur("");
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom || !form.telephone || !form.mot_de_passe || !form.confirmation) {
      setErreur("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (form.mot_de_passe.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (form.mot_de_passe !== form.confirmation) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }
    if ((role === "PHARMACIEN" || role === "LIVREUR") && !form.id_pharmacie) {
      setErreur("Veuillez sélectionner votre pharmacie.");
      return;
    }

    setChargement(true);
    try {
      await inscription({
        nom:          form.nom,
        prenom:       form.prenom,
        tel:          form.telephone,
        email:        form.email || null,
        mot_de_passe: form.mot_de_passe,
        role,
        id_pharmacie: form.id_pharmacie || null,
      });

      if (role === "PATIENT") {
        navigate("/connexion");
      } else {
        navigate("/connexion?inscription=pro");
      }
    } catch (err) {
      setErreur(err.response?.data?.erreur || "Erreur lors de l'inscription.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoZone}>
          <img src={logo} alt="GeoPharma" className={styles.logo} />
        </div>

        <h2 className={styles.titre}>Créer un compte</h2>

        {/* Choix du rôle */}
        <div className={styles.rolesZone}>
          {ROLES.map(({ id, label, icone: Icone, desc }) => (
            <button
              key={id}
              className={role === id ? styles.roleActif : styles.role}
              onClick={() => { setRole(id); setErreur(""); }}
              type="button"
            >
              <Icone size={18} />
              <div className={styles.roleTexte}>
                <span className={styles.roleLabel}>{label}</span>
                <span className={styles.roleDesc}>{desc}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Bannière info pour pros */}
        {(role === "PHARMACIEN" || role === "LIVREUR") && (
          <div className={styles.banniereInfo}>
            Votre compte sera soumis à validation par un administrateur avant activation.
          </div>
        )}

        {/* Champs */}
        <div className={styles.grille}>
          <div className={styles.champZone}>
            <label className={styles.label}>Nom *</label>
            <input
              className={styles.input}
              type="text"
              name="nom"
              placeholder="Diallo"
              value={form.nom}
              onChange={handleChange}
            />
          </div>
          <div className={styles.champZone}>
            <label className={styles.label}>Prénom *</label>
            <input
              className={styles.input}
              type="text"
              name="prenom"
              placeholder="Aminata"
              value={form.prenom}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.champZone}>
          <label className={styles.label}>Téléphone *</label>
          <input
            className={styles.input}
            type="text"
            name="telephone"
            placeholder="Ex: 77 123 45 67"
            value={form.telephone}
            onChange={handleChange}
          />
        </div>

        <div className={styles.champZone}>
          <label className={styles.label}>Email (optionnel)</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="vous@exemple.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        {/* Sélection pharmacie pour pros */}
        {(role === "PHARMACIEN" || role === "LIVREUR") && (
          <div className={styles.champZone}>
            <label className={styles.label}>Pharmacie rattachée *</label>
            <select
              className={styles.input}
              name="id_pharmacie"
              value={form.id_pharmacie}
              onChange={handleChange}
            >
              <option value="">Sélectionnez une pharmacie...</option>
              {pharmacies.map((p) => (
                <option key={p.id_pharmacie} value={p.id_pharmacie}>
                  {p.nom} — {p.adresse}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.champZone}>
          <label className={styles.label}>Mot de passe *</label>
          <div className={styles.inputWrapper}>
            <input
              className={styles.input}
              type={voirMdp ? "text" : "password"}
              name="mot_de_passe"
              placeholder="8 caractères minimum"
              value={form.mot_de_passe}
              onChange={handleChange}
            />
            <span className={styles.eyeIcon} onClick={() => setVoirMdp(!voirMdp)}>
              {voirMdp ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        <div className={styles.champZone}>
          <label className={styles.label}>Confirmer le mot de passe *</label>
          <div className={styles.inputWrapper}>
            <input
              className={styles.input}
              type={voirConfirm ? "text" : "password"}
              name="confirmation"
              placeholder="Retapez le mot de passe"
              value={form.confirmation}
              onChange={handleChange}
            />
            <span className={styles.eyeIcon} onClick={() => setVoirConfirm(!voirConfirm)}>
              {voirConfirm ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>

        {erreur && <p className={styles.erreur}>{erreur}</p>}

        <button
          className={chargement ? styles.boutonDisabled : styles.bouton}
          onClick={handleSubmit}
          disabled={chargement}
          type="button"
        >
          {chargement ? "Création en cours..." : "S'inscrire"}
        </button>

        <p className={styles.lienTexte}>
          Déjà un compte ?{" "}
          <span className={styles.lien} onClick={() => navigate("/connexion")}>
            Se connecter
          </span>
        </p>
      </div>
    </div>
  );
}