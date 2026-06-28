<?php
require_once __DIR__ . '/../middleware/auth.php';

$user = verifierRole(['LIVREUR']);
$id_livreur = $user->id;
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET - Récupérer les livraisons assignées au livreur
if ($method === 'GET' && $action === 'livraisons') {
    $stmt = $pdo->prepare("
        SELECT 
            c.id_commande,
            c.statut,
            c.mode,
            c.adresse_livraison,
            c.date_commande,
            u.nom AS nom_patient,
            u.prenom AS prenom_patient,
            p.nom AS nom_pharmacie
        FROM Commande c
        JOIN Patient pa ON c.id_patient = pa.id_patient
        JOIN Utilisateur u ON pa.id_patient = u.id_utilisateur
        JOIN Pharmacie p ON c.id_pharmacie = p.id_pharmacie
        WHERE c.id_livreur = ?
        AND c.statut IN ('ACCEPTEE', 'EN_LIVRAISON')
        ORDER BY c.date_commande DESC
    ");
    $stmt->execute([$id_livreur]);
    $livraisons = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formater nom_patient
    foreach ($livraisons as &$l) {
        $l['nom_patient'] = $l['prenom_patient'] . ' ' . $l['nom_patient'];
        unset($l['prenom_patient']);
    }

    echo json_encode($livraisons);
}

// GET - Historique des livraisons terminées
elseif ($method === 'GET' && $action === 'historique') {
    $stmt = $pdo->prepare("
        SELECT 
            c.id_commande,
            c.statut,
            c.date_commande,
            u.nom AS nom_patient,
            u.prenom AS prenom_patient
        FROM Commande c
        JOIN Patient pa ON c.id_patient = pa.id_patient
        JOIN Utilisateur u ON pa.id_patient = u.id_utilisateur
        WHERE c.id_livreur = ?
        AND c.statut = 'LIVREE'
        ORDER BY c.date_commande DESC
    ");
    $stmt->execute([$id_livreur]);
    $historique = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($historique as &$l) {
        $l['nom_patient'] = $l['prenom_patient'] . ' ' . $l['nom_patient'];
        unset($l['prenom_patient']);
    }

    echo json_encode($historique);
}

// PUT - Changer le statut d'une commande
elseif ($method === 'PUT' && $action === 'statut') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id_commande   = $data['id_commande'] ?? null;
    $nouveau_statut = $data['statut'] ?? null;

    $statuts_valides = ['EN_LIVRAISON', 'LIVREE'];
    if (!$id_commande || !in_array($nouveau_statut, $statuts_valides)) {
        http_response_code(400);
        echo json_encode(['erreur' => 'Données invalides']);
        exit();
    }

    // Vérifier que la commande appartient bien à ce livreur
    $stmt = $pdo->prepare("
        SELECT id_commande FROM Commande 
        WHERE id_commande = ? AND id_livreur = ?
    ");
    $stmt->execute([$id_commande, $id_livreur]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['erreur' => 'Commande introuvable ou non autorisée']);
        exit();
    }

    $stmt = $pdo->prepare("
        UPDATE Commande SET statut = ? WHERE id_commande = ?
    ");
    $stmt->execute([$nouveau_statut, $id_commande]);

    echo json_encode(['message' => 'Statut mis à jour', 'statut' => $nouveau_statut]);
}

// GET - Profil du livreur
elseif ($method === 'GET' && $action === 'profil') {
    $stmt = $pdo->prepare("
        SELECT 
            u.id_utilisateur,
            u.nom,
            u.prenom,
            u.tel,
            u.email,
            p.nom AS nom_pharmacie,
            COUNT(c.id_commande) AS nb_livraisons
        FROM Utilisateur u
        JOIN Livreur l ON u.id_utilisateur = l.id_livreur
        JOIN Pharmacie p ON l.id_pharmacie = p.id_pharmacie
        LEFT JOIN Commande c ON c.id_livreur = l.id_livreur AND c.statut = 'LIVREE'
        WHERE u.id_utilisateur = ?
        GROUP BY u.id_utilisateur, p.nom
    ");
    $stmt->execute([$id_livreur]);
    $profil = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$profil) {
        http_response_code(404);
        echo json_encode(['erreur' => 'Profil introuvable']);
        exit();
    }

    echo json_encode($profil);
}

// GET - Notifications du livreur (non lues + récentes)
elseif ($method === 'GET' && $action === 'notifications') {
    $stmt = $pdo->prepare("
        SELECT id_notification, message, type, date_envoi, lue, id_commande
        FROM Notification
        WHERE id_utilisateur = ?
        ORDER BY date_envoi DESC
        LIMIT 20
    ");
    $stmt->execute([$id_livreur]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($notifications);
}

// PUT - Marquer une notification comme lue
elseif ($method === 'PUT' && $action === 'notification-lue') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id_notification = $data['id_notification'] ?? null;

    if (!$id_notification) {
        http_response_code(400);
        echo json_encode(['erreur' => 'id_notification manquant']);
        exit();
    }

    $stmt = $pdo->prepare("
        UPDATE Notification SET lue = 1 
        WHERE id_notification = ? AND id_utilisateur = ?
    ");
    $stmt->execute([$id_notification, $id_livreur]);

    echo json_encode(['message' => 'Notification marquée comme lue']);
}

else {
    http_response_code(405);
    echo json_encode(['erreur' => 'Action non reconnue']);
}
?>


