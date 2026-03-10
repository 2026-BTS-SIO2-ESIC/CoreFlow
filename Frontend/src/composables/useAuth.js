/**
 * Composable pour vérifier l'authentification et les rôles via le token.
 * Utilise GET /api/auth/me pour obtenir l'utilisateur vérifié côté serveur.
 */

const API_URL = 'http://localhost:3000/api'

/**
 * Récupère l'utilisateur vérifié à partir du token (via API)
 * @returns {Promise<Object|null>} User object ou null si token invalide/absent
 */
export async function fetchUserFromToken() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (data.success && data.data) {
      localStorage.setItem('user', JSON.stringify(data.data))
      return data.data
    }
  } catch (e) {
    console.error('Erreur vérification auth:', e)
  }
  return null
}

/**
 * Vérifie si l'utilisateur (vérifié via token) a un des rôles autorisés
 * @param {Object} user - Objet user (retourné par fetchUserFromToken)
 * @param {string[]} roles - Rôles autorisés (ex: ['admin', 'manager'])
 * @returns {boolean}
 */
export function hasRole(user, ...roles) {
  return user?.role && roles.includes(user.role)
}
