<template>
  <div class="admin-home">
    <!-- パンくずリスト -->
    <nav class="breadcrumb">
      <span class="breadcrumb-item active">管理者トップ</span>
    </nav>

    <div class="admin-header">
      <h1 class="admin-title">管理者ダッシュボード</h1>
      <p class="admin-subtitle">買いどきナビ管理画面</p>
      <button class="logout-button" @click="handleLogout">
        ログアウト
      </button>
    </div>

    <div class="menu-grid">
      <router-link to="/admin/articles" class="menu-card">
        <div class="menu-icon">📝</div>
        <h2 class="menu-title">コラム管理</h2>
        <p class="menu-description">
          家計・物価コラムの作成・編集・削除
        </p>
      </router-link>

      <!-- 将来的な拡張用 -->
      <div class="menu-card disabled">
        <div class="menu-icon">📊</div>
        <h2 class="menu-title">商品管理</h2>
        <p class="menu-description">
          商品情報の管理（準備中）
        </p>
      </div>

      <div class="menu-card disabled">
        <div class="menu-icon">👥</div>
        <h2 class="menu-title">ユーザー管理</h2>
        <p class="menu-description">
          ユーザー情報の管理（準備中）
        </p>
      </div>

      <div class="menu-card disabled">
        <div class="menu-icon">⚙️</div>
        <h2 class="menu-title">設定</h2>
        <p class="menu-description">
          システム設定（準備中）
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminHome',
  mounted() {
    // ログインチェック
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn')
    if (!isLoggedIn) {
      this.$router.push('/admin/login')
    }
  },
  methods: {
    handleLogout() {
      localStorage.removeItem('isAdminLoggedIn')
      localStorage.removeItem('adminUsername')
      this.$router.push('/admin/login')
    }
  }
}
</script>

<style scoped>
.admin-home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* パンくずリスト */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  color: var(--text-secondary);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-item.active {
  color: var(--text-primary);
  font-weight: 600;
}

.admin-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 48px 40px;
  color: white;
  margin-bottom: 40px;
  text-align: center;
}

.admin-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
}

.admin-subtitle {
  font-size: 18px;
  opacity: 0.95;
}

.logout-button {
  position: absolute;
  top: 24px;
  right: 24px;
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background-color: white;
  color: var(--primary-color);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.menu-card {
  background-color: white;
  border-radius: 12px;
  padding: 32px 24px;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.menu-card:not(.disabled):hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.menu-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.menu-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.menu-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .admin-home {
    padding: 16px;
  }

  .admin-header {
    padding: 32px 24px;
  }

  .admin-title {
    font-size: 28px;
  }

  .admin-subtitle {
    font-size: 16px;
  }

  .logout-button {
    position: static;
    margin-top: 20px;
    width: 100%;
  }

  .menu-grid {
    grid-template-columns: 1fr;
  }
}
</style>
