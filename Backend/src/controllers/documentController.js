const documentService = require('../services/documentService');

class DocumentController {
    async createDocument(req, res) {
        try {
            //req.body contient les données textuelles et req.file contient le texte, req.file contient le fichier (grâce à Multer)
            const result = await documentService.addDocument(req.body, req.file);

            //on repond au front que c'est un succès et on retourne l'id du document créé et le nom du fichier
            res.status(201).json({ 
                message: 'Document créé avec succès !',
                data: result
            });
        } catch (error) {
            console.error('Erreur lors de la création du document :', error);
            res.status(400).json({ message: 'Erreur interne du serveur' });
        }
    }
}

module.exports = new DocumentController();