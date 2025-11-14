<template>
  <header class="header">
    <div class="header-content">
      <router-link to="/top" class="logo">
        <span class="logo-icon">💰</span>
        <span class="logo-text">買い時ナビ</span>
      </router-link>
      
      <nav class="nav">
        <router-link to="/top" class="nav-link">ホーム</router-link>
        <router-link to="/settings" class="nav-link">通知設定</router-link>
        <router-link to="/legal" class="nav-link">利用規約</router-link>
      </nav>
      
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <span class="menu-icon">☰</span>
      </button>
    </div>
    
    <div v-if="showMobileMenu" class="mobile-menu">
      <router-link to="/top" class="mobile-nav-link" @click="closeMobileMenu">ホーム</router-link>
      <router-link to="/settings" class="mobile-nav-link" @click="closeMobileMenu">通知設定</router-link>
      <router-link to="/legal" class="mobile-nav-link" @click="closeMobileMenu">利用規約</router-link>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      showMobileMenu: false
    }
  },
  methods: {
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu
    },
    closeMobileMenu() {
      this.showMobileMenu = false
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

@media (max-width: 768px) {
  .nav {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu {
    display: flex;
  }
}
</style>