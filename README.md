# CoreFlow 🚀

Plateforme intranet d'entreprise pour la gestion RH et communication interne.

## 📋 Description
CoreFlow permet de :
- Gérer les demandes de congés
- Organiser des événements internes
- Créer et suivre des tickets support
- Accéder aux documents selon les rôles

## 🛠️ Stack Technique
- **Frontend** : Vue.js 
- **Backend** : Node.js 
- **Base de données** : MySQL (à venir)

## 👥 Équipe
Projet réalisé dans le cadre du BTS SIO 2ème année - Épreuve E5

## � Arborescence du projet
```
CoreFlow/
├── Backend/
│   ├── docs/
│   │   └── evenement.md
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── event_Controller.js
│   │   │   └── userController.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── validationMiddleware.js
│   │   ├── models/
│   │   │   ├── event.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   └── userRoutes.js
│   │   └── server.js
│   ├── middleware.md
│   ├── package.json
│   └── README.md
├── database/
│   ├── coreflow_database.sql
│   ├── hash-password.js
│   ├── package.json
│   └── README.md
├── Docs/
│   ├── GIT_GUIDE.md
│   └── GUIDE_D'INSTALLATION.md
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── stores/
│   │   │   └── counter.js
│   │   ├── views/
│   │   │   ├── AdminUserView.vue
│   │   │   ├── DashboardView.vue
│   │   │   └── LoginView.vue
│   │   ├── App.vue
│   │   └── main.js
│   ├── eslint.config.js
│   ├── index.html
│   ├── jsconfig.json
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
└── README.md
```

## �📦 Installation
Instructions à venir...

## 🌿 Branches
- `main` : Code stable
- `develop` : Intégration des features
- `feature/*` : Développement de fonctionnalités
```
