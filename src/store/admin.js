import { defineStore } from 'pinia'

// ユーザー役割の定義
export const USER_ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  COMPANY_ADMIN: 'company_admin',
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
    // 企業管理者かどうか
    isCompanyAdmin: (state) => state.adminUser?.role === USER_ROLES.COMPANY_ADMIN,
    // 店舗ユーザーかどうか
    isStoreUser: (state) => state.adminUser?.role === USER_ROLES.STORE_USER,
    // ユーザーの役割
    userRole: (state) => state.adminUser?.role,
    // ユーザーの所属企業ID
    userCompanyId: (state) => state.adminUser?.companyId,
    // ユーザーの所属店舗ID
    userStoreId: (state) => state.adminUser?.storeId
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
          role: USER_ROLES.SYSTEM_ADMIN,
          companyId: null,
          storeId: null
        }
        localStorage.setItem('adminAuth', 'true')
        localStorage.setItem('adminUser', JSON.stringify(this.adminUser))
        return true
      }
      // 企業管理者
      if (id === 'company' && password === 'password') {
        this.isAuthenticated = true
        this.adminUser = {
          id: id,
          name: '企業管理者',
          role: USER_ROLES.COMPANY_ADMIN,
          companyId: 'COMP001',
          storeId: null
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
          role: USER_ROLES.STORE_USER,
          companyId: 'COMP001',
          storeId: 'STORE001'
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
