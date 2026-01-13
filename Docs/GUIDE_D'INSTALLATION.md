# 🚀 Guide d'installation - CoreFlow

Guide pour installer et lancer le projet CoreFlow en local.

## 📋 Prérequis

Avant de commencer, assure-toi d'avoir installé :

- **Node.js** (version 18 ou supérieure) : https://nodejs.org/
- **Git** : https://git-scm.com/
- Un éditeur de code (recommandé : **VS Code** : https://code.visualstudio.com/)

### Vérifier les installations

Ouvre PowerShell ou un terminal et tape :
```bash
node --version
npm --version
git --version
```

Si tu vois des numéros de version, c'est bon ✅

---

## 📥 ÉTAPE 1 : Cloner le projet

### 1.1 - Créer un dossier pour tes projets
```bash
# Va dans Documents
cd Documents

# Crée un dossier pour tes projets BTS (optionnel)
mkdir Projets-BTS
cd Projets-BTS
```

### 1.2 - Cloner le repository
```bash
git clone https://github.com/2026-BTS-SIO2-ESIC/CoreFlow.git
```

**Si demande de connexion :**
- Username : ton pseudo GitHub
- Password : utilise un **Personal Access Token** (pas ton mot de passe)
  - Crée-le ici : https://github.com/settings/tokens
  - Coche `repo` (full control)

### 1.3 - Entrer dans le projet
```bash
cd CoreFlow
```

### 1.4 - Se placer sur la branche develop
```bash
git checkout develop
```

---

## ⚙️ ÉTAPE 2 : Installer les dépendances

### 2.1 - Backend
```bash
# Va dans Backend
cd Backend

# Installe les dépendances
npm install

# Retourne à la racine
cd ..
```

### 2.2 - Frontend
```bash
# Va dans Frontend
cd Frontend

# Installe les dépendances
npm install

# Retourne à la racine
cd ..
```

⏳ **Patience** : L'installation peut prendre quelques minutes.

---

## 🔧 ÉTAPE 3 : Configuration

### 3.1 - Configurer le Backend
```bash
# Va dans Backend
cd Backend

# Copie le fichier d'exemple
# Sur Windows (PowerShell)
Copy-Item .env.example .env

# Sur Mac/Linux
cp .env.example .env
```

Le fichier `.env` contient les variables d'environnement. Tu peux le modifier si besoin.

---

## 🚀 ÉTAPE 4 : Lancer l'application

Tu as besoin de **2 terminaux** (ou 2 onglets PowerShell) :

### Terminal 1 : Backend
```bash
# Va dans Backend
cd Backend

# Lance le serveur
npm run dev
```

Tu devrais voir :
```
Le Serveur de CoreFlow a démarré sur http://localhost:3000
```

✅ **Teste** : Ouvre ton navigateur sur http://localhost:3000 → Tu devrais voir un message JSON.

### Terminal 2 : Frontend
```bash
# Va dans Frontend (depuis la racine)
cd Frontend

# Lance l'application
npm run dev
```

Tu devrais voir :
```
VITE ready in xxx ms
➜  Local:   http://localhost:5173/
```

✅ **Teste** : Ouvre ton navigateur sur http://localhost:5173 → Tu devrais voir l'application Vue.js !

---

## 📁 Structure du projet
```
CoreFlow/
├── Backend/          # API Node.js/Express
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env          # Variables d'environnement (non versionné)
│   ├── .env.example  # Template des variables
│   └── package.json
│
├── Frontend/         # Application Vue.js
│   ├── src/
│   │   ├── components/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── App.vue
│   │   └── main.js
│   └── package.json
│
├── Docs/            # Documentation
└── README.md        # Vue d'ensemble du projet
```

---

## 🌿 Travailler avec Git

### Workflow de base
```bash
# 1. Toujours partir de develop à jour
git checkout develop
git pull origin develop

# 2. Créer une branche pour ta fonctionnalité
git checkout -b feature/nom-de-ta-feature

# 3. Développer et commiter régulièrement
git add .
git commit -m "feat: description de ce que tu as fait"

# 4. Pousser ta branche
git push origin feature/nom-de-ta-feature

# 5. Créer une Pull Request sur GitHub
# Demande à un camarade de review ton code
# Une fois approuvé, merge dans develop
```

### Conventions de commit

Utilise ces préfixes pour tes commits :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage (pas de changement de code)
- `refactor:` Refactoring
- `test:` Ajout de tests
- `chore:` Maintenance, config

**Exemples :**
```bash
git commit -m "feat: ajout formulaire de demande de congés"
git commit -m "fix: correction validation email"
git commit -m "docs: mise à jour README"
```

---

## ❌ Problèmes courants

### "npm : command not found"
→ Node.js n'est pas installé ou pas dans le PATH. Réinstalle Node.js.

### "Port 3000 already in use"
→ Le port est déjà utilisé. Arrête l'autre processus ou change le port dans `.env`.

### Erreur lors du git clone
→ Vérifie que tu as bien accès au repository (demande à être ajouté comme collaborateur).

### Les modifications d'un camarade ne sont pas visibles
→ Fais `git pull origin develop` pour récupérer les dernières modifications.

### Conflit Git lors du merge
→ Demande de l'aide à l'équipe. Ne force jamais un push avec `--force` sur develop ou main !

---

## ✅ Checklist de démarrage

- [ ] Node.js et Git installés
- [ ] Repository cloné
- [ ] Branches develop checkoutée
- [ ] Dépendances Backend installées
- [ ] Dépendances Frontend installées
- [ ] Fichier `.env` créé dans Backend
- [ ] Backend lance sur http://localhost:3000
- [ ] Frontend lance sur http://localhost:5173
- [ ] Premier commit de test effectué

**Bienvenue dans l'équipe CoreFlow ! 🚀**