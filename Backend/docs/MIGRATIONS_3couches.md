# Migration vers l'architecture 3 couches (Controller / Service / Repository)

## 1) Pourquoi ce document

Ce document explique les changements faits aujourd'hui sur le backend pour passer vers une architecture 3 couches.
Objectif: aider toute l'equipe a comprendre le nouveau fonctionnement et a migrer les autres modules de la meme facon.

Architecture cible:

- Controller: gere HTTP uniquement (req, res, status, format JSON)
- Service: gere les regles metier (validation metier, controles, erreurs metier)
- Repository: gere les acces base de donnees (SQL uniquement)

## 2) Ce qui a ete migre

### Domaine users

- Repository complete dans `src/repository/userRepository.js`
- Service metier dans `src/services/userService.js`
- Controller simplifie dans `src/controllers/userController.js`

Principales regles metier actuellement en service:

- champs obligatoires a la creation utilisateur
- unicite de l'email
- utilisateur inexistant
- aucune donnee a modifier
- interdiction de supprimer l'administrateur principal (id 1)

### Domaine auth

- Repository dans `src/repository/authRepository.js`
- Service metier dans `src/services/authService.js`
- Controller simplifie dans `src/controllers/authController.js`

Principales regles metier actuellement en service:

- email/mot de passe obligatoires
- verification bcrypt
- compte actif obligatoire
- gestion token (decodage + utilisateur courant)

## 3) Flux d'execution (nouveau standard)

Exemple sur une route:

1. La route appelle le controller.
2. Le controller lit req (body/params/query/headers).
3. Le controller appelle le service.
4. Le service applique les regles metier et appelle le repository.
5. Le repository execute SQL et renvoie les donnees.
6. Le service renvoie le resultat ou leve une erreur metier.
7. Le controller transforme en reponse HTTP.

## 4) Convention d'erreur adoptee

Dans les services, on leve des erreurs metier avec un status HTTP:

```js
function createServiceError(status, message) {
	const error = new Error(message);
	error.status = status;
	return error;
}
```

Dans les controllers:

- si `error.status` existe: on renvoie ce status et ce message
- sinon: on log et on renvoie 500

Avantage:

- messages metier centralises
- controllers plus lisibles
- comportement HTTP stable

## 5) Regles de placement du code

### A mettre dans Controller

- lecture des entrees (`req.body`, `req.params`, `req.query`, headers)
- format des reponses JSON
- mapping final des erreurs en HTTP

### A mettre dans Service

- validations metier
- controles d'existence/autorisation metier
- orchestration de plusieurs appels repository
- creation d'erreurs metier (`createServiceError`)

### A mettre dans Repository

- toutes les requetes SQL
- mapping brut des resultats SQL
- aucune logique HTTP

