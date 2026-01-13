# 🌿 Guide Git - CoreFlow

Guide simplifié pour utiliser Git sur le projet CoreFlow.

---

## 🎯 Commandes essentielles

### Récupérer les dernières modifications
```bash
git checkout develop
git pull origin develop
```

**À faire AVANT de commencer à coder !**

---

### Créer une nouvelle branche
```bash
# Pour une nouvelle fonctionnalité
git checkout -b feature/nom-fonctionnalite

# Exemples
git checkout -b feature/gestion-conges
git checkout -b feature/authentification
git checkout -b feature/dashboard
```

---

### Voir l'état de tes modifications
```bash
git status
```

Fichiers en **rouge** = non ajoutés  
Fichiers en **vert** = prêts à être commités

---

### Ajouter tes modifications
```bash
# Ajouter tous les fichiers modifiés
git add .

# Ou ajouter un fichier spécifique
git add src/components/MonComposant.vue
```

---

### Créer un commit
```bash
git commit -m "feat: description claire de ce que tu as fait"
```

**Exemples de bons commits :**
```bash
git commit -m "feat: ajout formulaire demande de congés"
git commit -m "fix: correction bug validation email"
git commit -m "style: amélioration design page login"
```

---

### Pousser ta branche sur GitHub
```bash
# Première fois
git push -u origin feature/nom-fonctionnalite

# Les fois suivantes
git push
```

---

### Créer une Pull Request

1. Va sur GitHub : https://github.com/2026-BTS-SIO2-ESIC/CoreFlow
2. Tu verras un bandeau jaune proposant de créer une Pull Request
3. Clique sur **"Compare & pull request"**
4. Remplis :
   - **Titre** : Description courte
   - **Description** : Explique ce que tu as fait
5. Demande une review à un camarade
6. Une fois approuvé → **Merge**

---

## 🔄 Workflow complet
```
1. git checkout develop
2. git pull origin develop
3. git checkout -b feature/ma-fonctionnalite
4. [DÉVELOPPEMENT]
5. git add .
6. git commit -m "feat: description"
7. git push origin feature/ma-fonctionnalite
8. [CRÉER PULL REQUEST sur GitHub]
9. [ATTENDRE REVIEW]
10. [MERGE dans develop]
```

---

## ⚠️ Règles importantes

❌ **JAMAIS** pousser directement sur `main`  
❌ **JAMAIS** pousser directement sur `develop`  
❌ **JAMAIS** utiliser `git push --force` sur main ou develop  
✅ **TOUJOURS** créer une branche `feature/`  
✅ **TOUJOURS** faire une Pull Request  
✅ **TOUJOURS** demander une review avant de merger  

---

## 🆘 En cas de problème

### J'ai fait des modifs sur develop par erreur
```bash
# Annuler les modifications
git checkout develop
git reset --hard origin/develop

# Créer une branche avec tes modifs
git checkout -b feature/ma-fonctionnalite
```

### J'ai des conflits lors du pull
```bash
# Option 1 : Stash (mettre de côté) tes modifs
git stash
git pull origin develop
git stash pop

# Option 2 : Commit tes modifs avant de pull
git add .
git commit -m "wip: travail en cours"
git pull origin develop
```

### J'ai commit sur la mauvaise branche
```bash
# Annuler le dernier commit (garde les modifs)
git reset --soft HEAD~1

# Change de branche
git checkout -b feature/bonne-branche

# Re-commit
git add .
git commit -m "feat: ma fonctionnalité"
```

---

**N'hésite pas à demander de l'aide à l'équipe ! 💪**