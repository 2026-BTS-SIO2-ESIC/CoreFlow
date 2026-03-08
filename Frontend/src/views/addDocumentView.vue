<template>
  <main class="flex-1 p-10 overflow-auto bg-[#F0FDFA] min-h-screen">
    
    <div class="mb-8">
      <h1 class="text-gray-900" style="font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 32px;">
        Publier un nouveau document
      </h1>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl mx-auto">
      
      <form @submit.prevent="envoyerDocument">
        
        <div 
          @click="declencherInputFichier"
          class="border-2 border-dashed border-[#0D9488]/30 rounded-2xl p-12 mb-6 bg-[#F0FDFA]/50 hover:border-[#0D9488] transition-colors cursor-pointer"
        >
          <div class="flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 rounded-full bg-[#0D9488]/10 flex items-center justify-center mb-4 text-[#0D9488] font-bold text-xl">
              ↑
            </div>
            <p class="text-gray-900 mb-2" style="font-family: 'Mulish', sans-serif; font-weight: 600; font-size: 16px;">
              {{ nomFichier ? nomFichier : 'Cliquez ici pour choisir un fichier' }}
            </p>
            <p class="text-gray-500" style="font-family: 'Mulish', sans-serif; font-size: 14px;">
              PDF, DOCX, XLSX jusqu'à 10 Mo
            </p>
          </div>
          
          <input 
            type="file" 
            ref="inputFichier" 
            class="hidden" 
            @change="captureFichier" 
            accept=".pdf,.doc,.docx,.xls,.xlsx"
          />
        </div>

        <div class="space-y-5">
          <div>
            <label class="block text-gray-700 mb-2" style="font-family: 'Mulish', sans-serif; font-weight: 600; font-size: 14px;">
              Titre du document
            </label>
            <input
              v-model="titre"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
              placeholder="Ex: Rapport trimestriel Q4"
            />
          </div>

          <div>
            <label class="block text-gray-700 mb-2" style="font-family: 'Mulish', sans-serif; font-weight: 600; font-size: 14px;">
              Description
            </label>
            <textarea
              v-model="description"
              required
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] resize-none"
              rows="4"
              placeholder="Ajoutez une description du document..."
            ></textarea>
          </div>

          <div>
            <label class="block text-gray-700 mb-2" style="font-family: 'Mulish', sans-serif; font-weight: 600; font-size: 14px;">
              Niveau de confidentialité (Visible pour qui ?)
            </label>
            <select 
              v-model="cible_role"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] bg-white"
            >
              <option value="Tous">Tous (Public)</option>
              <option value="Admin">Admin</option>
              <option value="RH">RH</option>
            </select>
          </div>
        </div>

        <div v-if="message" :class="isSuccess ? 'text-green-600' : 'text-red-600'" class="mt-4 text-center font-bold">
          {{ message }}
        </div>

        <div class="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
          <button type="button" @click="reinitialiser" class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" style="font-family: 'Mulish', sans-serif; font-weight: 600; font-size: 15px;">
            Annuler
          </button>
          
          <button type="submit" :disabled="isLoading" class="flex-1 px-6 py-3 bg-[#0D9488] text-white rounded-lg hover:bg-[#0D9488]/90 transition-colors shadow-sm disabled:opacity-50" style="font-family: 'Mulish', sans-serif; font-weight: 600; font-size: 15px;">
            {{ isLoading ? 'Envoi en cours...' : 'Publier' }}
          </button>
        </div>
      </form>

    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';

// 1. Nos variables (les boîtes de mémoire)
const titre = ref('');
const description = ref('');
const cible_role = ref('Tous');
const fichierSelectionne = ref(null);
const nomFichier = ref(''); 

// Variables pour gérer l'affichage (bouton grisé, messages d'erreur)
const inputFichier = ref(null);
const message = ref('');
const isSuccess = ref(false);
const isLoading = ref(false);

// 2. Fonction pour simuler un clic sur le vrai <input type="file"> caché
const declencherInputFichier = () => {
  inputFichier.value.click();
};

// 3. Fonction qui se déclenche quand l'utilisateur a choisi son fichier PDF
const captureFichier = (event) => {
  const file = event.target.files[0];
  if (file) {
    fichierSelectionne.value = file; // On garde le fichier physique en mémoire
    nomFichier.value = file.name;    // On garde juste le nom pour l'afficher à l'écran
  }
};

// 4. Fonction pour vider le formulaire
const reinitialiser = () => {
  titre.value = '';
  description.value = '';
  cible_role.value = 'Tous';
  fichierSelectionne.value = null;
  nomFichier.value = '';
  message.value = '';
};

// 5. 🔥 LE CŒUR DE LA MISSION 3 : L'ENVOI AU BACKEND 🔥
const envoyerDocument = async () => {
  // Vérification de sécurité : a-t-on bien un fichier ?
  if (!fichierSelectionne.value) {
    message.value = "⚠️ Veuillez sélectionner un fichier à uploader.";
    isSuccess.value = false;
    return;
  }

  isLoading.value = true;
  message.value = '';

  // Création du FormData (Notre "Postman" virtuel)
  const formData = new FormData();
  formData.append('titre', titre.value);
  formData.append('description', description.value);
  formData.append('cible_role', cible_role.value);
  
  // ⚠️ ATTENTION : Le premier mot 'fichier' DOIT correspondre à "upload.single('fichier')" de ton backend !
  formData.append('fichier', fichierSelectionne.value); 

  try {
    // On envoie la requête HTTP à ton backend (qui doit être allumé sur le port 3000 !)
    const response = await fetch('http://localhost:3000/api/documents', {
      method: 'POST',
      body: formData // On n'a pas besoin de préciser le "Content-Type", FormData gère ça tout seul.
    });

    const data = await response.json();

    // Si le backend répond avec un statut 200 ou 201 (Succès)
    if (response.ok) {
      isSuccess.value = true;
      message.value = "🎉 Document publié avec succès dans la base de données !";
      setTimeout(() => reinitialiser(), 3000); // On vide le formulaire au bout de 3 secondes
    } else {
      isSuccess.value = false;
      message.value = "Erreur du serveur : " + (data.message || "Une erreur est survenue");
    }
  } catch (error) {
    console.error("Erreur de connexion:", error);
    isSuccess.value = false;
    message.value = "❌ Impossible de contacter le serveur. Le Backend (port 3000) est-il allumé ?";
  } finally {
    isLoading.value = false;
  }
};
</script>