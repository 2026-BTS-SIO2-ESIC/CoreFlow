import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import AdminUserView from '../views/AdminUserView.vue'
import addDocumentView from '@/views/addDocumentView.vue'
import listDocumentView from '@/views/listDocumentView.vue'

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
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUserView
    },
    {
      path: '/documents/add',
      name: 'add-document',
      component: addDocumentView
    },
    {
      path: '/documents/list',
      name: 'list-document',
      component: listDocumentView
    }
   
    
  ],
})

export default router
