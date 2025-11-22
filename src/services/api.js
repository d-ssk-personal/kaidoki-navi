import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
const ADMIN_API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL || 'http://localhost:3000/api/v1/admin'

// ユーザー側APIクライアント
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 管理者側APIクライアント
const adminApi = axios.create({
  baseURL: ADMIN_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// リクエストインターセプター（認証トークンを自動追加）
const addAuthInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )
}

// レスポンスインターセプター（エラーハンドリング）
const addResponseInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )
}

addAuthInterceptor(api)
addAuthInterceptor(adminApi)
addResponseInterceptor(api)
addResponseInterceptor(adminApi)

// ==================== ユーザー側API ====================

export default {
  // ==================== 認証 ====================
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  },

  async register(email, password, name) {
    const response = await api.post('/auth/register', { email, password, name })
    return response.data
  },

  // ==================== チラシ ====================
  async getFlyers(params = {}) {
    const response = await api.get('/flyers/list', { params })
    return response.data
  },

  async getFlyerById(flyerId) {
    const response = await api.get(`/flyers/list/${flyerId}`)
    return response.data
  },

  async generateRecipe(flyerId) {
    const response = await api.post(`/flyers/recipe/${flyerId}`)
    return response.data
  },

  async shareRecipe(flyerId, userId = null) {
    const response = await api.post('/flyers/recipe/share', { flyerId, userId })
    return response.data
  },

  async getRecommendedFlyers(limit = 10) {
    const response = await api.get('/flyers/recommended', { params: { limit } })
    return response.data
  },

  // ==================== コラム ====================
  async getArticles(params = {}) {
    const response = await api.get('/articles/list', { params })
    return response.data
  },

  async getArticleById(articleId) {
    const response = await api.get(`/articles/list/${articleId}`)
    return response.data
  },

  async getLatestArticles(limit = 10) {
    const response = await api.get('/articles/latest', { params: { limit } })
    return response.data
  },

  // ==================== マイページ ====================
  async getCurrentUser() {
    const response = await api.get('/users/me')
    return response.data
  },

  async updateCurrentUser(data) {
    const response = await api.put('/users/update/me', data)
    return response.data
  },

  async getFavoriteStores() {
    const response = await api.get('/users/favorite-stores/list')
    return response.data
  },

  async addFavoriteStore(storeId, notificationEnabled = false) {
    const response = await api.post('/users/favorite-stores/add', {
      storeId,
      notificationEnabled
    })
    return response.data
  },

  async removeFavoriteStore(storeId) {
    const response = await api.delete(`/users/favorite-stores/delete/${storeId}`)
    return response.data
  },

  async updateFavoriteStoreNotification(storeId, notificationEnabled) {
    const response = await api.put(`/users/favorite-stores/update/${storeId}`, {
      notificationEnabled
    })
    return response.data
  },

  async getNotificationSettings() {
    const response = await api.get('/users/notification-settings')
    return response.data
  },

  async updateNotificationSettings(settings) {
    const response = await api.put('/users/notification-settings/update', settings)
    return response.data
  },

  // ==================== 商品 ====================
  async getProducts(params = {}) {
    const response = await api.get('/products/list', { params })
    return response.data
  },

  async getProductById(productId) {
    const response = await api.get(`/products/list/${productId}`)
    return response.data
  },

  async getProductPriceHistory(productId, period = '30d') {
    const response = await api.get(`/products/price-history/${productId}`, {
      params: { period }
    })
    return response.data
  },

  // ==================== 店舗 ====================
  async getStores(params = {}) {
    const response = await api.get('/stores/list', { params })
    return response.data
  },

  async getStoreById(storeId) {
    const response = await api.get(`/stores/list/${storeId}`)
    return response.data
  },

  async getStoreFlyers(storeId, params = {}) {
    const response = await api.get(`/stores/flyers/${storeId}`, { params })
    return response.data
  },

  // ==================== 共有レシピ ====================
  async getSharedRecipe(sharedRecipeId) {
    const response = await api.get(`/shared-recipes/${sharedRecipeId}`)
    return response.data
  },

  async getFlyerSharedRecipes(flyerId, params = {}) {
    const response = await api.get(`/flyers/${flyerId}/shared-recipes`, { params })
    return response.data
  },

  // ==================== 管理者側API ====================
  admin: {
    // ==================== 認証 ====================
    async login(username, password) {
      const response = await adminApi.post('/auth/login', { username, password })
      return response.data
    },

    // ==================== コラム管理 ====================
    async getArticles(params = {}) {
      const response = await adminApi.get('/articles/list', { params })
      return response.data
    },

    async createArticle(data) {
      const response = await adminApi.post('/articles/add', data)
      return response.data
    },

    async getArticleById(articleId) {
      const response = await adminApi.get(`/articles/list/${articleId}`)
      return response.data
    },

    async updateArticle(articleId, data) {
      const response = await adminApi.put(`/articles/update/${articleId}`, data)
      return response.data
    },

    async deleteArticle(articleId) {
      const response = await adminApi.delete(`/articles/delete/${articleId}`)
      return response.data
    },

    async bulkUpdateArticleStatus(articleIds, status) {
      const response = await adminApi.put('/articles/bulk-status', {
        articleIds,
        status
      })
      return response.data
    },

    async bulkDeleteArticles(articleIds) {
      const response = await adminApi.delete('/articles/bulk-delete', {
        params: { articleIds: articleIds.join(',') }
      })
      return response.data
    },

    // ==================== 企業管理 ====================
    async getCompanies(params = {}) {
      const response = await adminApi.get('/companies/list', { params })
      return response.data
    },

    async createCompany(data) {
      const response = await adminApi.post('/companies/add', data)
      return response.data
    },

    async getCompanyById(companyId) {
      const response = await adminApi.get(`/companies/list/${companyId}`)
      return response.data
    },

    async updateCompany(companyId, data) {
      const response = await adminApi.put(`/companies/update/${companyId}`, data)
      return response.data
    },

    async deleteCompany(companyId) {
      const response = await adminApi.delete(`/companies/delete/${companyId}`)
      return response.data
    },

    async bulkUpdateCompanyStatus(companyIds, contractStatus) {
      const response = await adminApi.put('/companies/bulk-status', {
        companyIds,
        contractStatus
      })
      return response.data
    },

    // ==================== 店舗管理 ====================
    async getStores(params = {}) {
      const response = await adminApi.get('/stores/list', { params })
      return response.data
    },

    async createStore(data) {
      const response = await adminApi.post('/stores/add', data)
      return response.data
    },

    async getStoreById(storeId) {
      const response = await adminApi.get(`/stores/list/${storeId}`)
      return response.data
    },

    async updateStore(storeId, data) {
      const response = await adminApi.put(`/stores/update/${storeId}`, data)
      return response.data
    },

    async deleteStore(storeId) {
      const response = await adminApi.delete(`/stores/delete/${storeId}`)
      return response.data
    },

    // ==================== チラシ管理 ====================
    async getFlyers(params = {}) {
      const response = await adminApi.get('/flyers/list', { params })
      return response.data
    },

    async createFlyer(formData) {
      const response = await adminApi.post('/flyers/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    },

    async getFlyerById(flyerId) {
      const response = await adminApi.get(`/flyers/list/${flyerId}`)
      return response.data
    },

    async updateFlyer(flyerId, formData) {
      const response = await adminApi.put(`/flyers/update/${flyerId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    },

    async deleteFlyer(flyerId) {
      const response = await adminApi.delete(`/flyers/delete/${flyerId}`)
      return response.data
    },

    // ==================== アカウント管理 ====================
    async getAccounts(params = {}) {
      const response = await adminApi.get('/accounts/list', { params })
      return response.data
    },

    async createAccount(data) {
      const response = await adminApi.post('/accounts/add', data)
      return response.data
    },

    async getAccountById(accountId) {
      const response = await adminApi.get(`/accounts/list/${accountId}`)
      return response.data
    },

    async updateAccount(accountId, data) {
      const response = await adminApi.put(`/accounts/update/${accountId}`, data)
      return response.data
    },

    async deleteAccount(accountId) {
      const response = await adminApi.delete(`/accounts/delete/${accountId}`)
      return response.data
    }
  }
}
