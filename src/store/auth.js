import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    favoriteStores: []
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    getFavoriteStores: (state) => state.favoriteStores
  },

  actions: {
    async login(email, password) {
      try {
        const response = await api.login(email, password)

        this.user = response.user
        this.isAuthenticated = true

        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('isAuthenticated', 'true')

        await this.loadFavorites()

        return true
      } catch (error) {
        console.error('ログインに失敗しました:', error)
        return false
      }
    },

    async logout() {
      try {
        await api.logout()
      } catch (error) {
        console.error('ログアウトに失敗しました:', error)
      } finally {
        this.user = null
        this.isAuthenticated = false
        this.favoriteStores = []

        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')
      }
    },

    checkAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      const isAuthenticated = localStorage.getItem('isAuthenticated')

      if (token && user && isAuthenticated === 'true') {
        this.user = JSON.parse(user)
        this.isAuthenticated = true
        this.loadFavorites()
      }
    },

    async addFavorite(storeId, notificationEnabled = false) {
      try {
        await api.addFavoriteStore(storeId, notificationEnabled)
        if (!this.favoriteStores.includes(storeId)) {
          this.favoriteStores.push(storeId)
        }
      } catch (error) {
        console.error('お気に入りの追加に失敗しました:', error)
        throw error
      }
    },

    async removeFavorite(storeId) {
      try {
        await api.removeFavoriteStore(storeId)
        const index = this.favoriteStores.indexOf(storeId)
        if (index > -1) {
          this.favoriteStores.splice(index, 1)
        }
      } catch (error) {
        console.error('お気に入りの削除に失敗しました:', error)
        throw error
      }
    },

    async toggleFavorite(storeId) {
      if (this.isFavorite(storeId)) {
        await this.removeFavorite(storeId)
      } else {
        await this.addFavorite(storeId)
      }
    },

    isFavorite(storeId) {
      return this.favoriteStores.includes(storeId)
    },

    async loadFavorites() {
      try {
        const response = await api.getFavoriteStores()
        this.favoriteStores = response.items.map(store => store.storeId)
      } catch (error) {
        console.error('お気に入り店舗の取得に失敗しました:', error)
        this.favoriteStores = []
      }
    }
  }
})
