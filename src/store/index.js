import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    products: [],
    favoriteProducts: [],
    notificationSettings: {
      categories: [],
      frequency: 'realtime',
      priceChangeThreshold: 5
    }
  }),
  getters: {
    getFavorites: (state) => state.favoriteProducts,
    getProductById: (state) => (id) => {
      return state.products.find(product => product.id === id)
    }
  },
  actions: {
    addFavorite(productId) {
      if (!this.favoriteProducts.includes(productId)) {
        this.favoriteProducts.push(productId)
      }
    },
    removeFavorite(productId) {
      this.favoriteProducts = this.favoriteProducts.filter(id => id !== productId)
    },
    updateNotificationSettings(settings) {
      this.notificationSettings = { ...this.notificationSettings, ...settings }
    },
    setProducts(products) {
      this.products = products
    }
  }
})