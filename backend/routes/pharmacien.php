<?php
require_once __DIR__ . '/../middleware/auth.php';

$user = verifierRole(['PHARMACIEN']);
$id_pharmacien = $user->id;
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Récupérer l'id_pharmacie du pharmacien connecté
function getIdPharmacie($pdo, $id_pharmacien) {
    $stmt = $pdo->prepare("SELECT id_pharmacie FROM Pharmacie WHERE id_pharmacien = ?");
    $stmt->execute([$id_pharmacien]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? $row['id_pharmacie'] : null;
}

$id_pharmacie = getIdPharmacie($pdo, $id_pharmacien);

if (!$id_pharmacie) {
    http_response_code(404);
    echo json_encode(['erreur' => 'Aucune pharmacie associée à ce compte']);
    exit();
}

// GET - Commandes en attente
if ($method === 'GET' && $action === 'commandes-attente') {
    $stmt = $pdo->prepare("
        SELECT 
            c.id_commande,
            c.mode,
            c.statut,
            c.adresse_livraison,
            c.date_commande,
            u.nom AS nom_patient,
            u.prenom AS prenom_patient
        FROM Commande c
        JOIN Patient pa ON c.id_patient = pa.id_patient
        JOIN Utilisateur u ON pa.id_patient = u.id_utilisateur
        WHERE c.id_pharmacie = ?
        AND c.statut = 'EN_ATTENTE'
        ORDER BY c.date_commande ASC
    ");
    $stmt->execute([$id_pharmacie]);
    $commandes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmtOrdo = $pdo->prepare("
        SELECT id_ordonnance, fichier, type_fichier
        FROM Ordonnance
        WHERE id_commande = ?
    ");
    foreach ($commandes as &$commande) {
        $stmtOrdo->execute([$commande['id_commande']]);
        $commande['ordonnances'] = $stmtOrdo->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($commandes);
}

// GET - Commandes en cours de traitement (acceptées ou en livraison)
elseif ($method === 'GET' && $action === 'commandes-en-cours') {
    $stmt = $pdo->prepare("
        SELECT 
            c.id_commande,
            c.mode,
            c.statut,
            c.adresse_livraison,
            c.date_commande,
            u.nom AS nom_patient,
            u.prenom AS prenom_patient,
            lu.nom AS nom_livreur,
            lu.prenom AS prenom_livreur
        FROM Commande c
        JOIN Patient pa ON c.id_patient = pa.id_patient
        JOIN Utilisateur u ON pa.id_patient = u.id_utilisateur
        LEFT JOIN Livreur l ON c.id_livreur = l.id_livreur
        LEFT JOIN Utilisateur lu ON l.id_livreur = lu.id_utilisateur
        WHERE c.id_pharmacie = ?
        AND c.statut IN ('ACCEPTEE', 'EN_LIVRAISON')
        ORDER BY c.date_commande ASC
    ");
    $stmt->execute([$id_pharmacie]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// GET - Historique des commandes (refusées + livrées, avec filtre optionnel)
elseif ($method === 'GET' && $action === 'historique-commandes') {
    $filtre = $_GET['filtre'] ?? 'toutes';

    $sql = "
        SELECT 
            c.id_commande,
            c.mode,
            c.statut,
            c.motif_refus,
            c.date_commande,
            u.nom AS nom_patient,
            u.prenom AS prenom_patient
        FROM Commande c
        JOIN Patient pa ON c.id_patient = pa.id_patient
        JOIN Utilisateur u ON pa.id_patient = u.id_utilisateur
        WHERE c.id_pharmacie = ?
    ";

    $params = [$id_pharmacie];

    if ($filtre === 'acceptees') {
        $sql .= " AND c.statut IN ('ACCEPTEE', 'EN_LIVRAISON', 'LIVREE')";
    } elseif ($filtre === 'refusees') {
        $sql .= " AND c.statut = 'REFUSEE'";
    } elseif ($filtre === 'livrees') {
        $sql .= " AND c.statut = 'LIVREE'";
    } else {
        $sql .= " AND c.statut IN ('ACCEPTEE', 'REFUSEE', 'EN_LIVRAISON', 'LIVREE')";
    }

    $sql .= " ORDER BY c.date_commande DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $historique = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmtOrdo = $pdo->prepare("
        SELECT id_ordonnance, fichier, type_fichier
        FROM Ordonnance
        WHERE id_commande = ?
    ");
    foreach ($historique as &$commande) {
        $stmtOrdo->execute([$commande['id_commande']]);
        $commande['ordonnances'] = $stmtOrdo->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($historique);
}

// GET - Détails complets d'une commande (pour la modale "Voir détails")
elseif ($method === 'GET' && $action === 'details-commande') {
    $id_commande = $_GET['id_commande'] ?? null;

    if (!$id_commande) {
        http_response_code(400);
        echo json_encode(['erreur' => 'id_commande manquant']);
        exit();
    }

    $stmt = $pdo->prepare("
        SELECT 
            c.id_commande,
            c.mode,
            c.statut,
            c.motif_refus,
            c.adresse_livraison,
            c.date_commande,
            u.nom AS nom_patient,
            u.prenom AS prenom_patient,
            u.tel AS tel_patient,
            u.email AS email_patient,
            lu.nom AS nom_livreur,
            lu.prenom AS prenom_livreur
        FROM Commande c
        JOIN Patient pa ON c.id_patient = pa.id_patient
        JOIN Utilisateur u ON pa.id_patient = u.id_utilisateur
        LEFT JOIN Livreur l ON c.id_livreur = l.id_livreur
        LEFT JOIN Utilisateur lu ON l.id_livreur = lu.id_utilisateur
        WHERE c.id_commande = ? AND c.id_pharmacie = ?
    ");
    $stmt->execute([$id_commande, $id_pharmacie]);
    $commande = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$commande) {
        http_response_code(404);
        echo json_encode(['erreur' => 'Commande introuvable']);
        exit();
    }

    // Récupérer toutes les ordonnances liées à cette commande
    $stmt = $pdo->prepare("
        SELECT id_ordonnance, fichier, type_fichier, date_upload
        FROM Ordonnance
        WHERE id_commande = ?
    ");
    $stmt->execute([$id_commande]);
    $commande['ordonnances'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($commande);
}

// PUT - Accepter une commande
elseif ($method === 'PUT' && $action === 'accepter-commande') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id_commande = $data['id_commande'] ?? null;

    if (!$id_commande) {
        http_response_code(400);
        echo json_encode(['erreur' => 'id_commande manquant']);
        exit();
    }

    // Vérifier que la commande appartient bien à cette pharmacie et est en attente
    $stmt = $pdo->prepare("
        SELECT id_commande FROM Commande 
        WHERE id_commande = ? AND id_pharmacie = ? AND statut = 'EN_ATTENTE'
    ");
    $stmt->execute([$id_commande, $id_pharmacie]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['erreur' => 'Commande introuvable ou déjà traitée']);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE Commande SET statut = 'ACCEPTEE' WHERE id_commande = ?");
    $stmt->execute([$id_commande]);

    echo json_encode(['message' => 'Commande acceptée', 'statut' => 'ACCEPTEE']);
}

// PUT - Refuser une commande (avec motif obligatoire)
elseif ($method === 'PUT' && $action === 'refuser-commande') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id_commande = $data['id_commande'] ?? null;
    $motif = trim($data['motif_refus'] ?? '');

    if (!$id_commande || $motif === '') {
        http_response_code(400);
        echo json_encode(['erreur' => 'id_commande et motif_refus sont obligatoires']);
        exit();
    }

    $stmt = $pdo->prepare("
        SELECT id_commande FROM Commande 
        WHERE id_commande = ? AND id_pharmacie = ? AND statut = 'EN_ATTENTE'
    ");
    $stmt->execute([$id_commande, $id_pharmacie]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['erreur' => 'Commande introuvable ou déjà traitée']);
        exit();
    }

    $stmt = $pdo->prepare("
        UPDATE Commande SET statut = 'REFUSEE', motif_refus = ? WHERE id_commande = ?
    ");
    $stmt->execute([$motif, $id_commande]);

    echo json_encode(['message' => 'Commande refusée', 'statut' => 'REFUSEE']);
}

// PUT - Marquer une commande RETRAIT comme remise au patient
elseif ($method === 'PUT' && $action === 'remis-au-patient') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id_commande = $data['id_commande'] ?? null;

    if (!$id_commande) {
        http_response_code(400);
        echo json_encode(['erreur' => 'id_commande manquant']);
        exit();
    }

    $stmt = $pdo->prepare("
        SELECT id_commande FROM Commande 
        WHERE id_commande = ? AND id_pharmacie = ? AND mode = 'RETRAIT' AND statut = 'ACCEPTEE'
    ");
    $stmt->execute([$id_commande, $id_pharmacie]);
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['erreur' => 'Commande introuvable ou non éligible']);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE Commande SET statut = 'LIVREE' WHERE id_commande = ?");
    $stmt->execute([$id_commande]);

    echo json_encode(['message' => 'Commande marquée comme remise', 'statut' => 'LIVREE']);
}

// GET - Récupérer les horaires de la pharmacie
elseif ($method === 'GET' && $action === 'horaires') {
    $stmt = $pdo->prepare("
        SELECT id_horaire, jour_semaine, heure_ouverture, heure_fermeture
        FROM Horaire
        WHERE id_pharmacie = ?
    ");
    $stmt->execute([$id_pharmacie]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// PUT - Enregistrer les horaires (remplacement complet)
elseif ($method === 'PUT' && $action === 'horaires') {
    $data = json_decode(file_get_contents('php://input'), true);
    $horaires = $data['horaires'] ?? [];

    // Supprimer tous les anciens horaires
    $stmt = $pdo->prepare("DELETE FROM Horaire WHERE id_pharmacie = ?");
    $stmt->execute([$id_pharmacie]);

    // Réinsérer les jours ouverts
    $stmt = $pdo->prepare("
        INSERT INTO Horaire (jour_semaine, heure_ouverture, heure_fermeture, id_pharmacie)
        VALUES (?, ?, ?, ?)
    ");
    foreach ($horaires as $h) {
        if (!empty($h['jour_semaine']) && !empty($h['heure_ouverture']) && !empty($h['heure_fermeture'])) {
            $stmt->execute([$h['jour_semaine'], $h['heure_ouverture'], $h['heure_fermeture'], $id_pharmacie]);
        }
    }

    echo json_encode(['message' => 'Horaires enregistrés avec succès']);
}


// GET - Gardes de la pharmacie
elseif ($method === 'GET' && $action === 'gardes') {
    $stmt = $pdo->prepare("
        SELECT id_garde, date_debut, date_fin, active, validee
        FROM Garde
        WHERE id_pharmacie = ?
        AND date_fin >= NOW()
        ORDER BY date_debut ASC
    ");
    $stmt->execute([$id_pharmacie]);
    $gardes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Récupérer aussi le tel de la pharmacie (numéro de garde)
    $stmt = $pdo->prepare("SELECT tel FROM Pharmacie WHERE id_pharmacie = ?");
    $stmt->execute([$id_pharmacie]);
    $pharmacie = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'gardes'       => $gardes,
        'tel_pharmacie' => $pharmacie['tel'] ?? null,
    ]);
}

// GET - Notifications du pharmacien
elseif ($method === 'GET' && $action === 'notifications') {
    $stmt = $pdo->prepare("
        SELECT id_notification, message, type, date_envoi, lue, id_commande
        FROM Notification
        WHERE id_utilisateur = ?
        ORDER BY date_envoi DESC
        LIMIT 50
    ");
    $stmt->execute([$id_pharmacien]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
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
    $stmt->execute([$id_notification, $id_pharmacien]);
    echo json_encode(['message' => 'Notification marquée comme lue']);
}

// PUT - Tout marquer comme lu
elseif ($method === 'PUT' && $action === 'notifications-toutes-lues') {
    $stmt = $pdo->prepare("
        UPDATE Notification SET lue = 1 WHERE id_utilisateur = ?
    ");
    $stmt->execute([$id_pharmacien]);
    echo json_encode(['message' => 'Toutes les notifications marquées comme lues']);
}

else {
    http_response_code(405);
    echo json_encode(['erreur' => 'Action non reconnue']);
}
?>