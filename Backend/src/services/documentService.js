const documentRepository = require('../repository/documentRepository');
const fs = require('fs'); 
const path = require('path'); 

class DocumentService {
    async addDocument(textData, fichierData) {
        if (!fichierData) {
            throw new Error('Aucun fichier reçu');
        }
        const newDocument = {
            titre: textData.titre,
            description: textData.description,
            cible_role: textData.cible_role || 'Tous', 
            fichier_path: fichierData.filename, 
            type_fichier: fichierData.mimetype, 
            taille: fichierData.size, 
            auteur_id: 1,
            service_id: textData.service_id || 1 
        };
        const documentId = await documentRepository.createDocument(newDocument);
        return { id: documentId, filename: fichierData.filename }; 
    }

    async getAllDocuments() {
        const documents = await documentRepository.findAllDocuments();
        return documents.map(doc => ({
            ...doc,
            auteur_complet: `${doc.auteur_prenom} ${doc.auteur_nom}`,
            taille_ko: Math.round(doc.taille / 1024),
            date_affichage: new Date(doc.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        }));
    }

    async deleteDocument(id) {
        const document = await documentRepository.getDocumentById(id);
        if (!document) {
            throw new Error('Document non trouvé en base de données');  
        }
        await documentRepository.deleteDocument(id);
        if (document.fichier_path) {
            const filePath = path.join(__dirname, '../uploads', document.fichier_path); 
            try {
                await fs.unlink(filePath); 
                console.log(`Fichier supprimé : ${filePath}`);
            } catch (err) {
                console.error(`Erreur lors de la suppression du fichier : ${err}`);
            }
        }
        return true;    
    }

    // La vraie fonction update du service
    async updateDocument(id, titre, description, cible_role) {
        return await documentRepository.updateDocument(id, titre, description, cible_role);
    }
}

module.exports = new DocumentService();