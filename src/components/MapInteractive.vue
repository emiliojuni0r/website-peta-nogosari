<template>
    <div class="flex h-screen w-full font-sans bg-gray-50">

        <!-- AREA KIRI: PETA -->
        <div class="flex-1 relative z-0">
            <div id="map" class="h-full w-full"></div>

            <!-- Form Modal (Mengambang di atas peta, dipindah ke kiri agar tidak tertutup sidebar) -->
            <div v-if="showModal"
                class="absolute top-4 left-4 z-[1000] bg-white p-6 rounded-xl shadow-2xl w-80 border border-gray-200 transition-all">
                <h3 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
                    {{ editId ? 'Edit Data Rumah' : 'Tambah Data Baru' }}
                </h3>

                <form @submit.prevent="saveData" class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Kepala Keluarga</label>
                        <input v-model="formData.kepala_keluarga" required placeholder="Contoh: Budi Santoso"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Nama Isteri</label>
                        <input v-model="formData.nama_isteri" placeholder="Kosongkan jika tidak ada"
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div class="flex gap-4">
                        <div class="flex-1">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Anggota</label>
                            <input type="number" v-model="formData.jumlah_anggota" required min="1"
                                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Foto Fisik</label>
                        <input type="file" accept="image/*" @change="handleFileUpload"
                            class="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                        <p v-if="editId" class="text-[10px] text-gray-400 mt-1">*Kosongkan jika foto tetap</p>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="submit"
                            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors">Simpan</button>
                        <button type="button" @click="closeModal"
                            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg transition-colors">Batal</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- AREA KANAN: SIDEBAR LIST RUMAH -->
        <div class="w-96 bg-white shadow-[-4px_0_15px_rgba(0,0,0,0.05)] z-10 flex flex-col border-l border-gray-200">

            <!-- Header Sidebar -->
            <div class="px-5 py-4 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm">
                <div>
                    <h2 class="font-extrabold text-lg text-gray-800 tracking-tight">Data Penduduk</h2>
                    <p class="text-xs text-gray-500 font-medium mt-0.5">Total: {{ houses.length }} Rumah terdata</p>
                </div>
                <button @click="handleLogout"
                    class="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-md text-sm font-bold transition-colors">
                    Logout
                </button>
            </div>

            <!-- List Container -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">

                <div v-if="houses.length === 0" class="text-center text-gray-400 text-sm py-10">
                    Belum ada data rumah. Klik area pada peta untuk menambah data.
                </div>

                <!-- Card Rumah -->
                <div v-for="house in houses" :key="house.id" @click="focusHouse(house)"
                    class="bg-white border border-gray-100 rounded-xl p-3 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
                    <div class="flex gap-3 items-center">
                        <img :src="house.foto_rumah || 'https://via.placeholder.com/150?text=No+Image'"
                            class="w-16 h-16 object-cover rounded-lg border border-gray-100" />
                        <div class="flex-1 min-w-0">
                            <h4
                                class="font-bold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                                Kel. {{ house.kepala_keluarga }}
                            </h4>
                            <p class="text-xs text-gray-500 truncate mt-0.5">Isteri: {{ house.nama_isteri || '-' }}</p>
                            <div
                                class="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                                {{ house.jumlah_anggota }} Jiwa
                            </div>
                        </div>
                        <!-- Icon Panah (Indikator bisa diklik) -->
                        <svg xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const showModal = ref(false)
const houses = ref([])
const editId = ref(null)
const formData = ref({
    lat: null, lng: null, kepala_keluarga: '', nama_isteri: '', jumlah_anggota: ''
})
const selectedFile = ref(null)

let map = null
let markersLayer = null
// Objek untuk menyimpan referensi marker berdasarkan ID agar bisa dipanggil dari sidebar
const markerRefs = {}

const handleLogout = () => {
    if (confirm("Yakin ingin keluar dari portal admin?")) {
        localStorage.removeItem('token')
        router.push('/login')
    }
}

// Konfigurasi Custom Icon
const customIcon = L.icon({
    iconUrl: 'green_mark-removebg.png', // Path ke gambar icon kamu (taruh di folder public)
    iconSize: [38, 38],           // Ukuran gambar icon [lebar, tinggi]
    iconAnchor: [19, 38],         // Titik pada icon yang menunjuk ke koordinat (biasanya bagian tengah bawah)
    popupAnchor: [0, -38],        // Posisi popup muncul relatif terhadap iconAnchor
    // shadowUrl: '/marker-shadow.png', // Opsional: jika kamu punya gambar bayangan
    // shadowSize: [50, 50],            // Opsional: ukuran bayangan
    // shadowAnchor: [15, 38]           // Opsional: posisi bayangan
});

const handleFileUpload = (event) => {
    selectedFile.value = event.target.files[0]
}

const closeModal = () => {
    showModal.value = false
    editId.value = null
    selectedFile.value = null
    formData.value = { lat: null, lng: null, kepala_keluarga: '', nama_isteri: '', jumlah_anggota: '' }
}

const fetchHouses = async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/houses`)
        houses.value = res.data
        renderMarkers()
    } catch (error) {
        console.error("Gagal mengambil data rumah", error)
    }
}

const renderMarkers = () => {
    markersLayer.clearLayers()
    // Kosongkan referensi marker lama
    for (let key in markerRefs) delete markerRefs[key];

    houses.value.forEach(house => {
        // --- TAMBAHKAN OPSI ICON DI SINI ---
        const marker = L.marker([house.lat, house.lng], { icon: customIcon })

        const popupHTML = `
      <div style="min-width: 220px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <img src="${house.foto_rumah || 'https://via.placeholder.com/220x140?text=Tidak+Ada+Foto'}" style="width:100%; height:130px; object-fit:cover; border-radius:8px; margin-bottom:12px; border: 1px solid #e5e7eb;">
        <h4 style="margin:0 0 4px; font-size:15px; font-weight:800; color:#1e293b;">Kel. ${house.kepala_keluarga}</h4>
        <p style="margin:0 0 2px; font-size:13px; color:#64748b;">Isteri: ${house.nama_isteri || '-'}</p>
        <p style="margin:0 0 12px; font-size:13px; color:#64748b;">Anggota: <span style="font-weight:700; color:#0f172a;">${house.jumlah_anggota} Jiwa</span></p>
        
        <div style="display: flex; gap: 8px;">
          <button onclick="window.triggerEdit(${house.id})" style="flex:1; background-color:#eab308; color:white; border:none; padding: 6px; border-radius:6px; cursor:pointer; font-weight:700; font-size:12px; transition: background-color 0.2s;">Edit</button>
          <button onclick="window.triggerDelete(${house.id})" style="flex:1; background-color:#ef4444; color:white; border:none; padding: 6px; border-radius:6px; cursor:pointer; font-weight:700; font-size:12px; transition: background-color 0.2s;">Hapus</button>
        </div>
      </div>
    `
        marker.bindPopup(popupHTML)
        markersLayer.addLayer(marker)

        // Simpan referensi marker ke dalam objek
        markerRefs[house.id] = marker
    })
}

// FUNGSI BARU: Interaksi dari Sidebar ke Peta
const focusHouse = (house) => {
    // Tutup popup lain dan form jika sedang terbuka
    map.closePopup()
    showModal.value = false

    // Terbang ke koordinat rumah dengan animasi smooth (zoom level 20 agar atap terlihat detail)
    map.flyTo([house.lat, house.lng], 20, {
        animate: true,
        duration: 1.5 // durasi animasi 1.5 detik
    })

    // Buka popup rumah tersebut setelah animasi terbang selesai
    setTimeout(() => {
        if (markerRefs[house.id]) {
            markerRefs[house.id].openPopup()
        }
    }, 1600)
}

const saveData = async () => {
    try {
        const token = localStorage.getItem('token')
        const submitData = new FormData()
        Object.keys(formData.value).forEach(key => submitData.append(key, formData.value[key]))
        if (selectedFile.value) submitData.append('foto_rumah', selectedFile.value)

        const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        if (editId.value) {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/houses/${editId.value}`, submitData, config)
        } else {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/houses`, submitData, config)
        }

        closeModal()
        fetchHouses()
    } catch (error) {
        alert("Gagal menyimpan data.")
    }
}

onMounted(() => {
    map = L.map('map', { zoomControl: false }).setView([-7.929817, 113.972812], 16) // Default zoom dijauhkan sedikit
    L.control.zoom({ position: 'bottomleft' }).addTo(map) // Zoom dipindah ke kiri bawah

    L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 21, attribution: '© Google Maps'
    }).addTo(map)
    markersLayer = L.layerGroup().addTo(map)

    map.on('click', (e) => {
        closeModal()
        formData.value.lat = e.latlng.lat
        formData.value.lng = e.latlng.lng
        showModal.value = true
    })

    fetchHouses()

    window.triggerEdit = (id) => {
        const target = houses.value.find(h => h.id === id)
        if (target) {
            editId.value = target.id
            formData.value = { ...target }
            showModal.value = true
            map.closePopup()
        }
    }

    window.triggerDelete = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus marker rumah ini?")) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/houses/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
                fetchHouses()
            } catch (error) {
                alert("Gagal menghapus data!")
            }
        }
    }
})
</script>