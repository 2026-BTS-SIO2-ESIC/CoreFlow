import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import CongesValidation from '@/views/congesValidation.vue'
import DemandeCongeView from '../views/DemandeCongeView.vue'
import AdminUserView from '../views/AdminUserView.vue'
import gestionTicket from '../views/gestionTicket.vue'
import addDocumentView from '@/views/addDocumentView.vue'
import listDocumentView from '@/views/listDocumentView.vue'
import TicketsView from '../views/TicketsView.vue'
import EventView from '../views/EventView.vue'

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
      path: '/conges/validation',
      name: 'congesValidation',
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
      path: '/event/create',
      name: 'event-create',
      component: EventView,
    },
    // {
    //   path: '/gestionTicket',
    //   name: 'gestionTicket',
    //   component: gestionTicket,
    // },
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
    {
      path: '/documents/list',
      name: 'list-document',
      component: listDocumentView,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const requiredRoles = to.meta?.requiresRoles

  if (!requiredRoles) {
    next()
    return
  }

  const token = localStorage.getItem('token')
  if (!token) {
    next('/login')
    return
  }

  const userStr = localStorage.getItem('user')
  if (!userStr) {
    next('/dashboard')
    return
  }

  try {
    const user = JSON.parse(userStr)
    const role = user?.role?.toLowerCase()

    if (requiredRoles.includes(role)) {
      next()
      return
    }
  } catch (error) {
    // Données utilisateur invalides dans le stockage local.
  }

  next('/dashboard')
})

export default router
