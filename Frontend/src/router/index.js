import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import CongesValidation from '@/views/congesValidation.vue'
import DemandeCongeView from '../views/DemandeCongeView.vue'
import AdminUserView from '../views/AdminUserView.vue'
import gestionTicket from '../views/gestionTicket.vue'
import addDocumentView from '@/views/addDocumentView.vue'
import TicketsView from '../views/TicketsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/conges',
      name: 'conges',
      component: CongesValidation,
    },
    {
      path: '/conges/demande',
      name: 'DemandeConge',
      component: DemandeCongeView,
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUserView,
    },
    {
      path: '/gestionTicket',
      name: 'gestionTicket',
      component: gestionTicket,
    },
    {
      path: '/documents/add',
      name: 'add-document',
      component: addDocumentView,
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: TicketsView,
    },
  ],
})

export default router
