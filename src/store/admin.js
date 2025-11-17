import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    isAuthenticated: false,
    adminUser: null
  }),

  actions: {
    login(id, password) {
      // 簡易的な認証（実際はバックエンドAPIを使用）
      if (id === 'admin' && password === 'password') {
        this.isAuthenticated = true
        this.adminUser = {
          id: id,
          name: '管理者'
        }
        localStorage.setItem('adminAuth', 'true')
        return true
      }
      return false
    },

    logout() {
      this.isAuthenticated = false
      this.adminUser = null
      localStorage.removeItem('adminAuth')
    },

    checkAuth() {
      const auth = localStorage.getItem('adminAuth')
      if (auth === 'true') {
        this.isAuthenticated = true
        this.adminUser = {
          id: 'admin',
          name: '管理者'
        }
      }
    }
  }
})
