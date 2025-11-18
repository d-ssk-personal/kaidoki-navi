<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <h1 class="dashboard-title">管理画面</h1>
      <div class="header-actions">
        <span class="admin-name">{{ adminStore.adminUser?.name }}さん</span>
        <button @click="handleLogout" class="logout-button">
          ログアウト
        </button>
      </div>
    </div>

    <div class="dashboard-content">
      <h2 class="section-title">メニュー</h2>
      <div class="menu-grid">
        <!-- コラム管理 - システム管理者のみ -->
        <router-link
          v-if="adminStore.isSystemAdmin"
          to="/admin/articles"
          class="menu-card"
        >
          <div class="menu-icon">📝</div>
          <h3 class="menu-title">コラム管理</h3>
          <p class="menu-description">
            記事の作成・編集・削除を行います
          </p>
        </router-link>

        <!-- 店舗管理 - システム管理者のみ -->
        <router-link
          v-if="adminStore.isSystemAdmin"
          to="/admin/stores"
          class="menu-card"
        >
          <div class="menu-icon">🏪</div>
          <h3 class="menu-title">店舗管理</h3>
          <p class="menu-description">
            店舗情報の管理を行います
          </p>
        </router-link>

        <!-- チラシ管理 - システム管理者と店舗ユーザー -->
        <router-link
          to="/admin/flyers"
          class="menu-card"
        >
          <div class="menu-icon">📰</div>
          <h3 class="menu-title">チラシ管理</h3>
          <p class="menu-description">
            チラシ情報の管理を行います
          </p>
        </router-link>

        <!-- アカウント管理 - システム管理者と店舗ユーザー -->
        <router-link
          to="/admin/accounts"
          class="menu-card"
        >
          <div class="menu-icon">👥</div>
          <h3 class="menu-title">アカウント管理</h3>
          <p class="menu-description">
            アカウント情報の管理を行います
          </p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useAdminStore } from '@/store/admin'

export default {
  name: 'AdminDashboard',
  setup() {
    const adminStore = useAdminStore()
    return { adminStore }
  },
  methods: {
    handleLogout() {
      if (confirm('ログアウトしますか？')) {
        this.adminStore.logout()
        this.$router.push('/admin/login')
      }
    }
  },
  mounted() {
    // 認証チェック
    this.adminStore.checkAuth()
    if (!this.adminStore.isAuthenticated) {
      this.$router.push('/admin/login')
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: var(--bg-light);
}

.admin-header {
  background-color: white;
  padding: 24px 32px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.dashboard-title {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-name {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}

.logout-button {
  padding: 10px 20px;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 32px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 32px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.menu-card {
  background-color: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.menu-card:not(.disabled):hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
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
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.menu-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .admin-header {
    padding: 16px 20px;
  }

  .dashboard-title {
    font-size: 22px;
  }

  .dashboard-content {
    padding: 24px 20px;
  }

  .section-title {
    font-size: 20px;
  }

  .menu-grid {
    grid-template-columns: 1fr;
  }
}
</style>
