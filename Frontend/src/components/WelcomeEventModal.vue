<template>
  <transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>🎉 Bienvenue à l'événement !</h2>
        </div>
        
        <div class="modal-body">
          <div class="welcome-icon">🎊</div>
          <h3>{{ eventName }}</h3>
          <p>Nous sommes heureux de vous accueillir !</p>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-close">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'WelcomeEventModal',
  props: {
    show: { type: Boolean, default: false },
    eventName: { type: String, default: 'l\'événement' }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        // Auto-close après 3 secondes
        setTimeout(() => {
          this.closeModal();
        }, 3000);
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.modal-header {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  padding: 24px;
  text-align: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.modal-body {
  padding: 32px 24px;
  text-align: center;
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: bounce 0.6s ease;
}

.modal-body h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #111827;
}

.modal-body p {
  margin: 8px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
}

.btn-close {
  padding: 8px 24px;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.btn-close:hover {
  background: #0d9488;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
