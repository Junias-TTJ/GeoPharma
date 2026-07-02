<?php
require_once '../config.php';
require_once '../middleware/auth.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier que c'est un admin
$adminConnecte = verifierRole(['ADMINISTRATEUR']);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ============================================================
// STATISTIQUES GLOBALES
// ============================================================
if ($method === 'GET' && $action === 'stats') {
    $stats = [];

    $stmt = $pdo->query("SELECT COUNT(*) FROM Pharmacie");
    $stats['total_pharmacies'] = (int)$stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) FROM Pharmacie WHERE est_active = 1");
    $stats['pharmacies_actives'] = (int)$stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) FROM Utilisateur WHERE statut_compte = 'EN_ATTENTE_VALIDATION'");
    $stats['comptes_en_attente'] = (int)$stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) FROM Commande");
    $stats['total_commandes'] = (int)$stmt->fetchColumn();

    echo json_encode($stats);
}

// ============================================================
// COMPTES EN ATTENTE DE VALIDATION
// ============================================================
elseif ($method === 'GET' && $action === 'comptes_attente') {
    $stmt = $pdo->query("
        SELECT u.id_utilisateur, u.nom, u.prenom, u.tel, u.email,
               u.role, u.date_creation,
               p.id_pharmacie AS pharmacie_id,
               ph.nom AS nom_pharmacie
        FROM Utilisateur u
        LEFT JOIN Livreur l ON l.id_utilisateur = u.id_utilisateur
        LEFT JOIN Pharmacien ph_ext ON ph_ext.id_utilisateur = u.id_utilisateur
        LEFT JOIN Pharmacie p ON p.id_pharmacie = l.id_pharmacie
                              OR p.id_pharmacien = u.id_utilisateur
        LEFT JOIN Pharmacie ph ON ph.id_pharmacie = p.id_pharmacie
        WHERE u.statut_compte = 'EN_ATTENTE_VALIDATION'
        ORDER BY u.date_creation DESC
    ");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// ============================================================
// VALIDER UN COMPTE
// ============================================================
elseif ($method === 'POST' && $action === 'valider_compte') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id_utilisateur'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['erreur' => 'id_utilisateur requis']);
        exit();
    }

    $stmt = $pdo->prepare("
        UPDATE Utilisateur SET statut_compte = 'ACTIF'
        WHERE id_utilisateur = ? AND statut_compte = 'EN_ATTENTE_VALIDATION'
    ");
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['erreur' => 'Compte introuvable ou déjà validé']);
        exit();
    }

    // Insérer une notification pour l'utilisateur
    $stmt = $pdo->prepare("
        INSERT INTO Notification (message, type, id_utilisateur)
        VALUES ('Votre compte a été validé. Vous pouvez maintenant vous connecter.', 'INFO', ?)
    ");
    $stmt->execute([$id]);

    echo json_encode(['message' => 'Compte validé avec succès']);
}

// ============================================================
// REFUSER / SUSPENDRE UN COMPTE
// ============================================================
elseif ($method === 'POST' && $action === 'refuser_compte') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id_utilisateur'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['erreur' => 'id_utilisateur requis']);
        exit();
    }

    $stmt = $pdo->prepare("
        UPDATE Utilisateur SET statut_compte = 'SUSPENDU'
        WHERE id_utilisateur = ?
    ");
    $stmt->execute([$id]);

    echo json_encode(['message' => 'Compte refusé/suspendu']);
}

// ============================================================
// LISTE DES UTILISATEURS
// ============================================================
elseif ($method === 'GET' && $action === 'utilisateurs') {
    $role   = $_GET['role'] ?? null;
    $statut = $_GET['statut'] ?? null;

    $where = [];
    $params = [];

    if ($role) {
        $where[] = "u.role = ?";
        $params[] = $role;
    }
    if ($statut) {
        $where[] = "u.statut_compte = ?";
        $params[] = $statut;
    }

    $whereClause = $where ? "WHERE " . implode(" AND ", $where) : "";

    $stmt = $pdo->prepare("
        SELECT u.id_utilisateur, u.nom, u.prenom, u.tel, u.email,
               u.role, u.statut_compte, u.date_creation
        FROM Utilisateur u
        $whereClause
        ORDER BY u.date_creation DESC
    ");
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// ============================================================
// LISTE DES PHARMACIES
// ============================================================
elseif ($method === 'GET' && $action === 'pharmacies') {
    $stmt = $pdo->query("
        SELECT p.*, 
               u.nom AS pharmacien_nom, 
               u.prenom AS pharmacien_prenom
        FROM Pharmacie p
        LEFT JOIN Pharmacien ph ON ph.id_utilisateur = p.id_pharmacien
        LEFT JOIN Utilisateur u ON u.id_utilisateur = p.id_pharmacien
        ORDER BY p.nom ASC
    ");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// ============================================================
// AJOUTER UNE PHARMACIE
// ============================================================
elseif ($method === 'POST' && $action === 'ajouter_pharmacie') {
    $data = json_decode(file_get_contents('php://input'), true);

    $nom       = $data['nom'] ?? '';
    $adresse   = $data['adresse'] ?? '';
    $latitude  = $data['latitude'] ?? null;
    $longitude = $data['longitude'] ?? null;
    $tel       = $data['tel'] ?? '';

    if (!$nom || !$adresse || !$latitude || !$longitude || !$tel) {
        http_response_code(400);
        echo json_encode(['erreur' => 'Tous les champs sont obligatoires']);
        exit();
    }

    $stmt = $pdo->prepare("
        INSERT INTO Pharmacie (nom, adresse, latitude, longitude, tel, statut, est_active)
        VALUES (?, ?, ?, ?, ?, 'FERMEE', FALSE)
    ");
    $stmt->execute([$nom, $adresse, $latitude, $longitude, $tel]);
    $id = $pdo->lastInsertId();

    echo json_encode(['message' => 'Pharmacie ajoutée', 'id_pharmacie' => $id]);
}

// ============================================================
// MODIFIER UNE PHARMACIE
// ============================================================
elseif ($method === 'POST' && $action === 'modifier_pharmacie') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id_pharmacie'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['erreur' => 'id_pharmacie requis']);
        exit();
    }

    $stmt = $pdo->prepare("
        UPDATE Pharmacie
        SET nom = ?, adresse = ?, tel = ?, 
            latitude = ?, longitude = ?, est_active = ?
        WHERE id_pharmacie = ?
    ");
    $stmt->execute([
        $data['nom']       ?? '',
        $data['adresse']   ?? '',
        $data['tel']       ?? '',
        $data['latitude']  ?? null,
        $data['longitude'] ?? null,
        $data['est_active'] ?? false,
        $id
    ]);

    echo json_encode(['message' => 'Pharmacie mise à jour']);
}

// ============================================================
// ACTIVER / DÉSACTIVER UNE PHARMACIE
// ============================================================
elseif ($method === 'POST' && $action === 'toggle_pharmacie') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id_pharmacie'] ?? null;
    $activer = $data['est_active'] ?? false;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['erreur' => 'id_pharmacie requis']);
        exit();
    }

    $stmt = $pdo->prepare("
        UPDATE Pharmacie SET est_active = ? WHERE id_pharmacie = ?
    ");
    $stmt->execute([$activer ? 1 : 0, $id]);

    echo json_encode(['message' => $activer ? 'Pharmacie activée' : 'Pharmacie désactivée']);
}

// ============================================================
// PLANNING DES GARDES
// ============================================================
elseif ($method === 'GET' && $action === 'gardes') {
    $stmt = $pdo->query("
        SELECT g.*, p.nom AS nom_pharmacie
        FROM Garde g
        JOIN Pharmacie p ON p.id_pharmacie = g.id_pharmacie
        ORDER BY g.date_debut DESC
    ");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// ============================================================
// VALIDER UNE GARDE
// ============================================================
elseif ($method === 'POST' && $action === 'valider_garde') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id_garde'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['erreur' => 'id_garde requis']);
        exit();
    }

    $stmt = $pdo->prepare("
        UPDATE Garde SET validee = TRUE WHERE id_garde = ?
    ");
    $stmt->execute([$id]);

    echo json_encode(['message' => 'Garde validée']);
}

// ============================================================
// RATTACHER UN LIVREUR À UNE PHARMACIE
// ============================================================
elseif ($method === 'POST' && $action === 'rattacher_livreur') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id_livreur   = $data['id_livreur'] ?? null;
    $id_pharmacie = $data['id_pharmacie'] ?? null;

    if (!$id_livreur || !$id_pharmacie) {
        http_response_code(400);
        echo json_encode(['erreur' => 'id_livreur et id_pharmacie requis']);
        exit();
    }

    $stmt = $pdo->prepare("
        UPDATE Livreur SET id_pharmacie = ? WHERE id_utilisateur = ?
    ");
    $stmt->execute([$id_pharmacie, $id_livreur]);

    echo json_encode(['message' => 'Livreur rattaché à la pharmacie']);
}

// ============================================================
// MÉTHODE NON AUTORISÉE
// ============================================================
else {
    http_response_code(405);
    echo json_encode(['erreur' => 'Action non reconnue']);
}
?>