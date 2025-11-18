<template>
  <div class="account-management">
    <!-- パンくずリスト -->
    <nav class="breadcrumb">
      <router-link to="/admin" class="breadcrumb-item">管理者トップ</router-link>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item active">アカウント管理</span>
    </nav>

    <div class="page-header">
      <h1 class="page-title">アカウント管理</h1>
      <p class="page-description">アカウントの追加・編集・削除を行います</p>
    </div>

    <div class="content-placeholder">
      <div class="placeholder-icon">👥</div>
      <h2 class="placeholder-title">アカウント管理機能</h2>
      <p class="placeholder-description">
        この機能は現在準備中です。<br>
        アカウント情報の管理機能が実装される予定です。
      </p>
    </div>
  </div>
</template>

<script>
import { useAdminStore } from '@/store/admin'

export default {
  name: 'AccountManagement',
  setup() {
    const adminStore = useAdminStore()
    return { adminStore }
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
.account-management {
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
  text-decoration: none;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.breadcrumb-item:hover:not(.active) {
  color: var(--primary-color);
}

.breadcrumb-item.active {
  color: var(--text-primary);
  font-weight: 600;
}

.breadcrumb-separator {
  color: var(--text-secondary);
}

/* ページヘッダー */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 40px;
  color: white;
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.page-description {
  font-size: 16px;
  opacity: 0.95;
}

/* プレースホルダー */
.content-placeholder {
  background-color: white;
  border-radius: 12px;
  padding: 80px 40px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.placeholder-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.placeholder-title {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.placeholder-description {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.8;
}

@media (max-width: 768px) {
  .account-management {
    padding: 16px;
  }

  .page-header {
    padding: 24px;
  }

  .page-title {
    font-size: 24px;
  }

  .content-placeholder {
    padding: 60px 20px;
  }

  .placeholder-icon {
    font-size: 60px;
  }

  .placeholder-title {
    font-size: 22px;
  }
}
</style>
