<template>
  <div class="admin-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="logo">
        <div class="logo-icon">C</div>
        <div class="logo-text">CoreFlow</div>
      </div>
      <nav class="nav-menu">
        <a @click="goToDashboard" class="nav-item">
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

        <a @click="goToTicket" class="nav-item active">
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

        <a @click="goBack" class="nav-item active">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          Gestion utilisateurs
        </a>
      </nav>
      <div class="user-profile">
        <div v-if="user">
          <div class="user-name">{{ user.nom }}</div>
          <div class="user-role">{{ user.role }}</div>
        </div>
        <button @click="logout" class="btn-logout">Déconnexion</button>
      </div>
    </div>

    <!-- Header avec logo -->
    <div class="header">
      <div class="logo">
        <div class="logo-icon">CF</div>
        <div class="logo-text">CoreFlow</div>
      </div>
      <div class="user-section">
        <div class="admin-badge">👤 {{ user?.prenom }} {{ user?.nom }}</div>
        <button @click="goBack" class="btn-back">← Retour</button>
      </div>
    </div>

    <!-- Page Container -->
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1>Gestion des Utilisateurs</h1>
        <p>Créez, modifiez et gérez les comptes utilisateurs de votre organisation</p>
      </div>



      <!-- Content -->
      <div class="content-section">
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="search-section">
            <input 
              v-model="search" 
              type="text" 
              placeholder="🔍 Rechercher par nom, prénom ou email..."
              class="search-input"
              @input="filterUsers"
            />
          </div>
          <div class="filters-section">
            <select v-model="filterRole" @change="filterUsers" class="filter-select">
              <option value="">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="rh">RH</option>
              <option value="manager">Manager</option>
              <option value="employe">Employé</option>
            </select>

            <select v-model="filterActif" @change="filterUsers" class="filter-select">
              <option value="">Tous les statuts</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </select>

            <button @click="showCreateModal = true" class="btn-primary">
              ➕ Nouvel utilisateur
            </button>
          </div>
        </div>

        <!-- Users Table -->
        <div class="table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Département</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id" :class="{ 'inactive-row': !user.est_actif }">
                <td class="id-cell">{{ user.id }}</td>
                <td class="user-cell">
                  <div class="user-avatar">{{ user.prenom.charAt(0) }}{{ user.nom.charAt(0) }}</div>
                  <div class="user-details">
                    <div class="user-name">{{ user.prenom }} {{ user.nom }}</div>
                    <div class="user-poste">{{ user.poste || 'Non renseigné' }}</div>
                  </div>
                </td>
                <td class="email-cell">{{ user.email }}</td>
                <td>
                  <span class="role-badge" :class="`role-${user.role}`">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="dept-cell">{{ user.departement || '-' }}</td>
                <td>
                  <span class="status-badge" :class="user.est_actif ? 'status-active' : 'status-inactive'">
                    {{ user.est_actif ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button @click="editUser(user)" class="action-btn edit-btn" title="Modifier">
                    ✏️
                  </button>
                  <button @click="toggleUserStatus(user)" class="action-btn toggle-btn" :title="user.est_actif ? 'Désactiver' : 'Activer'">
                    {{ user.est_actif ? '🔒' : '🔓' }}
                  </button>
                  <button @click="confirmDelete(user)" class="action-btn delete-btn" title="Supprimer" :disabled="user.id === 1">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredUsers.length === 0" class="no-results">
            <div class="no-results-icon">🔍</div>
            <div class="no-results-text">Aucun utilisateur trouvé</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Créer/Modifier -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ showEditModal ? '✏️ Modifier l\'utilisateur' : '➕ Nouvel utilisateur' }}</h2>
          <button @click="closeModals" class="btn-close">✖️</button>
        </div>

        <form @submit.prevent="showEditModal ? updateUser() : createUser()" class="modal-body">
          <!-- Informations personnelles -->
          <div class="form-section">
            <div class="section-title">
              <span class="section-icon">👤</span>
              Informations personnelles
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Prénom <span class="required">*</span></label>
                <input v-model="formData.prenom" type="text" placeholder="Jean" required />
              </div>
              <div class="form-group">
                <label>Nom <span class="required">*</span></label>
                <input v-model="formData.nom" type="text" placeholder="Dupont" required />
              </div>
              <div class="form-group full-width">
                <label>Email <span class="required">*</span></label>
                <input v-model="formData.email" type="email" placeholder="jean.dupont@coreflow.fr" required />
              </div>
              <div class="form-group" v-if="showCreateModal">
                <label>Mot de passe <span class="required">*</span></label>
                <div class="password-input-wrapper">
                  <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required minlength="6" />
                  <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
                <span class="input-hint">Minimum 6 caractères</span>
              </div>
              <div class="form-group">
                <label>Téléphone</label>
                <input v-model="formData.telephone" type="tel" placeholder="01 23 45 67 89" />
              </div>
            </div>
          </div>

          <!-- Informations professionnelles -->
          <div class="form-section">
            <div class="section-title">
              <span class="section-icon">💼</span>
              Informations professionnelles
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Rôle <span class="required">*</span></label>
                <select v-model="formData.role" required>
                  <option value="">Sélectionner un rôle...</option>
                  <option value="admin">Administrateur</option>
                  <option value="rh">Ressources Humaines</option>
                  <option value="manager">Manager</option>
                  <option value="employe">Employé</option>
                </select>
              </div>
              <div class="form-group">
                <label>Département</label>
                <input v-model="formData.departement" type="text" placeholder="IT, RH, Commercial..." />
              </div>
              <div class="form-group">
                <label>Poste</label>
                <input v-model="formData.poste" type="text" placeholder="Développeur, Manager..." />
              </div>
              <div class="form-group">
                <label>Date d'embauche</label>
                <input v-model="formData.date_embauche" type="date" />
              </div>
            </div>
          </div>

          <!-- Info box -->
          <div class="info-box" v-if="showCreateModal">
            <div class="info-box-title">
              <span>ℹ️</span>
              Création du compte
            </div>
            <div class="info-box-content">
              Un solde de congés par défaut sera automatiquement créé (25 jours de congés payés + 10 RTT).
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModals" class="btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Enregistrement...' : (showEditModal ? 'Modifier' : 'Créer le compte') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmation suppression -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal modal-small">
        <div class="modal-header">
          <h2>⚠️ Confirmer la suppression</h2>
          <button @click="showDeleteModal = false" class="btn-close">✖️</button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ userToDelete?.prenom }} {{ userToDelete?.nom }}</strong> ?</p>
          <p class="warning-text">⚠️ Cette action est irréversible !</p>
          <div class="modal-actions">
            <button @click="showDeleteModal = false" class="btn-secondary">
              Annuler
            </button>
            <button @click="deleteUser" class="btn-danger">
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminUserView',
  data() {
    return {
      user: null,
      users: [],
      filteredUsers: [],
      search: '',
      filterRole: '',
      filterActif: '',
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showPassword: false,
      loading: false,
      errorMessage: null,
      userToDelete: null,
      formData: {
        prenom: '',
        nom: '',
        email: '',
        password: '',
        role: '',
        departement: '',
        poste: '',
        telephone: '',
        date_embauche: ''
      }
    }
  },
  async mounted() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
    await this.loadUsers();
  },
  methods:{
  // Fonction helper pour récupérer le token
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }, 
    async loadUsers() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      this.users = data.data;
      this.filteredUsers = data.data;
    } else {
      console.error('Erreur:', data.message);
      if (response.status === 401) {
        alert('Session expirée. Veuillez vous reconnecter.');
        this.$router.push('/login');
      }
    }
  } catch (error) {
    console.error('Erreur chargement utilisateurs:', error);
  }
},

    filterUsers() {
      let filtered = [...this.users];

      if (this.search) {
        const searchLower = this.search.toLowerCase();
        filtered = filtered.filter(u => 
          u.nom.toLowerCase().includes(searchLower) ||
          u.prenom.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
        );
      }

      if (this.filterRole) {
        filtered = filtered.filter(u => u.role === this.filterRole);
      }

      if (this.filterActif !== '') {
        const isActif = this.filterActif === 'true';
        filtered = filtered.filter(u => Boolean(u.est_actif) === isActif);
      }

      this.filteredUsers = filtered;
    },

    async createUser() {
  this.loading = true;
  this.errorMessage = null;

  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(this.formData)
    });

    const data = await response.json();

    if (data.success) {
      await this.loadUsers();
      this.closeModals();
      alert('✅ Utilisateur créé avec succès !');
    } else {
      this.errorMessage = data.message;
    }
  } catch (error) {
    console.error('Erreur création:', error);
    this.errorMessage = 'Erreur lors de la création';
  } finally {
    this.loading = false;
  }
},

    editUser(user) {
      this.formData = {
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        role: user.role,
        departement: user.departement || '',
        poste: user.poste || '',
        telephone: user.telephone || '',
        date_embauche: user.date_embauche || ''
      };
      this.showEditModal = true;
    },

    async updateUser() {
  this.loading = true;
  this.errorMessage = null;

  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`http://localhost:3000/api/users/${this.formData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(this.formData)
    });

    const data = await response.json();

    if (data.success) {
      await this.loadUsers();
      this.closeModals();
      alert('✅ Utilisateur modifié avec succès !');
    } else {
      this.errorMessage = data.message;
    }
  } catch (error) {
    console.error('Erreur modification:', error);
    this.errorMessage = 'Erreur lors de la modification';
  } finally {
    this.loading = false;
  }
},

    async toggleUserStatus(user) {
  if (!confirm(`Voulez-vous vraiment ${user.est_actif ? 'désactiver' : 'activer'} ${user.prenom} ${user.nom} ?`)) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`http://localhost:3000/api/users/${user.id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      await this.loadUsers();
    }
  } catch (error) {
    console.error('Erreur toggle status:', error);
  }
},

    confirmDelete(user) {
      if (user.id === 1) {
        alert('❌ Impossible de supprimer l\'administrateur principal !');
        return;
      }
      this.userToDelete = user;
      this.showDeleteModal = true;
    },

    async deleteUser() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`http://localhost:3000/api/users/${this.userToDelete.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      await this.loadUsers();
      this.showDeleteModal = false;
      this.userToDelete = null;
      alert('✅ Utilisateur supprimé avec succès');
    }
  } catch (error) {
    console.error('Erreur suppression:', error);
    alert('❌ Erreur lors de la suppression');
  }
},

    closeModals() {
      this.showCreateModal = false;
      this.showEditModal = false;
      this.errorMessage = null;
      this.formData = {
        prenom: '',
        nom: '',
        email: '',
        password: '',
        role: '',
        departement: '',
        poste: '',
        telephone: '',
        date_embauche: ''
      };
    },

    getRoleLabel(role) {
      const roles = {
        admin: 'Admin',
        rh: 'RH',
        manager: 'Manager',
        employe: 'Employé'
      };
      return roles[role] || role;
    },

    goBack() {
      this.$router.push('/dashboard');
    },

    goToDashboard() {
      this.$router.push('/dashboard');
    },
    goToTicket() {
      this.$router.push('/gestionTicket');
    },

    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');

* {
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

.admin-container {
  font-family: 'Mulish', sans-serif;
  background: #F0FDFA;
  min-height: 100vh;
  padding: 20px;
  margin-left: 240px;
}

/* Sidebar */
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

.sidebar .logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
}

.sidebar .logo-icon {
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

.sidebar .logo-text {
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

.sidebar .user-profile {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.sidebar .user-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.sidebar .user-role {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 12px;
}

.sidebar .btn-logout {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
}

.sidebar .btn-logout:hover {
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

/* Header */
.header {
  max-width: 1200px;
  margin: 0 auto 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: #0D9488;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 20px;
}

.logo-text {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: #111827;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-badge {
  background: #0D9488;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.btn-back {
  background: transparent;
  color: #64748B;
  border: 1px solid #E5E7EB;
  padding: 8px 16px;
  border-radius: 8px;
  font-family: 'Mulish', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: #F9FAFB;
  border-color: #0D9488;
  color: #0D9488;
}

/* Page Container */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.page-header {
  background: linear-gradient(135deg, #0D9488 0%, #14B8A6 100%);
  padding: 40px;
  color: white;
}

.page-header h1 {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 32px;
  margin-bottom: 8px;
  color: white;
}

.page-header p {
  opacity: 0.95;
  font-size: 16px;
}

/* Content Section */
.content-section {
  padding: 40px;
}

/* Toolbar */
.toolbar {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.search-section {
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-family: 'Mulish', sans-serif;
  font-size: 15px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #0D9488;
  background: #F0FDFA;
}

.filters-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-family: 'Mulish', sans-serif;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #0D9488;
}

.btn-primary {
  padding: 12px 24px;
  background: #0D9488;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Mulish', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(13, 148, 136, 0.2);
}

.btn-primary:hover {
  background: #0F766E;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(13, 148, 136, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Table */
.table-container {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: #F9FAFB;
}

.users-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #111827;
  font-size: 14px;
  border-bottom: 2px solid #E5E7EB;
}

.users-table td {
  padding: 16px;
  border-bottom: 1px solid #F0F0F0;
}

.users-table tbody tr:hover {
  background: #F9FAFB;
}

.inactive-row {
  opacity: 0.6;
}

.id-cell {
  color: #64748B;
  font-weight: 600;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #0D9488;
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.user-name {
  font-weight: 600;
  color: #111827;
}

.user-poste {
  font-size: 13px;
  color: #64748B;
}

.email-cell {
  color: #64748B;
}

.dept-cell {
  color: #64748B;
}

.role-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.role-admin {
  background: #FEE2E2;
  color: #991B1B;
}

.role-rh {
  background: #DBEAFE;
  color: #1E40AF;
}

.role-manager {
  background: #FEF3C7;
  color: #92400E;
}

.role-employe {
  background: #F3F4F6;
  color: #374151;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.status-active {
  background: #D1FAE5;
  color: #065F46;
}

.status-inactive {
  background: #FEE2E2;
  color: #991B1B;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #E5E7EB;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.edit-btn:hover {
  border-color: #3B82F6;
  background: #EFF6FF;
}

.toggle-btn:hover {
  border-color: #F59E0B;
  background: #FEF3C7;
}

.delete-btn:hover {
  border-color: #EF4444;
  background: #FEE2E2;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
}

.no-results-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-results-text {
  color: #64748B;
  font-size: 16px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-small {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid #E5E7EB;
}

.modal-header h2 {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 22px;
  color: #111827;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #94A3B8;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #111827;
}

.modal-body {
  padding: 30px;
}

/* Form */
.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: #111827;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #F0FDFA;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  font-size: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  color: #111827;
  font-weight: 500;
  font-size: 14px;
}

.required {
  color: #EF4444;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-family: 'Mulish', sans-serif;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #FFFFFF;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0D9488;
  background: #F0FDFA;
}

.input-hint {
  font-size: 12px;
  color: #64748B;
  margin-top: 4px;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  padding-right: 45px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  opacity: 0.7;
}

.info-box {
  background: #F0FDFA;
  border-left: 4px solid #0D9488;
  padding: 16px;
  border-radius: 8px;
  margin-top: 24px;
}

.info-box-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-box-content {
  font-size: 14px;
  color: #64748B;
  line-height: 1.5;
}

.error-message {
  background: #FEE2E2;
  color: #991B1B;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 14px;
}

.warning-text {
  color: #EF4444;
  font-weight: 600;
  margin-top: 12px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-secondary {
  padding: 12px 24px;
  background: transparent;
  color: #64748B;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-family: 'Mulish', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #F9FAFB;
  border-color: #0D9488;
  color: #0D9488;
}

.btn-danger {
  padding: 12px 24px;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Mulish', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: #DC2626;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .admin-container {
    margin-left: 0;
  }

  .sidebar {
    display: none;
  }

  .header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .user-section {
    width: 100%;
    justify-content: space-between;
  }

  .page-header {
    padding: 24px;
  }

  .content-section {
    padding: 20px;
  }

  .toolbar {
    flex-direction: column;
  }

  .search-section {
    width: 100%;
  }

  .filters-section {
    width: 100%;
    flex-direction: column;
  }

  .filter-select,
  .btn-primary {
    width: 100%;
  }

  .table-container {
    overflow-x: auto;
  }

  .users-table {
    min-width: 800px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 95%;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary,
  .btn-danger {
    width: 100%;
  }
}
</style>