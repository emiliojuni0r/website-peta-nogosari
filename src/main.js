import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './style.css' // Import Tailwind CSS
import 'leaflet/dist/leaflet.css' // Import Leaflet CSS global

const app = createApp(App)

app.use(router)
app.mount('#app')