<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">管理者ログイン</h1>
          <p class="login-subtitle">買いどきナビ 管理画面</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username" class="form-label">ユーザーID</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input"
              placeholder="ユーザーIDを入力"
              required
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
            />
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button type="submit" class="login-button" :disabled="loading">
            {{ loading ? 'ログイン中...' : 'ログイン' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLogin',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.errorMessage = ''

      try {
        // TODO: 本番環境では実際のAPI認証に置き換える
        // 開発環境用の簡易認証
        if (this.username === 'admin' && this.password === 'password') {
          // ログイン成功
          localStorage.setItem('isAdminLoggedIn', 'true')
          localStorage.setItem('adminUsername', this.username)
          this.$router.push('/admin')
        } else {
          this.errorMessage = 'ユーザーIDまたはパスワードが正しくありません'
        }
      } catch (error) {
        console.error('ログインエラー:', error)
        this.errorMessage = 'ログインに失敗しました。もう一度お試しください。'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
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
}

.login-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 32px;
  text-align: center;
  color: white;
}

.login-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.login-form {
  padding: 40px 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  background-color: #fee2e2;
  color: var(--danger-color);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  padding: 14px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .login-header {
    padding: 32px 24px;
  }

  .login-title {
    font-size: 24px;
  }

  .login-form {
    padding: 32px 24px;
  }
}
</style>
