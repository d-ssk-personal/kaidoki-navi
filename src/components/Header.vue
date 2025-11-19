<template>
  <header class="header">
    <div class="header-content">
      <div class="logo-section">
        <router-link to="/top" class="logo">
          <span class="logo-icon">💰</span>
          <span class="logo-text">チラシ キッチン</span>
        </router-link>
        <button class="about-btn" @click="showAboutModal = true">
          ❓ チラシ キッチンとは?
        </button>
      </div>

      <nav class="nav">
        <router-link to="/top" class="nav-link">ホーム</router-link>
        <router-link to="/settings" class="nav-link">通知設定</router-link>
        <router-link to="/legal" class="nav-link">利用規約</router-link>
        <router-link to="/for-business" class="nav-link business-link">法人のお客様へ</router-link>
      </nav>

      <div class="auth-section">
        <template v-if="!authStore.isLoggedIn">
          <router-link to="/login" class="auth-btn login-btn">ログイン</router-link>
        </template>
        <template v-else>
          <router-link to="/mypage" class="auth-btn mypage-btn">マイページ</router-link>
          <button class="auth-btn logout-btn" @click="handleLogout">ログアウト</button>
        </template>
      </div>

      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <span class="menu-icon">☰</span>
      </button>
    </div>

    <div v-if="showMobileMenu" class="mobile-menu">
      <router-link to="/top" class="mobile-nav-link" @click="closeMobileMenu">ホーム</router-link>
      <router-link to="/settings" class="mobile-nav-link" @click="closeMobileMenu">通知設定</router-link>
      <router-link to="/legal" class="mobile-nav-link" @click="closeMobileMenu">利用規約</router-link>
      <router-link to="/for-business" class="mobile-nav-link" @click="closeMobileMenu">法人のお客様へ</router-link>
      <div class="mobile-menu-divider"></div>
      <template v-if="!authStore.isLoggedIn">
        <router-link to="/login" class="mobile-nav-link" @click="closeMobileMenu">ログイン</router-link>
      </template>
      <template v-else>
        <router-link to="/mypage" class="mobile-nav-link" @click="closeMobileMenu">マイページ</router-link>
        <button class="mobile-nav-link logout-link" @click="handleLogout">ログアウト</button>
      </template>
    </div>

    <!-- 買いどきナビとは?モーダル -->
    <div v-if="showAboutModal" class="modal-overlay" @click="showAboutModal = false">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="showAboutModal = false">✕</button>

        <h2 class="modal-title">チラシ キッチンとは?</h2>

        <div class="modal-body">
          <div class="modal-hero">
            <p class="modal-description">
              チラシから献立を提案<br>
              毎日のお買い物をもっと楽しく
            </p>
            <p class="modal-subdescription">
              提携スーパーのチラシを検索して、お得な食材から<br>
              AIが自動でレシピを提案。生活に役立つコラムも毎日配信
            </p>
          </div>

          <h3 class="modal-section-title">3つの特徴</h3>

          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">📰</div>
              <div class="feature-content">
                <h4 class="feature-title">チラシ検索</h4>
                <p class="feature-description">
                  提携スーパーのチラシを一括検索。お気に入りの店舗を登録して、新しいチラシをすぐチェック。
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">🍳</div>
              <div class="feature-content">
                <h4 class="feature-title">AIレシピ提案</h4>
                <p class="feature-description">
                  チラシのお得な食材から、AIが自動で料理レシピを提案。献立に悩む時間を削減できます。
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">📝</div>
              <div class="feature-content">
                <h4 class="feature-title">生活コラム配信</h4>
                <p class="feature-description">
                  物価や家計など、生活に役立つコラムを毎日配信。賢い買い物をサポートします。
                </p>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-primary" @click="showAboutModal = false">
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { useAuthStore } from '@/store/auth'

export default {
  name: 'Header',
  data() {
    return {
      showMobileMenu: false,
      showAboutModal: false,
      authStore: useAuthStore()
    }
  },
  methods: {
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu
    },
    closeMobileMenu() {
      this.showMobileMenu = false
    },
    handleLogout() {
      this.authStore.logout()
      this.$router.push('/top')
    }
  }
}
</script>

<style scoped>
.header {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: none;
}

.logo-icon {
  font-size: 28px;
}

.about-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: transparent;
  border: 2px solid var(--primary-color);
  border-radius: 20px;
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.about-btn:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.nav {
  display: flex;
  gap: 24px;
}

.nav-link {
  color: var(--text-primary);
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: var(--bg-light);
  color: var(--primary-color);
  text-decoration: none;
}

.business-link {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white !important;
  font-weight: 600;
}

.business-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

/* 認証セクション */
.auth-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.auth-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.login-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.login-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.mypage-btn {
  background-color: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.mypage-btn:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.logout-btn {
  background-color: white;
  color: var(--text-secondary);
  border: 2px solid var(--border-color);
}

.logout-btn:hover {
  border-color: var(--danger-color);
  color: var(--danger-color);
  transform: translateY(-2px);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-primary);
}

.mobile-menu {
  display: none;
  flex-direction: column;
  padding: 16px 20px;
  background-color: var(--bg-light);
}

.mobile-nav-link {
  padding: 12px 16px;
  color: var(--text-primary);
  font-weight: 500;
  border-radius: 8px;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background-color: white;
  color: var(--primary-color);
  text-decoration: none;
}

.mobile-menu-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 8px 0;
}

.logout-link {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  font-size: 16px;
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 28px;
  color: var(--text-secondary);
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background-color: var(--bg-light);
  color: var(--text-primary);
}

.modal-title {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  padding: 32px 32px 16px;
  color: var(--text-primary);
}

.modal-body {
  padding: 0 32px 32px;
}

.modal-hero {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 32px;
}

.modal-description {
  font-size: 24px;
  font-weight: bold;
  line-height: 1.4;
  margin-bottom: 16px;
}

.modal-subdescription {
  font-size: 16px;
  opacity: 0.95;
  line-height: 1.6;
}

.modal-section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
  color: var(--text-primary);
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.feature-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background-color: var(--bg-light);
  border-radius: 12px;
}

.feature-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.feature-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.modal-actions {
  text-align: center;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }

  .auth-section {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .mobile-menu {
    display: flex;
  }

  .about-btn {
    font-size: 12px;
    padding: 6px 12px;
  }

  .logo-text {
    font-size: 20px;
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-title {
    font-size: 24px;
    padding: 24px 16px 12px;
  }

  .modal-body {
    padding: 0 16px 24px;
  }

  .modal-description {
    font-size: 20px;
  }

  .modal-subdescription {
    font-size: 14px;
  }
}
</style>