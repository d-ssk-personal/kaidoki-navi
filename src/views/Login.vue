<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <span class="logo-icon">💰</span>
            <span class="logo-text">買いどきナビ</span>
          </div>
          <h1 class="login-title">ログイン</h1>
          <p class="login-subtitle">アカウントにログインしてください</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">メールアドレス</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="example@email.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">パスワード</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="パスワードを入力"
              required
              autocomplete="current-password"
            />
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button type="submit" class="login-button" :disabled="isLoading">
            {{ isLoading ? 'ログイン中...' : 'ログイン' }}
          </button>
        </form>

        <div class="login-footer">
          <p class="footer-text">
            アカウントをお持ちでない方は、<br>
            デモ用のメールアドレスとパスワードを入力してください
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/store/auth'

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      isLoading: false
    }
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  methods: {
    async handleLogin() {
      this.errorMessage = ''
      this.isLoading = true

      try {
        const success = this.authStore.login(this.email, this.password)

        if (success) {
          // ログイン成功: トップページに遷移
          this.$router.push('/top')
        } else {
          // ログイン失敗
          this.errorMessage = 'メールアドレスまたはパスワードが正しくありません'
        }
      } catch (error) {
        this.errorMessage = 'ログイン中にエラーが発生しました'
        console.error('Login error:', error)
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 70px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.login-container {
  width: 100%;
  max-width: 460px;
}

.login-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 48px 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 28px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 24px;
}

.logo-icon {
  font-size: 32px;
}

.login-title {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input {
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

.error-message {
  padding: 12px 16px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
  text-align: center;
}

.login-button {
  padding: 14px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.login-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.footer-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .login-page {
    padding: 20px;
  }

  .login-card {
    padding: 32px 24px;
  }

  .login-title {
    font-size: 24px;
  }

  .logo {
    font-size: 24px;
  }

  .logo-icon {
    font-size: 28px;
  }
}
</style>
