const documentRepository = require('../repository/documentRepository');

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
            taille_ko: Math.round(doc.taille / 1024)

        }));
    }
}
module.exports = new DocumentService();
