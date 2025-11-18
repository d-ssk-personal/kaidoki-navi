import { defineStore } from 'pinia'

// ユーザー役割の定義
export const USER_ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  STORE_USER: 'store_user'
}

export const useAdminStore = defineStore('admin', {
  state: () => ({
    isAuthenticated: false,
    adminUser: null
  }),

  getters: {
    // システム管理者かどうか
    isSystemAdmin: (state) => state.adminUser?.role === USER_ROLES.SYSTEM_ADMIN,
    // 店舗ユーザーかどうか
    isStoreUser: (state) => state.adminUser?.role === USER_ROLES.STORE_USER,
    // ユーザーの役割
    userRole: (state) => state.adminUser?.role
  },

  actions: {
    login(id, password) {
      // 簡易的な認証（実際はバックエンドAPIを使用）
      // システム管理者
      if (id === 'admin' && password === 'password') {
        this.isAuthenticated = true
        this.adminUser = {
          id: id,
          name: 'システム管理者',
          role: USER_ROLES.SYSTEM_ADMIN
        }
        localStorage.setItem('adminAuth', 'true')
        localStorage.setItem('adminUser', JSON.stringify(this.adminUser))
        return true
      }
      // 店舗ユーザー
      if (id === 'store' && password === 'password') {
        this.isAuthenticated = true
        this.adminUser = {
          id: id,
          name: '店舗ユーザー',
          role: USER_ROLES.STORE_USER
        }
        localStorage.setItem('adminAuth', 'true')
        localStorage.setItem('adminUser', JSON.stringify(this.adminUser))
        return true
      }
      return false
    },

    logout() {
      this.isAuthenticated = false
      this.adminUser = null
      localStorage.removeItem('adminAuth')
      localStorage.removeItem('adminUser')
    },

    checkAuth() {
      const auth = localStorage.getItem('adminAuth')
      if (auth === 'true') {
        const userJson = localStorage.getItem('adminUser')
        if (userJson) {
          try {
            this.adminUser = JSON.parse(userJson)
            this.isAuthenticated = true
          } catch (e) {
            // パースエラーの場合はログアウト
            this.logout()
          }
        } else {
          // 旧バージョンの互換性のため
          this.isAuthenticated = true
          this.adminUser = {
            id: 'admin',
            name: 'システム管理者',
            role: USER_ROLES.SYSTEM_ADMIN
          }
        }
      }
    }
  }
})
