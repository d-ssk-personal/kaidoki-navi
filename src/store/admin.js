import { defineStore } from 'pinia'
import api from '@/services/api'

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
    isSystemAdmin: (state) => state.adminUser?.role === USER_ROLES.SYSTEM_ADMIN,
    isCompanyAdmin: (state) => state.adminUser?.role === USER_ROLES.COMPANY_ADMIN,
    isStoreUser: (state) => state.adminUser?.role === USER_ROLES.STORE_USER,
    userRole: (state) => state.adminUser?.role,
    userCompanyId: (state) => state.adminUser?.companyId,
    userStoreId: (state) => state.adminUser?.storeId
  },

  actions: {
    async login(username, password) {
      try {
        const response = await api.admin.login(username, password)

        this.isAuthenticated = true
        this.adminUser = response.admin

        localStorage.setItem('token', response.token)
        localStorage.setItem('adminAuth', 'true')
        localStorage.setItem('adminUser', JSON.stringify(response.admin))

        return true
      } catch (error) {
        console.error('管理者ログインに失敗しました:', error)
        return false
      }
    },

    logout() {
      this.isAuthenticated = false
      this.adminUser = null

      localStorage.removeItem('token')
      localStorage.removeItem('adminAuth')
      localStorage.removeItem('adminUser')
    },

    checkAuth() {
      const token = localStorage.getItem('token')
      const auth = localStorage.getItem('adminAuth')
      const userJson = localStorage.getItem('adminUser')

      if (token && auth === 'true' && userJson) {
        try {
          this.adminUser = JSON.parse(userJson)
          this.isAuthenticated = true
        } catch (e) {
          console.error('管理者認証情報のパースに失敗しました:', e)
          this.logout()
        }
      }
    }
  }
})
