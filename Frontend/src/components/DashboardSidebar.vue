<template>
  <div class="sidebar">
    <div class="logo">
      <div class="logo-icon">C</div>
      <div class="logo-text">CoreFlow</div>
    </div>

    <nav class="nav-menu">
      <RouterLink to="/dashboard" class="nav-item">
        <div class="nav-icon">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </div>
        Tableau de bord
      </RouterLink>

      <ul>
        <li>
          <RouterLink to="/conges/demande" class="nav-item">
            <div class="nav-icon">
              <svg viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            Demande Congés
          </RouterLink>
        </li>
        <li v-if="canValidateConges">
          <RouterLink to="/conges/validation" class="nav-item">
            <div class="nav-icon">
              <svg viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            Validation Congés
          </RouterLink>
        </li>
      </ul>

      <RouterLink to="/event/create" class="nav-item" :class="{ active: activeItem === 'events' }">
        <div class="nav-icon">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        Événements
      </RouterLink>

      <RouterLink to="/documents/add" class="nav-item">
        <div class="nav-icon">
          <svg viewBox="0 0 24 24">
            <path
              d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
            ></path>
          </svg>
        </div>
        Documents
      </RouterLink>

      <RouterLink to="/tickets" class="nav-item">
        <div class="nav-icon">
          <svg viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </div>
        Tickets & Support
      </RouterLink>

      <RouterLink v-if="canManageUsers" to="/admin/users" class="nav-item">
        <div class="nav-icon">
          <svg viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        Gestion utilisateurs
      </RouterLink>
    </nav>

    <div class="user-profile">
      <div v-if="loading" class="user-loading">Chargement...</div>
      <div v-else-if="user">
        <div class="user-name">{{ user.nom }} {{ user.prenom }}</div>
        <div class="user-role">{{ user.role }}</div>
      </div>
      <button @click="$emit('logout')" class="btn-logout">Déconnexion</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardSidebar',
  emits: ['logout'],
  props: {
    user: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    canManageUsers() {
      const role = this.user?.role?.toLowerCase()
      return role === 'admin' || role === 'manager'
    },
    canValidateConges() {
      const role = this.user?.role?.toLowerCase()
      return role === 'rh' || role === 'manager'
    },
  },
}
</script>

<style scoped>
.sidebar {
  width: 248px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 26px 20px 20px;
  border-bottom: 1px solid #f4f4f5;
}

.logo-icon {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 4px 10px rgba(20, 184, 166, 0.35);
  flex-shrink: 0;
}

.logo-text {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.3px;
}

.nav-menu {
  flex: 1;
  padding: 12px 10px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  color: #6b7280;
  text-decoration: none;
  transition:
    background 0.18s ease,
    color 0.18s ease;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  margin-bottom: 2px;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #f0fdfa;
  color: #0d9488;
}

.router-link-active.nav-item,
.router-link-exact-active.nav-item {
  background: #f0fdfa;
  color: #0d9488;
  font-weight: 600;
  border-left: 3px solid #14b8a6;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.user-profile {
  padding: 14px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: #fafafa;
}

.user-loading {
  font-size: 13px;
  color: #9ca3af;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  text-align: center;
  line-height: 1.3;
}

.user-role {
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.btn-logout {
  width: 100%;
  padding: 9px 16px;
  background: #fff0f0;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.btn-logout:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}
</style>
