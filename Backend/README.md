# CoreFlow - Backend

API REST du projet CoreFlow développée avec Node.js et Express.

## 🚀 Installation
```bash
npm install
```

## ⚙️ Configuration

Créez un fichier `.env` à partir de `.env.example` :
```bash
cp .env.example .env
```

Modifiez les variables selon vos besoins.

## 💻 Développement
```bash
npm run dev
```

L'API sera accessible sur : http://localhost:3000/

## 🏗️ Production
```bash
npm start
```

## 📁 Structure
```
Backend/
├── src/
│   ├── config/         # Configuration (DB, etc.)
│   ├── controllers/    # Logique métier
│   ├── middlewares/    # Middlewares Express
│   ├── models/         # Modèles de données
│   ├── routes/         # Routes de l'API
│   └── server.js       # Point d'entrée
├── .env                # Variables d'environnement (non versionné)
├── .env.example        # Template des variables
└── package.json
```

## 🛠️ Technologies

- Node.js
- Express
- CORS
- dotenv
- nodemon (dev)