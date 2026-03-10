<template>
  <div class="login-container">
    <!-- Partie gauche : formulaire de connexion -->
    <div class="login-left">
      <div class="login-header">
        <div class="logo">
                <div class="logo-icon">C</div>
                <span class="logo-text">CoreFlow</span>
            </div>

            <h1>Bienvenue 👋</h1>
            <p class="subtitle">Connectez-vous pour accéder à votre espace de travail</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="email">Adresse email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="votre.email@coreflow.fr"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>
      <div class="dev-info">
        <p><strong>👨‍💻 Comptes de développement :</strong></p>
        <ul>
          <li>Admin : admin@coreflow.fr / @dmiN1234</li>
          <li>RH : rh@coreflow.fr / Rh_1234</li>
          <li>Manager : manager@coreflow.fr / Manager_1234</li>
          <li>Employé : employe@coreflow.fr / Employe_1234</li>
        </ul>
      </div>
    </div>

    <!-- Partie droite : branding / décoratif -->
    <div class="login-right">
      <div class="right-content">
        <h2>Gérez votre équipe efficacement</h2>
        <p>
          CoreFlow centralise tous vos besoins 
          RH : congés, tickets, événements et bien plus encore.
        </p>

        <br>

        <div class="feature-list">
            <div class="feature-item">
                <div class="feature-icon">✓</div>
                    <span>Gestion des congés simplifiée</span>
                </div>
        <div class="feature-item">
            <div class="feature-icon">✓</div>
                <span>Suivi des tickets en temps réel</span>
                </div>
        <div class="feature-item">
            <div class="feature-icon">✓</div>
                <span>Organisation d'événements</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      loading: false,
      error: null
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });

        const data = await response.json();

        if (!data.success) {
          this.error = data.message;
          return;
        }

        // Stocker le token et les infos utilisateur
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Rediriger vers le dashboard
        this.$router.push('/dashboard');

      } catch (error) {
        console.error('Erreur de connexion:', error);
        this.error = 'Erreur de connexion au serveur';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Mulish', sans-serif;
        background: linear-gradient(135deg, #F0FDFA 0%, #E0F2FE 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }

    .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 40px;
        }

        .logo-icon {
            width: 40px;
            height: 40px;
            background: #0D9488;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            font-size: 20px;
        }

        .logo-text {
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            font-size: 24px;
            color: #111827;
        }

    .login-container {
        display: flex;
        max-width: 1000px;
        width: 100%;
        background: #FFFFFF;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .login-left {
        flex: 1;
        padding: 60px 50px;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

.login-right {
        flex: 1;
        background: linear-gradient(135deg, #0D9488 0%, #14B8A6 100%);
        padding: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        position: relative;
        overflow: hidden;
        }

    .login-right::before {
        content: '';
        position: absolute;
        width: 300px;
        height: 300px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        top: -100px;
        right: -100px;
        }

    .login-right::after {
        content: '';
        position: absolute;
        width: 200px;
        height: 200px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        bottom: -50px;
        left: -50px;
    }

    .right-content {
            position: relative;
            z-index: 1;
            text-align: center;
        }

    .right-content h2 {
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
        font-size: 36px;
        margin-bottom: 20px;
        }

    .right-content p {
        font-size: 16px;
        line-height: 1.6;
        opacity: 0.95;
        max-width: 350px;
        }

    .feature-list {
        margin-top: 40px;
        text-align: left;
        }

    .feature-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        }
    
    .feature-icon {
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        }

    h1 {
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
        font-size: 32px;
        color: #111827;
        margin-bottom: 8px;
    }

    .subtitle {
        color: #64748B;
        margin-bottom: 30px;
        font-size: 15px;
    }

    .form-group {
        margin-bottom: 20px;
    }

    label {
        display: block;
        margin-bottom: 8px;
        color: #111827;
        font-weight: 500;
        font-size: 14px;
    }

    input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-family: 'Mulish', sans-serif;
        font-size: 14px;
        transition: all 0.3s ease;
        background: #FFFFFF;
    }

    input:focus {
        outline: none;
        border-color: #667eea;
        background: #F0FDFA;
    }

    .password-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .password-input-wrapper input {
        padding-right: 45px;
    }

    .toggle-password {
        position: absolute;
        right: 12px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .toggle-password:hover {
        opacity: 0.7;
    }

    .error-message {
        background: #fee;
        color: #c33;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 20px;
        font-size: 14px;
    }

    .btn-login {
        width: 100%;
        padding: 14px;
        background: #0D9488;
        color: white;
        border: none;
        border-radius: 8px;
        font-family: 'Mulish', sans-serif;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(13, 148, 136, 0.2);
    }

    .btn-login:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
    }

    .btn-login:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .dev-info {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 6px;
        font-size: 13px;
    }

    .dev-info p {
        margin: 0 0 10px 0;
        color: #333;
    }

    .dev-info ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .dev-info li {
        padding: 6px 0;
        color: #666;
        font-family: 'Courier New', monospace;
    }

    @media (max-width: 768px) {
        .login-container {
            flex-direction: column;
        }

        .login-left,
        .login-right {
            padding: 40px 30px;
        }
    }
</style>
