<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">管理者ログイン</h1>
        <p class="login-subtitle">チラシ キッチン 管理画面</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="adminId" class="form-label">管理者ID</label>
          <input
            id="adminId"
            v-model="adminId"
            type="text"
            class="form-input"
            placeholder="IDを入力してください"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">パスワード</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="パスワードを入力してください"
            required
            autocomplete="current-password"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? 'ログイン中...' : 'ログイン' }}
        </button>
      </form>

      <div class="login-footer">
        <router-link to="/top" class="back-link">
          ← トップページに戻る
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useAdminStore } from '@/store/admin'

export default {
  name: 'AdminLogin',
  data() {
    return {
      adminId: '',
      password: '',
      errorMessage: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.errorMessage = ''
      this.loading = true

      try {
        const adminStore = useAdminStore()
        const success = adminStore.login(this.adminId, this.password)

        if (success) {
          this.$router.push('/admin')
        } else {
          this.errorMessage = 'IDまたはパスワードが正しくありません'
        }
      } catch (error) {
        this.errorMessage = 'ログインに失敗しました。もう一度お試しください。'
        console.error('Login error:', error)
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    // 既にログイン済みの場合は管理画面へリダイレクト
    const adminStore = useAdminStore()
    adminStore.checkAuth()
    if (adminStore.isAuthenticated) {
      this.$router.push('/admin')
    }
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 48px 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 32px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 16px;
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
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  padding: 12px 16px;
  background-color: #fee;
  border: 1px solid var(--danger-color);
  border-radius: 8px;
  color: var(--danger-color);
  font-size: 14px;
  text-align: center;
}

.login-button {
  padding: 16px;
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
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
}

.back-link {
  color: var(--primary-color);
  font-size: 14px;
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.back-link:hover {
  opacity: 0.7;
}

@media (max-width: 768px) {
  .login-container {
    padding: 32px 24px;
  }

  .login-title {
    font-size: 24px;
  }

  .login-subtitle {
    font-size: 14px;
  }
}
</style>
