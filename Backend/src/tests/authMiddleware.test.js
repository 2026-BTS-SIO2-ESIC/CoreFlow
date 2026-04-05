const { authenticate } = require('../middlewares/authMiddleware');

describe('AuthMiddleware - Sécurité des routes (Erreur 401)', () => {
    let req, res, next;

    beforeEach(() => {
        // on simule un intrus : une requête http sans en-tête d'authentification
        req = {
            headers: {} 
        };
        
        // 2. On simule l'objet de réponse d'Express
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        
        // 3. On simule la fonction next() (celle qui ouvre la porte si tout va bien)
        next = jest.fn();
    });

    it('devrait bloquer l\'accès (401) si aucun token n\'est fourni', async () => {
        // Action : On confronte notre fausse requête à ton middleware de sécurité
        await authenticate(req, res, next);

        // Vérifications (Ce qui prouve au jury que ça fonctionne) :
        
        // - Le système doit renvoyer un code 401 (Non autorisé)
        expect(res.status).toHaveBeenCalledWith(401);
        
        // - Le système doit renvoyer le message d'erreur prévu dans ton code
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Token d'authentification manquant"
        });
        
        // - CRUCIAL : La fonction next() NE DOIT PAS avoir été appelée (l'intrus est resté bloqué à la porte)
        expect(next).not.toHaveBeenCalled();
    });
});