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
          <!--
          <div class="desktop-view">
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
            -->
          <div class="desktop-view">
            <table class="w-full min-w-[760px]">
              <thead>
                <tr class="border-b border-gray-200 text-left">
                  <th class="w-[30%] text-gray-600 font-semibold font-['Mulish'] text-[14px]" style="padding-bottom: 24px;">Nom du fichier</th>
                  <th class="w-[20%] text-gray-600 font-semibold font-['Mulish'] text-[14px]" style="padding-bottom: 24px;">Service</th>
                  <th class="w-[10%] text-gray-600 font-semibold font-['Mulish'] text-[14px]" style="padding-bottom: 24px;">Taille</th>
                  <th class="w-[15%] text-gray-600 font-semibold font-['Mulish'] text-[14px]" style="padding-bottom: 24px;">Date d'ajout</th>
                  <th class="w-[15%] text-gray-600 font-semibold font-['Mulish'] text-[14px]" style="padding-bottom: 24px;">Actions</th>
                  <th class="w-[20%] text-gray-600 font-semibold font-['Mulish'] text-[14px]" style="padding-bottom: 24px;">Dernière consultation</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in processedDocuments" :key="'desktop-'+doc.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td class="text-gray-900 font-medium font-['Mulish'] text-[14px]" style="padding-top: 24px; padding-bottom: 24px;">{{ doc.titre }}</td>
                  <td style="padding-top: 24px; padding-bottom: 24px;">
                    <span class="service-badge">
                      {{ doc.service_nom || 'Général' }}
                    </span>
                  </td>
                  <td class="text-gray-600 font-['Mulish'] text-[14px]" style="padding-top: 24px; padding-bottom: 24px;">{{ doc.taille_ko }} Ko</td>
                  <td class="text-gray-600 font-['Mulish'] text-[14px]" style="padding-top: 24px; padding-bottom: 24px;">{{ doc.date_affichage }}</td>
                  
                  <td style="padding-top: 24px; padding-bottom: 24px;">
                    <div class="desktop-actions">
                      <button @click="telecharger(doc)" class="action-btn" title="Télécharger">
                        <Download :size="18" class="text-gray-600" />
                      </button>
                      
                      <button @click="voir(doc)" class="action-btn" title="Voir">
                        <Eye :size="18" class="text-gray-600" />
                      </button>
                      
                      <button @click="confirmerSuppression(doc.id)" class="action-btn action-btn-danger" title="Supprimer">
                        <Trash2 :size="18" class="text-red-500" />
                      </button>
                    </div>
                  </td>
                  <td class="text-gray-600 font-['Mulish'] text-[14px]" style="padding-top: 24px; padding-bottom: 24px;">{{ doc.derniere_consultation_affichage }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-view">
            <div 
              v-for="doc in processedDocuments" 
              :key="'mobile-'+doc.id" 
              class="mobile-swipe-container"
            >
              <div class="mobile-swipe-actions">
                <button @click="confirmerSuppression(doc.id)" class="swipe-delete-btn">
                  <Trash2 :size="20" />
                  <span>Supprimer</span>
                </button>
              </div>

              <div 
                class="mobile-card swipeable-content"
                :class="{ 'is-swiped': swipedDocId === doc.id }"
                @touchstart="touchStartX = $event.touches[0].clientX"
                @touchend="handleSwipe(doc.id, $event.changedTouches[0].clientX)"
              >
                <div class="mobile-card-header">
                  <h3 class="mobile-card-title">{{ doc.titre }}</h3>
                  <div class="mobile-card-actions">
                    <button @click="voir(doc)" class="action-btn">
                      <Eye :size="18" class="text-gray-600" />
                    </button>
                    <button @click="telecharger(doc)" class="action-btn">
                      <Download :size="18" class="text-gray-600" />
                    </button>
                  </div>
                </div>

                <div class="mobile-card-meta">
                  <span class="service-badge mobile-badge">{{ doc.service_nom || 'Général' }}</span>
                  <span class="meta-item">• {{ doc.taille_ko }} Ko</span>
                  <span class="meta-item" style="width: 100%;">• Ajout : {{ doc.date_affichage }}</span>
                  <span class="meta-item" style="width: 100%;">• Consulté : {{ doc.derniere_consultation_affichage }}</span>
                </div>
              </div>

            </div>
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
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';
import DashboardSidebar from '@/components/DashboardSidebar.vue';

const apiBase = import.meta.env.VITE_API_BASE;
const router = useRouter();
const user = ref(null);
const documents = ref([]);

// 1. On définit la valeur par défaut sur 'desc' (Plus récent d'abord)
const sortOrder = ref('desc');
const selectedService = ref(''); // Variable pour stocker le choix du menu
const selectedFormat = ref(''); // Stocke le choix du format

// Stocke l'ID du document qu'on est en train de glisser
const swipedDocId = ref(null);
// Stocke la position du doigt quand il touche l'écran
let touchStartX = 0;

const handleSwipe = (id, touchEndX) => {
  const distance = touchStartX - touchEndX;
  if (distance > 50) {
    // Si on a glissé le doigt de plus de 50px vers la gauche : on ouvre
    swipedDocId.value = id;
  } else if (distance < -50) {
    // Si on a glissé vers la droite : on referme
    swipedDocId.value = null;
  }
};
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

// --- NOUVELLE FONCTION : Enregistrer la consultation ---
const enregistrerConsultation = async (id) => {
  try {
    const token = localStorage.getItem('token');
    await fetch(`${apiBase}/api/documents/${id}/consulter`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (e) {
    console.error("Erreur lors de l'enregistrement de la consultation", e);
  }
};

// Fonction utilitaire pour convertir un Blob (Web) en Base64 (Mobile)
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
};
// --- FONCTION MODIFIÉE : Télécharger ---
// --- FONCTION MODIFIÉE : Télécharger (Hybride) ---
const telecharger = async (doc) => {
  try {
    await enregistrerConsultation(doc.id);

    // On récupère le fichier depuis le backend
    const response = await fetch(`${apiBase}/uploads/${doc.fichier_path}`);
    const blob = await response.blob();

    if (Capacitor.isNativePlatform()) {
      // 📱 VERSION MOBILE (Android/iOS)
      const base64Data = await blobToBase64(blob);
      
      // On retire l'en-tête "data:application/pdf;base64," pour ne garder que le code brut
      const base64String = base64Data.split(',')[1];

      // On écrit le fichier dans le dossier "Documents" du téléphone
      await Filesystem.writeFile({
        path: doc.titre, // Nom du fichier
        data: base64String,
        directory: Directory.Documents 
      });
      
      alert(`Le document "${doc.titre}" a été enregistré dans le dossier Documents de l'appareil.`);
    } else {
      // 💻 VERSION WEB (Navigateur classique)
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.titre);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // On nettoie la mémoire
    }
    
    fetchDocuments(); 
  } catch (e) {
    console.error("Erreur téléchargement", e);
    alert("Une erreur est survenue lors du téléchargement.");
  }
};

// --- FONCTION MODIFIÉE : Voir (Hybride) ---
const voir = async (doc) => {
  try {
    await enregistrerConsultation(doc.id); 
    const fileUrl = `${apiBase}/uploads/${doc.fichier_path}`;

    if (Capacitor.isNativePlatform()) {
      // 📱 VERSION MOBILE : Ouvre un vrai navigateur superposé (sans casser l'app)
      await Browser.open({ url: fileUrl });
    } else {
      // 💻 VERSION WEB : Nouvel onglet classique
      window.open(fileUrl, '_blank');   
    }
    
    fetchDocuments(); 
  } catch (e) {
    console.error("Erreur lors de la visualisation", e);
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
/* =========================================================
   GESTION DU RESPONSIVE (MEDIA QUERIES)
   ========================================================= */

/* Par défaut (écrans de téléphones) : On cache le bureau, on montre le mobile */
.desktop-view {
  display: none;
}
.mobile-view {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Espacement entre les cartes */
}

/* Sur les écrans moyens et grands (tablettes, ordinateurs) : On inverse ! */
@media (min-width: 768px) {
  .desktop-view {
    display: block;
    overflow-x: auto;
  }
  .mobile-view {
    display: none;
  }
}

/* =========================================================
   STYLE DES CARTES MOBILES
   ========================================================= */

.mobile-card {
  background-color: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.mobile-card-title {
  color: #111827;
  font-weight: 700;
  font-family: 'Mulish', sans-serif;
  font-size: 15px;
  line-height: 1.2;
  word-break: break-word;
  margin: 0;
}

.mobile-card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.mobile-card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 12px;
  row-gap: 8px;
  color: #6B7280;
  font-family: 'Mulish', sans-serif;
  font-size: 13px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Ajustement de ton badge pour qu'il soit un peu plus fin sur mobile */
.mobile-badge {
  font-size: 12px !important;
  padding: 4px 12px !important;
}

/* =========================================================
   STYLE DES BOUTONS COMMUNS (Bureau et Mobile)
   ========================================================= */

.desktop-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  padding: 8px;
  background-color: #F9FAFB;
  border-radius: 8px;
  transition: background-color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.action-btn:hover {
  background-color: #F3F4F6;
}

.action-btn-danger:hover {
  background-color: #FEF2F2;
}
/* =========================================================
   STYLE DU SWIPE TO DELETE (Mobile)
   ========================================================= */

/* La boîte principale qui cache ce qui dépasse (overflow: hidden) */
.mobile-swipe-container {
  position: relative;
  overflow: hidden; 
  border-radius: 12px;
  background-color: #EF4444; /* Le fond rouge */
}

/* Le bouton Supprimer collé à droite, caché SOUS la carte */
.mobile-swipe-actions {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 100px;
  display: flex;
  justify-content: flex-end;
}

.swipe-delete-btn {
  background: none;
  border: none;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  gap: 4px;
  font-family: 'Mulish', sans-serif;
  font-size: 12px;
  font-weight: 600;
}

/* La carte blanche qui va glisser */
.swipeable-content {
  position: relative;
  z-index: 10;
  background-color: #ffffff; /* Doit être blanc pour cacher le rouge */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* Animation fluide */
}

/* La classe CSS qui est ajoutée par le Javascript quand on glisse ! */
.swipeable-content.is-swiped {
  transform: translateX(-100px); /* Décale la carte de 100px vers la gauche */
}
</style>