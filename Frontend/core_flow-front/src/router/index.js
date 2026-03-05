import { createRouter, createWebHistory } from 'vue-router'
import usersView from '@/views/usersView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/users',
      name: 'users',
      component: usersView,
    }
  ],
})

export default router
