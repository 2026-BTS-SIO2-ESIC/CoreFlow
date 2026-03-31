const documentService = require('../services/documentService');

class DocumentController {
    async createDocument(req, res) {
        try {
            const result = await documentService.addDocument(req.body, req.file);
            res.status(201).json({ 
                message: 'Document créé avec succès !',
                data: result
            });
        } catch (error) {
            console.error('Erreur lors de la création du document :', error);
            res.status(400).json({ message: 'Erreur interne du serveur' });
        }
    }

    async getDocuments(req, res) {
        try {
            const documents = await documentService.getAllDocuments();
            res.status(200).json(documents);
        } catch (error) {
            console.error('Erreur lors de la récupération des documents :', error);
            res.status(500).json({ message: 'Erreur interne du serveur' });
        }
    }

    async deleteDocument(req, res) {
        try {
            const documentId = req.params.id;
            await documentService.deleteDocument(documentId);
            res.status(200).json({ message: 'Document supprimé avec succès' });
        } catch (error) {
            console.error('Erreur lors de la suppression du document :', error);
            if (error.message === 'Document non trouvé en base de données') {
                return res.status(404).json({ message: 'Document non trouvé' });
            }
            res.status(500).json({ message: 'Erreur interne du serveur' });
        }
    }

    // La vraie fonction update du contrôleur
    async updateDocument(req, res) {
        try {
            const documentId = req.params.id;
            const { titre, description, cible_role } = req.body;
            
            const role = req.user.role.toLowerCase();
            
            if (!['admin', 'rh', 'manager'].includes(role)) {
                return res.status(403).json({ 
                    message: "Accès refusé. Seuls les Managers, RH et Admins peuvent modifier un document." 
                });
            }

            if (!titre || !cible_role) {
                return res.status(400).json({ message: "Le titre et la cible sont obligatoires." });
            }

            // ICI on appelle le service proprement
            const isUpdated = await documentService.updateDocument(documentId, titre, description, cible_role);
            
            if (!isUpdated) {
                return res.status(404).json({ message: "Document introuvable." });
            }

            res.status(200).json({ message: "Le document a été mis à jour avec succès !" });

        } catch (error) {
            console.error('Erreur lors de la modification du document :', error);
            res.status(500).json({ message: "Erreur interne du serveur" });
        }
    }
}

module.exports = new DocumentController();