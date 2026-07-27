import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import MapView from '../views/MapView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/',
    name: 'Map',
    component: MapView,
    // Meta field untuk menandai route ini butuh otentikasi
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global Guard: Cek apakah user punya token sebelum masuk ke halaman yang diproteksi
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    // Jika butuh auth tapi tidak ada token, lempar ke login
    next('/login')
  } else if (to.path === '/login' && token) {
    // Jika sudah login tapi mencoba ke halaman login, kembalikan ke peta
    next('/')
  } else {
    next()
  }
})

export default router