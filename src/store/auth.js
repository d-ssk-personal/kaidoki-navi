import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    favoriteStores: [] // お気に入り店舗のIDリスト
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
    getFavoriteStores: (state) => state.favoriteStores
  },

  actions: {
    login(email, password) {
      // TODO: 実際のAPI呼び出しに置き換える
      // ダミー認証
      if (email && password) {
        this.user = {
          id: 1,
          email: email,
          name: 'ユーザー'
        }
        this.isAuthenticated = true

        // ローカルストレージに保存
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('isAuthenticated', 'true')

        // お気に入りをロード
        this.loadFavorites()

        return true
      }
      return false
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      this.favoriteStores = []

      // ローカルストレージから削除
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('favoriteStores')
    },

    checkAuth() {
      // ページ読み込み時に認証状態を確認
      const user = localStorage.getItem('user')
      const isAuthenticated = localStorage.getItem('isAuthenticated')

      if (user && isAuthenticated === 'true') {
        this.user = JSON.parse(user)
        this.isAuthenticated = true
        this.loadFavorites()
      }
    },

    addFavorite(storeId) {
      if (!this.favoriteStores.includes(storeId)) {
        this.favoriteStores.push(storeId)
        this.saveFavorites()
      }
    },

    removeFavorite(storeId) {
      const index = this.favoriteStores.indexOf(storeId)
      if (index > -1) {
        this.favoriteStores.splice(index, 1)
        this.saveFavorites()
      }
    },

    toggleFavorite(storeId) {
      if (this.isFavorite(storeId)) {
        this.removeFavorite(storeId)
      } else {
        this.addFavorite(storeId)
      }
    },

    isFavorite(storeId) {
      return this.favoriteStores.includes(storeId)
    },

    saveFavorites() {
      // TODO: 実際のAPI呼び出しに置き換える
      localStorage.setItem('favoriteStores', JSON.stringify(this.favoriteStores))
    },

    loadFavorites() {
      // TODO: 実際のAPI呼び出しに置き換える
      const favorites = localStorage.getItem('favoriteStores')
      if (favorites) {
        this.favoriteStores = JSON.parse(favorites)
      }
    }
  }
})
