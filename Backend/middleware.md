# Documentation des Middlewares

Ce document décrit les middlewares utilisés dans l'application CoreFlow Backend.

---

## 📁 Structure des fichiers

```
src/middlewares/
├── authMiddleware.js       # Authentification et autorisation
├── errorMiddleware.js      # Gestion des erreurs
└── validationMiddleware.js # Validation des données
```

---

## 🔐 authMiddleware.js

Middleware responsable de l'authentification et de l'autorisation des utilisateurs.

### `authenticate`

Vérifie que l'utilisateur est authentifié via un token JWT.

**Fonctionnement :**
1. Récupère le token depuis le header `Authorization` (format: `Bearer <token>`)
2. Décode le token en base64
3. Vérifie que l'utilisateur existe dans la base de données
4. Vérifie que le compte est actif
5. Attache les informations utilisateur à `req.user`

**Réponses d'erreur :**
| Code | Message |
|------|---------|
| 401 | Token d'authentification manquant |
| 401 | Utilisateur non trouvé |
| 401 | Votre compte a été désactivé |
| 401 | Token invalide |

**Exemple d'utilisation :**
```javascript
const { authenticate } = require('./middlewares/authMiddleware');

router.get('/profile', authenticate, (req, res) => {
  res.json(req.user);
});
```

---

### `authorize(...roles)`

Vérifie que l'utilisateur possède un des rôles autorisés.

**Paramètres :**
- `roles` : Liste des rôles autorisés (ex: `'admin'`, `'rh'`, `'manager'`, `'employe'`)

**Prérequis :** Doit être utilisé après `authenticate`

**Réponses d'erreur :**
| Code | Message |
|------|---------|
| 401 | Authentification requise |
| 403 | Vous n'avez pas les permissions nécessaires |

**Exemple d'utilisation :**
```javascript
const { authenticate, authorize } = require('./middlewares/authMiddleware');

// Seuls les admins et RH peuvent accéder
router.get('/users', authenticate, authorize('admin', 'rh'), userController.getAll);
```

---

## ⚠️ errorMiddleware.js

Middleware pour la gestion centralisée des erreurs.

### `notFound`

Gère les routes non trouvées (erreur 404).

**Réponse :**
```json
{
  "success": false,
  "message": "Route /api/unknown non trouvée"
}
```

---

### `errorHandler`

Gère toutes les erreurs de l'application.

**Fonctionnement :**
- Retourne le code d'erreur approprié (par défaut: 500)

**Réponse (production) :**
```json
{
  "success": false,
  "message": "Erreur serveur"
}
```

**Réponse (development) :**
```json
{
  "success": false,
  "message": "Erreur serveur",
  "stack": "Error: ...\n    at ..."
}
```

**Exemple d'utilisation (dans server.js) :**
```javascript
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// À placer en dernier
app.use(notFound);
app.use(errorHandler);
```

---

## ✅ validationMiddleware.js

Middleware pour la validation des données entrantes.

### `validateUserCreation`

Valide les données lors de la création d'un utilisateur.

**Champs requis :**
| Champ | Validation |
|-------|------------|
| `email` | Requis, format email valide |
| `password` | Requis, minimum 8 caractères |
| `nom` | Requis |
| `prenom` | Requis |
| `role` | Requis, doit être parmi : `admin`, `rh`, `manager`, `employe` |

**Réponse d'erreur (400) :**
```json
{
  "success": false,
  "message": "Données invalides",
  "errors": ["Email requis", "Format d'email invalide"]
}
```

---

### `validateUserUpdate`

Valide les données lors de la mise à jour d'un utilisateur.

**Champs validés (si fournis) :**
| Champ | Validation |
|-------|------------|
| `email` | Format email valide |
| `role` | Doit être parmi : `admin`, `rh`, `manager`, `employe` |

---

### `validateCongeCreation`

Valide les données lors de la création d'une demande de congé.

**Champs requis :**
| Champ | Validation |
|-------|------------|
| `date_debut` | Requis |
| `date_fin` | Requis, doit être >= date_debut |
| `type_conge` | Requis, doit être parmi : `conge_paye`, `rtt`, `maladie`, `sans_solde` |

**Exemple d'utilisation :**
```javascript
const { validateCongeCreation } = require('./middlewares/validationMiddleware');

router.post('/conges', authenticate, validateCongeCreation, congeController.create);
```

---

## 🔄 Ordre d'exécution recommandé

```javascript
// Routes protégées
router.use(authenticate);                    // 1. Vérifier le token
router.use(authorize('admin', 'rh'));        // 2. Vérifier les permissions
router.post('/users', validateUserCreation, userController.create); // 3. Valider les données

// Gestion des erreurs (en dernier)
app.use(notFound);
app.use(errorHandler);
```

---

## � Matrice des permissions par rôle

### Légende
- ✅ Autorisé
- ❌ Non autorisé

### Gestion des utilisateurs

| Action | Route | Admin | RH | Manager | Employé |
|--------|-------|:-----:|:--:|:-------:|:-------:|
| Lister tous les utilisateurs | `GET /users` | ✅ | ✅ | ✅ | ❌ |
| Voir un utilisateur | `GET /users/:id` | ✅ | ✅ | ✅ | ❌ |
| Créer un utilisateur | `POST /users` | ✅ | ✅ | ❌ | ❌ |
| Modifier un utilisateur | `PUT /users/:id` | ✅ | ✅ | ❌ | ❌ |
| Activer/Désactiver un compte | `PATCH /users/:id/toggle-status` | ✅ | ✅ | ❌ | ❌ |
| Supprimer un utilisateur | `DELETE /users/:id` | ✅ | ❌ | ❌ | ❌ |

### Gestion des congés

| Action | Route | Admin | RH | Manager | Employé |
|--------|-------|:-----:|:--:|:-------:|:-------:|
| Demander un congé | `POST /conges` | ✅ | ✅ | ✅ | ✅ |
| Voir ses congés | `GET /conges/me` | ✅ | ✅ | ✅ | ✅ |
| Voir tous les congés | `GET /conges` | ✅ | ✅ | ✅ | ❌ |
| Approuver/Refuser un congé | `PATCH /conges/:id` | ✅ | ✅ | ✅ | ❌ |

### Résumé par rôle

| Rôle | Description | Niveau d'accès |
|------|-------------|----------------|
| **Admin** | Administrateur système | Accès complet à toutes les fonctionnalités |
| **RH** | Ressources Humaines | Gestion des utilisateurs et des congés |
| **Manager** | Chef d'équipe | Consultation et validation des congés de son équipe |
| **Employé** | Utilisateur standard | Accès à son profil et ses propres congés uniquement |

---

## �📝 Résumé des codes HTTP

| Code | Signification | Middleware |
|------|---------------|------------|
| 400 | Données invalides | validationMiddleware |
| 401 | Non authentifié | authMiddleware |
| 403 | Non autorisé | authMiddleware |
| 404 | Route non trouvée | errorMiddleware |
| 500 | Erreur serveur | errorMiddleware |

