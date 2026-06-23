
const documentRepository = require('../repository/documentRepository');
const fs = require('fs'); 
const path = require('path'); 

class DocumentService {
    
    // ==========================================
    // 📝 AJOUTER UN NOUVEAU DOCUMENT
    // ==========================================
    async addDocument(textData, fichierData, auteurId) {
        // Vérification de sécurité : on s'assure que Multer a bien capturé un fichier
        if (!fichierData) {
            throw new Error('Aucun fichier reçu');
        }
        
        // On fusionne les données du formulaire (texte) et les métadonnées du fichier (taille, nom)
        const newDocument = {
            titre: textData.titre,
            description: textData.description,
            cible_role: textData.cible_role || 'Tous', // Visibilité publique par défaut
            fichier_path: fichierData.filename, // Nom unique généré par Multer (ex: 163000_doc.pdf)
            type_fichier: fichierData.mimetype, // Type MIME (ex: application/pdf)
            taille: fichierData.size, // Taille brute en octets
            auteur_id: auteurId, 
            service_id: textData.service_id || 1 
        };
        
        // Appel au Repository pour exécuter la requête INSERT dans MySQL
        const documentId = await documentRepository.createDocument(newDocument);
        
        // On retourne l'ID créé et le nom du fichier pour confirmer le succès au Controller
        return { id: documentId, filename: fichierData.filename }; 
    }

    // ==========================================
    // 🔍 RÉCUPÉRER TOUS LES DOCUMENTS
    // ==========================================
    async getAllDocuments(userRole, userId) {
        // 1. On récupère la liste brute depuis la base de données (déjà filtrée par rôle)
        const documents = await documentRepository.findAllDocuments(userRole, userId);
        
        // 2. On formate les données pour mâcher le travail du Frontend (Vue.js)
        return documents.map(doc => ({
            ...doc,
            // Création d'un nom complet combiné
            auteur_complet: `${doc.auteur_prenom} ${doc.auteur_nom}`,
            // Conversion de la taille de la base (octets) vers un format plus lisible (Ko)
            taille_ko: Math.round(doc.taille / 1024),
            // Formatage de la date en style français (ex: "14 oct. 2023")
            date_affichage: new Date(doc.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }),
        // Gestion de l'affichage de la dernière consultation
        derniere_consultation_affichage: doc.derniere_consultation 
                ? 'Consulté le ' + new Date(doc.derniere_consultation).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                })
                : 'Jamais consulté'
        }));
    }
    async registerConsultation(id) {
    return await documentRepository.updateLastConsultation(id);
    }
    async deleteDocument(id) {
        // Étape 1 : On vérifie que le document existe bien en BDD
        const document = await documentRepository.getDocumentById(id);
        if (!document) {
            throw new Error('Document non trouvé en base de données');  
        }
        
        // Étape 2 : On supprime d'abord la ligne dans la table MySQL
        await documentRepository.deleteDocument(id);
        
        // Étape 3 : On supprime le VRAI fichier stocké sur le disque dur du serveur
        if (document.fichier_path) {
            // On reconstruit le chemin absolu vers le dossier "uploads"
            const filePath = path.join(__dirname, '../uploads', document.fichier_path); 
            try {
                // On vérifie si le fichier est toujours présent physiquement
                if (fs.existsSync(filePath)) {
                    await fs.promises.unlink(filePath); // Suppression physique (module 'fs')
                    console.log(`Fichier physique supprimé : ${filePath}`);
                }
            } catch (err) {
                // Si la suppression échoue (fichier déjà supprimé à la main par ex), on log l'erreur sans crasher l'API
                console.error(`Erreur lors de la suppression physique du fichier : ${err}`);
            }
        }
        return true;    
    }

    // ==========================================
    // ✏️ METTRE À JOUR LES INFORMATIONS (TEXTE)
    // ==========================================
    async updateDocument(id, titre, description, cible_role) {
        // Passe simplement les nouvelles valeurs au Repository pour effectuer la requête UPDATE
        // (Ne gère pas la modification du fichier physique dans cette version de base)
        return await documentRepository.updateDocument(id, titre, description, cible_role);
    }
}

module.exports = new DocumentService();