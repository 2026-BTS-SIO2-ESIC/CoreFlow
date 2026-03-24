const documentRepository = require('../repository/documentRepository');
const fs = require('fs'); // Pour gérer les fichiers (ex: suppression)
const path = require('path'); // Pour gérer les chemins de fichiers

class DocumentService {
    async addDocument(textData, fichierData) {
        //on verifie que le fichier a bien éetait reçu
        if (!fichierData) {
            throw new Error('Aucun fichier reçu');
        }
        //on crée un objet document à partir des données reçues
        const newDocument = {
            titre: textData.titre,
            description: textData.description,
            cible_role: textData.cible_role || 'Tous', // Par défaut, le document est destiné à tous les rôles
            fichier_path: fichierData.filename, // Chemin du fichier stocké
            type_fichier: fichierData.mimetype, // Type MIME du fichier
            taille: fichierData.size, // Taille du fichier en octets
            auteur_id: 1,// A remplacer par l'ID de l'utilisateur connecté (à récupérer depuis le token d'authentification)
            service_id: textData.service_id || 1 // A remplacer par l'ID du service sélectionné (à récupérer depuis le formulaire)
        };
        //on enregistre le document dans la base de données
        const documentId = await documentRepository.createDocument(newDocument);
        return { id: documentId, filename: fichierData.filename }; // Retourne l'ID du document créé et le nom du fichier
    }
    async getAllDocuments() {
        const documents = await documentRepository.findAllDocuments();
        return documents.map(doc => ({
            ...doc,
            auteur_complet: `${doc.auteur_prenom} ${doc.auteur_nom}`,
            taille_ko: Math.round(doc.taille / 1024),
            // On formate la date pour qu'elle soit jolie (ex: 12 Mars 2024)
            date_affichage: new Date(doc.created_at).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })

        }));
    }
    async deleteDocument(id) {
        // Récupère le document pour obtenir le chemin du fichier
        const document = await documentRepository.getDocumentById(id);
        if (!document) {
            throw new Error('Document non trouvé en base de données');  
        }
        // Supprime le fichier du serveur dans la base de données
        await documentRepository.deleteDocument(id);
        // Supprime le fichier du serveur
       if (document.fichier_path) {
            const filePath = path.join(__dirname, '../uploads', document.fichier_path); // Chemin complet du fichier à supprimer
            try {
                await fs.unlink(filePath); // Supprime le fichier du serveur
                console.log(`Fichier supprimé : ${filePath}`);
            } catch (err) {
                console.error(`Erreur lors de la suppression du fichier : ${err}`);
            }
        }
        return true;    
    }
}
module.exports = new DocumentService();
