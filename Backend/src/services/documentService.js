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
            cible_role: textData.cible_role,
            chemin_fichier: fichierData.filename, // Chemin du fichier stocké
            type_mime: fichierData.mimetype, // Type MIME du fichier
            taille: fichierData.size, // Taille du fichier en octets
            idUtilisateurs: 1,// A remplacer par l'ID de l'utilisateur connecté (à récupérer depuis le token d'authentification)
            idServices: 1 // A remplacer par l'ID du service sélectionné (à récupérer depuis le formulaire)
        };
        //on enregistre le document dans la base de données
        const documentId = await documentRepository.createDocument(newDocument);
        return {id: documentId, filename: fichierData.filename}; // Retourne l'ID du document créé et le nom du fichier
    }
}

module.exports = new DocumentService();
