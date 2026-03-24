## Documentation des routes `event`

Ce document décrit les routes de l'API `event`, tous les champs possibles des body et donne des exemples d'utilisation avec **Postman**.

---

## Authentification (token obligatoire)

**Toutes les routes `event` nécessitent une authentification par token.** Obtenez d'abord un token via `POST /api/auth/login`, puis incluez-le dans chaque requête :

- **Header** : `Authorization: Bearer <votre_token>`

Exemple dans Postman : ajoutez le header `Authorization` avec la valeur `Bearer eyJ1c2VySWQiOjF9` (remplacez par votre token).

Sans token valide, vous obtiendrez `401 Token d'authentification manquant` ou `401 Token invalide`.

---

## Résumé des routes

| # | Méthode | Route | Description |
|---|---------|-------|-------------|
| 1 | GET | `/event/list/participation/:user_id/:userRole` | Liste des événements par participation et rôle |
| 2 | GET | `/event/list/:id` | Récupérer un événement par ID |
| 3 | POST | `/event/create/:userRole` | Créer un événement |
| 4 | PUT | `/event/update` | Mettre à jour un événement |
| 5 | POST | `/event/user_list_by_email` | Recherche utilisateurs par email |

**Rôles requis** : Les routes `create` et `update` exigent le rôle `admin` ou `manager`.

---

## 1. Liste des événements (par participation et rôle)

- **Méthode** : `GET`
- **URL** : `http://localhost:3000/event/list/participation/:user_id/:userRole`
- **Headers** : `Authorization: Bearer <token>`
- **Body** : aucun

**Paramètres URL** :
- `user_id` (integer, obligatoire) : ID de l'utilisateur
- `userRole` (string, obligatoire) : `admin`, `manager`, `employe`, `rh`, etc.

**Exemple** : `GET http://localhost:3000/event/list/participation/5/admin`

**Réponse** :
- Si admin : `{ message, eventAdmin }` — tableau de tous les événements
- Sinon : `{ message, eventLevelOne, eventLevelTwo }` — événements niveau 1 (entreprise) et niveau 2 (participations)

---

## 2. Récupérer un événement par ID

- **Méthode** : `GET`
- **URL** : `http://localhost:3000/event/list/:id`
- **Headers** : `Authorization: Bearer <token>`
- **Body** : aucun

**Paramètres URL** :
- `id` (integer, obligatoire) : ID de l'événement

**Exemple** : `GET http://localhost:3000/event/list/42`

**Réponse** : `200 OK` + `{ message, event }`

---

## 3. Création d'un événement

- **Méthode** : `POST`
- **URL** : `http://localhost:3000/event/create/:userRole`
- **Headers** : `Content-Type: application/json`, `Authorization: Bearer <token>`

**Paramètres URL** :
- `userRole` (string, obligatoire) : `manager` ou `admin` — utilisateur connecté doit avoir ce rôle

**Body : tous les champs possibles**

| Champ (JSON) | Type | Obligatoire | Description |
|--------------|------|-------------|-------------|
| `titre` | string | ✓ | Titre de l'événement |
| `description` | string | | Description |
| `type_evenement` | string | ✓ | Type (ex. meeting, formation, etc.) |
| `date_debut` | string | ✓ | Date/heure début (format `YYYY-MM-DD HH:mm:ss`). Ne peut pas être avant aujourd'hui |
| `date_fin` | string | ✓ | Date/heure fin (format `YYYY-MM-DD HH:mm:ss`). Doit être >= date_debut |
| `lieu` | string | | Lieu de l'événement |
| `organisateur_id` | integer | ✓ | ID de l'organisateur (doit être manager ou admin) |
| `niveau` | string | ✓ | `"1"` = entreprise (visible par tous) ou `"2"` = service (visible selon participations) |
| `inviter` | string | | Emails des invités, séparés par des virgules (ex. `"email1@x.com,email2@y.com"`). Vérifiés en base |
| `departement` | string | | Nom du département pour les participations automatiques (niveau 2) |
| `est_obligatoire` | integer | | `0` ou `1` |
| `nb_places_max` | integer | | Nombre max de places (entier >= 0) |
| `statut` | string | | `planifie`, `en_cours`, `termine` ou `annule` |
| `created_at` | string | | Auto-généré si absent (format `YYYY-MM-DD HH:mm:ss`) |
| `updated_at` | string | | Auto-généré si absent |
| `commentaire` | string | | Commentaire initial des participations |

**Body (exemple minimal)** :

```json
{
  "titre": "Un meeting",
  "description": "Description",
  "type_evenement": "meeting",
  "date_debut": "2026-06-21 12:00:00",
  "date_fin": "2026-06-21 14:00:00",
  "organisateur_id": 1,
  "niveau": "1"
}
```

**Body (exemple complet)** :

```json
{
  "titre": "Un meeting",
  "description": "Description",
  "type_evenement": "meeting",
  "date_debut": "2026-06-21 12:00:00",
  "date_fin": "2026-06-21 14:00:00",
  "lieu": "Salle A",
  "organisateur_id": 1,
  "niveau": "2",
  "inviter": "email1@x.com,email2@y.com",
  "departement": "IT",
  "est_obligatoire": 1,
  "nb_places_max": 20,
  "statut": "planifie",
  "commentaire": "Veuillez confirmer"
}
```

**Réponse** : `201` + `{ message, id, participationIds }`

---

## 4. Mise à jour d'un événement

- **Méthode** : `PUT`
- **URL** : `http://localhost:3000/event/update`
- **Headers** : `Content-Type: application/json`, `Authorization: Bearer <token>`

**Body : tous les champs possibles**

| Champ (JSON) | Type | Obligatoire | Description |
|--------------|------|-------------|-------------|
| `id` | integer | ✓ | ID de l'événement à modifier |
| `organisateur_id` | integer | ✓ | ID de l'organisateur (doit correspondre au propriétaire) |
| `titre` | string | | Titre |
| `description` | string | | Description |
| `type_evenement` | string | | Type d'événement |
| `date_debut` | string | | Date/heure début |
| `date_fin` | string | | Date/heure fin |
| `lieu` | string | | Lieu |
| `est_obligatoire` | integer | | `0` ou `1` |
| `nb_places_max` | integer | | Nombre max de places |
| `statut` | string | | `planifie`, `en_cours`, `termine`, `annule` |
| `niveau` | string | | `"1"` ou `"2"` |
| `inviter` | string | | Emails invités (vérifiés en base si fournis) |
| `statut_participation` | string | | Met à jour le statut des participations de l'événement |
| `commentaire` | string | | Met à jour le commentaire des participations |

Au moins un champ modifiable (en plus de `id` et `organisateur_id`) doit être envoyé.

**Body (exemple)** :

```json
{
  "id": 42,
  "organisateur_id": 1,
  "titre": "Nouveau titre",
  "description": "Nouvelle description",
  "statut": "en_cours",
  "niveau": "2"
}
```

**Erreurs** :
- `400` : champs invalides ou manquants
- `403` : vous ne possédez pas les droits sur cet événement (`PERMISSION_ERROR`)
- `404` : événement inexistant (`NOT_FOUND`)

**Réponse** : `201` + `{ message, id }`

---

## 5. Recherche d'utilisateurs par email

- **Méthode** : `POST`
- **URL** : `http://localhost:3000/event/user_list_by_email`
- **Headers** : `Content-Type: application/json`, `Authorization: Bearer <token>`

**Body : champs possibles**

| Champ (JSON) | Type | Obligatoire | Description |
|--------------|------|-------------|-------------|
| `email` | string | ✓ | Chaîne partielle d'email (requête SQL `LIKE %valeur%`) |

**Body (exemple)** : `{ "email": "admin" }`

**Réponse** : `200 OK` + `{ message, usersInfos }` — tableau de `{ id, email }`

**Erreurs** : `404` si aucun utilisateur trouvé

---

## 6. Règles de visibilité des événements (niveau & rôle)

### Niveaux d'événements

- **Niveau 1** : événement d'entreprise, visible par tous.
- **Niveau 2** : événement de service, visible selon participations/rôles.

### Rôles

- **Admin** : voit tous les événements.
- **Manager, Employé, RH** : voient les événements selon leur `user_id` et participations.

---

## 7. Tâches à faire / backlog

- [x] Vérification des rôles pour chaque affichage d'événement
- [x] Route helper recherche utilisateur par email
- [x] Niveaux 1 et 2
- [x] Colonne `inviter` + vérification des utilisateurs
- [x] Route `GET /event/list/:id`
- [x] Route `PUT /event/update`
- [ ] Filtre à venir / passé : `GET /event/list/passed`, `GET /event/list/coming`

---

## 8. Idées futures

- Suppression automatique des événements de niveau 2 après une certaine période.

---

## Commandes utiles

```bash
npm install --save-dev eslint
npx eslint --init
npx eslint
```

---

## Avant de commencer

- [ ] `npm install`
- [ ] `npm run dev`
