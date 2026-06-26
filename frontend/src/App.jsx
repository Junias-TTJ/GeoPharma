import { Routes, Route } from "react-router-dom";
import Connexion from "./pages/Connexion.jsx";
import Inscription from "./pages/Inscription.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Connexion />} />
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="*" element={<p>Page en construction</p>} />
    </Routes>
  );
}