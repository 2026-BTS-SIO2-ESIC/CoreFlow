<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Bienvenue sur CoreFlow</h1>
    </div>
    <div class="sidebar">
        <div class="logo">
            <div class="logo-icon">C</div>
            <div class="logo-text">CoreFlow</div>
        </div>
      <nav class="nav-menu">
            <a href="#" class="nav-item active">
                <div class="nav-icon">
                    <svg viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                </div>
                Tableau de bord
            </a>

            <a href="#" class="nav-item">
                <div class="nav-icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                Mes Congés
            </a>

            <a href="#" class="nav-item">
                <div class="nav-icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                Documents
            </a>

            <a href="#" class="nav-item">
                <div class="nav-icon">
                    <svg viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </div>
                Événements
            </a>

            <a href="#" class="nav-item">
                <div class="nav-icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
                Tickets & Support
            </a>
            <div v-if="user && (user.role === 'admin' || user.role === 'manager')">
            <a @click="goToAdminPanel" class="nav-item">
                <div class="nav-icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                Gestion utilisateurs
            </a>
            </div>
        </nav>
        <div class="user-profile">
        <div v-if="user">
                <div class="user-name">{{user.nom}}</div>
                <div class="user-role">{{user.role}}</div>
    </div>
    <button @click="logout" class="btn-logout">Déconnexion</button>
    </div>
    </div>
    


    <div v-if="user" class="user-info">
      <h2> Informations de connexion</h2>
      <p><strong>Nom :</strong> {{ user.prenom }} {{ user.nom }}</p>
      <p><strong>Email :</strong> {{ user.email }}</p>
      <p><strong>Rôle :</strong> {{ user.role }}</p>
      <p><strong>Département :</strong> {{ user.departement }}</p>
    </div>
</div>

</template>

<script>
export default {
  name: 'DashboardView',
  data() {
    return {
      user: null
    }
  },
  mounted() {
    // Récupérer l'utilisateur depuis localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    } else {
      // Rediriger vers login si pas connecté
      this.$router.push('/login');
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    },
    goToAdminPanel() {
      this.$router.push('/admin/users');
    }
  }
}
</script>

<style scoped>
.dashboard{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.sidebar {
            width: 240px;
            height: 100vh;
            background-color: #fafafa;
            border-right: 1px solid #e5e7eb;
            display: flex;
            flex-direction: column;
            position: fixed;
            left: 0;
            top: 0;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 24px 16px;
        }

        .logo-icon {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
        }

        .logo-text {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
        }

        .nav-menu {
            flex: 1;
            padding: 16px 0;
            overflow-y: auto;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            color: #6b7280;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
            font-size: 15px;
            border-left: 3px solid transparent;
        }

        .nav-item:hover {
            background-color: #f3f4f6;
            color: #14b8a6;
        }

        .nav-item.active {
            background-color: transparent;
            color: #14b8a6;
            border-left: 3px solid #14b8a6;
        }

        .nav-icon {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .user-profile {
            padding: 16px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }

        .user-avatar {
            width: 48px;
            height: 48px;
            border-radius: 8px;
            background-color: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            font-weight: 600;
            font-size: 18px;
        }

        .user-info {
            text-align: center;
        }

        .user-name {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 2px;
        }

        .user-role {
            font-size: 12px;
            color: #9ca3af;
            margin-bottom: 12px;
        }

        .logout-btn {
            background-color: #ef4444;
            color: white;
            border: none;
            padding: 8px 24px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .logout-btn:hover {
            background-color: #dc2626;
        }

        /* SVG Icons */
        svg {
            width: 20px;
            height: 20px;
            stroke: currentColor;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.dashboard-header h1 {
  font-size: 32px;
  color: #333;
}

.btn-logout {
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-logout:hover {
  background: #c82333;
}

.user-info {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.user-info h2 {
  margin-top: 0;
  color: #333;
}

.user-info p {
  margin: 10px 0;
  color: #666;
}
</style>