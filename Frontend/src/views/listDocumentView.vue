<template>
  <div class="page-layout">
    <DashboardSidebar :user="user" @logout="logout" />
    
    <main class="main-content">
      <div class="content-centered">
        
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 mt-16 lg:mt-0">
          <h1 class="text-gray-900 font-bold text-[32px] font-['Poppins']">
            Documents
          </h1>
          <button 
            @click="$router.push('/documents/add')"
            class="bg-[#0D9488] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#0D9488]/90 transition-colors shadow-sm font-semibold font-['Mulish'] text-[15px]"
          >
            <Plus :size="20" />
            Ajouter un document
          </button>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100" style="padding: 30px; margin-top: 25px; margin-bottom: 30px;">
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <div class="flex items-center gap-2 text-gray-700 font-semibold font-['Mulish'] text-[14px]">
              <Filter :size="20" />
              Filtres :
            </div>
            <select v-model="selectedService" class="filter-select">
              <option value="">Tous les services</option>
              <option v-for="service in availableServices" :key="service" :value="service">
                {{ service }}
              </option>
            </select>
            <select v-model="selectedFormat" class="filter-select">
            <option value="">Tous les formats</option>
            <option v-for="format in availableFormats" :key="format" :value="format">
              {{ format }}
            </option>
          </select>
            <div class="flex items-center gap-2 text-gray-700 bg-white border border-gray-200 px-5 py-2.5 rounded-lg font-['Mulish'] text-[14px] font-medium hover:bg-gray-50 transition-colors">
              Date :
              <select v-model="sortOrder" class="filter-select">
                <option value="desc">Du plus récent au plus ancien</option>
                <option value="asc">Du plus ancien au plus récent</option>
              </select>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100" style="padding: 40px;">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[760px]">
              <thead>
                <tr class="border-b border-gray-200 text-left">
                  <th class="w-[40%] text-gray-600 font-semibold font-['Mulish'] text-[14px]" style="padding-bottom: 24px;">Nom du fichier</th>
                  <th class="w-[20%] text-gray-600 font-semibold font-['Mulish'] text-[14px]" style="padding-bottom: 24px;">Service</th>
                  <th class="w-[10%] text-gray-600 font-semibold font-['Mulish'] text-[14px]" style="padding-bottom: 24px;">Taille</th>
                  <th class="w-[15%] text-gray-600 font-semibold font-['Mulish'] text-[14px]" style="padding-bottom: 24px;">Date d'ajout</th>
                  <th class="w-[15%] text-gray-600 font-semibold font-['Mulish'] text-[14px]" style="padding-bottom: 24px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in processedDocuments" :key="doc.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td class="text-gray-900 font-medium font-['Mulish'] text-[14px]" style="padding-top: 24px; padding-bottom: 24px;">{{ doc.titre }}</td>
                  <td style="padding-top: 24px; padding-bottom: 24px;">
                    <span class="service-badge">
                      {{ doc.service_nom || 'Général' }}
                    </span>
                  </td>
                  <td class="text-gray-600 font-['Mulish'] text-[14px]" style="padding-top: 24px; padding-bottom: 24px;">{{ doc.taille_ko }} Ko</td>
                  <td class="text-gray-600 font-['Mulish'] text-[14px]" style="padding-top: 24px; padding-bottom: 24px;">{{ doc.date_affichage }}</td>
                  
                  <td style="padding-top: 24px; padding-bottom: 24px;">
                    <div class="flex items-center gap-2">
                      <button @click="telecharger(doc)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Télécharger">
                        <Download :size="18" class="text-gray-600" />
                      </button>
                      <a :href="`${apiBase}/uploads/${doc.fichier_path}`" target="_blank" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Voir">
                        <Eye :size="18" class="text-gray-600" />
                      </a>
                      <button @click="confirmerSuppression(doc.id)" class="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                        <Trash2 :size="18" class="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="documents.length === 0" class="text-center text-gray-400 italic" style="padding-top: 64px; padding-bottom: 64px;">
            Aucun document trouvé.
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Filter, Download, Eye, Trash2 } from 'lucide-vue-next';
import DashboardSidebar from '@/components/DashboardSidebar.vue';

const apiBase = import.meta.env.VITE_API_BASE;
const router = useRouter();
const user = ref(null);
const documents = ref([]);

// 1. On définit la valeur par défaut sur 'desc' (Plus récent d'abord)
const sortOrder = ref('desc');
const selectedService = ref(''); // Variable pour stocker le choix du menu
const selectedFormat = ref(''); // Stocke le choix du format

// La liste de tes services
const availableServices = ['Informatique', 'Commercial', 'Ressources Humaines', 'IT', 'Général'];

// La liste des formats pour le menu
const availableFormats = ['PDF', 'Word', 'Excel', 'PowerPoint', 'Image', 'Texte', 'Autre'];

// Le traducteur (caché en arrière-plan)
const getFormatName = (mimeType) => {
  if (!mimeType) return 'Autre';
  
  const mime = mimeType.toLowerCase();
  if (mime.includes('pdf')) return 'PDF';
  if (mime.includes('word') || mime.includes('document')) return 'Word';
  if (mime.includes('excel') || mime.includes('sheet') || mime.includes('csv')) return 'Excel';
  if (mime.includes('powerpoint') || mime.includes('presentation')) return 'PowerPoint';
  if (mime.includes('image')) return 'Image';
  if (mime.includes('text')) return 'Texte';
  
  return 'Autre';
};


const processedDocuments = computed(() => {
  let result = [...documents.value];

  // 1. Filtre par Service
  if (selectedService.value !== '') {
    result = result.filter(doc => (doc.service_nom || 'Général') === selectedService.value);
  }

  // 2. Filtre par Format (Il utilise le traducteur pour vérifier !)
  if (selectedFormat.value !== '') {
    result = result.filter(doc => getFormatName(doc.type_fichier) === selectedFormat.value);
  }

  // 3. Tri Chronologique
  return result.sort((a, b) => {
    let dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    let dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    
    if (isNaN(dateA)) dateA = 0;
    if (isNaN(dateB)) dateB = 0;

    if (sortOrder.value === 'asc') {
      return dateA - dateB; 
    } else {
      return dateB - dateA; 
    }
  });
});


const fetchDocuments = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiBase}/api/documents`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    documents.value = data;
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
  }
};

const telecharger = async (doc) => {
  try {
    const response = await fetch(`${apiBase}/uploads/${doc.fichier_path}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', doc.titre);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    fetchDocuments();
  } catch (e) {
    console.error("Erreur téléchargement", e);
  }
};

const confirmerSuppression = (id) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
    const token = localStorage.getItem('token');
    fetch(`${apiBase}/api/documents/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.ok) {
        documents.value = documents.value.filter(doc => doc.id !== id);
      } else {
        console.error("Erreur suppression", response.statusText);
      }
    })
    .catch(e => console.error("Erreur suppression", e));
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/login');
};

onMounted(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    return;
  }

  const userStr = localStorage.getItem('user');
  if (userStr) {
    user.value = JSON.parse(userStr);
  }

  fetchDocuments();
});
</script>

<style scoped>
/* Conserve ton layout pour centrer et gérer la sidebar ! */
.page-layout {
  min-height: 100vh;
  background-color: #F0FDFA;
}

.main-content {
  padding: 24px;
}

@media (min-width: 1025px) {
  .main-content {
    padding-left: calc(248px + 32px);
    padding-right: 32px;
  }
}

.content-centered {
  max-width: 1152px;
  margin: 0 auto;
  width: 100%;
}

/* --- 1. L'espace dans les rectangles des filtres --- */
.filter-select {
  padding: 10px 20px; /* C'est ici qu'on donne un bel espace intérieur */
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background-color: #FFFFFF;
  color: #374151;
  font-family: 'Mulish', sans-serif;
  font-size: 14px;
  outline: none;
}
/* --- 3. Les bulles des services --- */
.service-badge {
  padding: 6px 16px; /* Plus d'espace à l'intérieur */
  border-radius: 9999px; /* Arrondi total en forme de pilule */
  background-color: #F3F4F6;
  color: #4B5563;
  font-family: 'Mulish', sans-serif;
  font-size: 13px;
  font-weight: 500;
}
</style>