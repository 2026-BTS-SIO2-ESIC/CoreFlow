import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import CongesValidation from '@/views/congesValidation.vue'
import DemandeCongeView from '../views/DemandeCongeView.vue'
import AdminUserView from '../views/AdminUserView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/conges',
      name: 'conges',
      component: CongesValidation
      path: '/conges/demande',
      name: 'DemandeConge',
      component: DemandeCongeView
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUserView
    }
  ],
})

export default router
