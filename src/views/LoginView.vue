<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
    <div class="bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md border border-gray-100">
      
      <!-- Header Login -->
      <div class="text-center mb-10">
        <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Portal Admin</h2>
        <p class="text-sm text-gray-500 mt-2 font-medium">Sistem Informasi Peta Interaktif</p>
      </div>
      
      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1.5">Username</label>
          <input 
            v-model="username" 
            type="text" 
            required
            placeholder="Masukkan username"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
          <input 
            v-model="password" 
            type="password" 
            required
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
        
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          <span v-if="!isLoading">Masuk ke Sistem</span>
          <span v-else>Memproses...</span>
        </button>
      </form>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="mt-6 p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-xl text-center border border-red-100">
        {{ errorMessage }}
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const router = useRouter()

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      username: username.value,
      password: password.value
    })
    localStorage.setItem('token', response.data.token)
    router.push('/')
  } catch (error) {
    if (error.response && error.response.status === 401) {
      errorMessage.value = 'Password salah!'
    } else if (error.response && error.response.status === 404) {
      errorMessage.value = 'Username tidak ditemukan!'
    } else {
      errorMessage.value = 'Terjadi kesalahan pada server. Coba lagi.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>