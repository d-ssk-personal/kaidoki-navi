import axios from 'axios'

// ==================== 環境設定 ====================
// 環境ごとのベースURL定義
const API_ENDPOINTS = {
  // ローカル環境 (現在有効)
  local: {
    user: 'http://localhost:3000/api/v1',
    admin: 'http://localhost:3000/api/v1/admin'
  },
  // ステージング環境 (コメントアウト)
  // staging: {
  //   user: 'https://api-staging.chirashi-kitchen.com/v1',
  //   admin: 'https://api-staging.chirashi-kitchen.com/v1/admin'
  // },
  // 本番環境 (コメントアウト)
  // production: {
  //   user: 'https://api.chirashi-kitchen.com/v1',
  //   admin: 'https://api.chirashi-kitchen.com/v1/admin'
  // }
}

// 現在の環境を選択 (ローカル環境を使用)
const CURRENT_ENV = 'local'
const BASE_URL = API_ENDPOINTS[CURRENT_ENV]

// ==================== Axiosインスタンス設定 ====================
// ユーザー側API用
const userApi = axios.create({
  baseURL: BASE_URL.user,
  timeout: 30000, // AIレシピ生成は時間がかかるため30秒
  headers: {
    'Content-Type': 'application/json'
  }
})

// 管理者側API用
const adminApi = axios.create({
  baseURL: BASE_URL.admin,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ==================== リクエストインターセプター ====================
// 認証トークンを自動的に付与
const addAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
}

addAuthInterceptor(userApi)
addAuthInterceptor(adminApi)

// ==================== レスポンスインターセプター ====================
// エラーハンドリング
const addResponseInterceptor = (apiInstance) => {
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        // サーバーからのエラーレスポンス
        const { status, data } = error.response

        switch (status) {
          case 401:
            // 認証エラー - ログイン画面へリダイレクト
            console.error('認証エラー:', data.error)
            localStorage.removeItem('authToken')
            // window.location.href = '/login' // 必要に応じて有効化
            break
          case 403:
            console.error('権限エラー:', data.error)
            break
          case 404:
            console.error('リソースが見つかりません:', data.error)
            break
          case 500:
            console.error('サーバーエラー:', data.error)
            break
          default:
            console.error('APIエラー:', data.error)
        }
      } else if (error.request) {
        // リクエストは送信されたがレスポンスがない
        console.error('ネットワークエラー:', error.message)
      } else {
        // リクエスト設定中のエラー
        console.error('リクエストエラー:', error.message)
      }

      return Promise.reject(error)
    }
  )
}

addResponseInterceptor(userApi)
addResponseInterceptor(adminApi)

// ==================== ユーザー側API ====================
export const userAPI = {
  // ---------- 認証 ----------
  auth: {
    /**
     * ユーザーログイン
     * @param {string} email - メールアドレス
     * @param {string} password - パスワード
     * @returns {Promise<{token: string, user: Object}>}
     */
    login: (email, password) => {
      return userApi.post('/auth/login', { email, password })
    },

    /**
     * ユーザーログアウト
     * @returns {Promise<{message: string}>}
     */
    logout: () => {
      return userApi.post('/auth/logout')
    },

    /**
     * ユーザー登録
     * @param {string} email - メールアドレス
     * @param {string} password - パスワード
     * @param {string} name - 名前
     * @returns {Promise<{token: string, user: Object}>}
     */
    register: (email, password, name) => {
      return userApi.post('/auth/register', { email, password, name })
    }
  },

  // ---------- チラシ ----------
  flyers: {
    /**
     * チラシ一覧取得
     * @param {Object} params - クエリパラメータ {region, prefecture, storeName, address, page, limit}
     * @returns {Promise<{items: Array, pagination: Object}>}
     */
    list: (params = {}) => {
      return userApi.get('/flyers/list', { params })
    },

    /**
     * チラシ詳細取得
     * @param {string} flyerId - チラシID
     * @returns {Promise<Object>}
     */
    getById: (flyerId) => {
      return userApi.get(`/flyers/list/${flyerId}`)
    },

    /**
     * AIレシピ提案
     * @param {string} flyerId - チラシID
     * @returns {Promise<Object>}
     */
    generateRecipe: (flyerId) => {
      return userApi.post(`/flyers/recipe/${flyerId}`)
    },

    /**
     * レシピをSNS共有用に保存
     * @param {string} flyerId - チラシID
     * @param {string} userId - ユーザーID(任意)
     * @returns {Promise<{sharedRecipeId: string, shareUrl: string, ogpImageUrl: string}>}
     */
    shareRecipe: (flyerId, userId = null) => {
      return userApi.post('/flyers/recipe/share', { flyerId, userId })
    },

    /**
     * おすすめチラシ取得
     * @param {number} limit - 取得件数
     * @returns {Promise<{items: Array}>}
     */
    recommended: (limit = 10) => {
      return userApi.get('/flyers/recommended', { params: { limit } })
    }
  },

  // ---------- コラム ----------
  articles: {
    /**
     * コラム一覧取得
     * @param {Object} params - クエリパラメータ {category, tags, search, page, limit}
     * @returns {Promise<{items: Array, pagination: Object}>}
     */
    list: (params = {}) => {
      return userApi.get('/articles/list', { params })
    },

    /**
     * コラム詳細取得
     * @param {number} articleId - コラムID
     * @returns {Promise<Object>}
     */
    getById: (articleId) => {
      return userApi.get(`/articles/list/${articleId}`)
    },

    /**
     * 新着コラム取得
     * @param {number} limit - 取得件数
     * @returns {Promise<{items: Array}>}
     */
    latest: (limit = 10) => {
      return userApi.get('/articles/latest', { params: { limit } })
    }
  },

  // ---------- マイページ ----------
  users: {
    /**
     * ユーザー情報取得
     * @returns {Promise<Object>}
     */
    me: () => {
      return userApi.get('/users/me')
    },

    /**
     * ユーザー情報更新
     * @param {Object} userData - 更新するデータ {name, email}
     * @returns {Promise<Object>}
     */
    updateMe: (userData) => {
      return userApi.put('/users/update/me', userData)
    },

    // お気に入り店舗
    favoriteStores: {
      /**
       * お気に入り店舗一覧取得
       * @returns {Promise<{items: Array}>}
       */
      list: () => {
        return userApi.get('/users/favorite-stores/list')
      },

      /**
       * お気に入り店舗追加
       * @param {string} storeId - 店舗ID
       * @param {boolean} notificationEnabled - 通知を有効にするか
       * @returns {Promise<Object>}
       */
      add: (storeId, notificationEnabled = false) => {
        return userApi.post('/users/favorite-stores/add', { storeId, notificationEnabled })
      },

      /**
       * お気に入り店舗削除
       * @param {string} storeId - 店舗ID
       * @returns {Promise<{message: string}>}
       */
      remove: (storeId) => {
        return userApi.delete(`/users/favorite-stores/delete/${storeId}`)
      },

      /**
       * お気に入り店舗の通知設定更新
       * @param {string} storeId - 店舗ID
       * @param {boolean} notificationEnabled - 通知を有効にするか
       * @returns {Promise<Object>}
       */
      updateNotification: (storeId, notificationEnabled) => {
        return userApi.put(`/users/favorite-stores/update/${storeId}`, { notificationEnabled })
      }
    },

    // 通知設定
    notificationSettings: {
      /**
       * 通知設定取得
       * @returns {Promise<Object>}
       */
      get: () => {
        return userApi.get('/users/notification-settings')
      },

      /**
       * 通知設定更新
       * @param {Object} settings - 通知設定 {categories, frequency, priceChangeThreshold}
       * @returns {Promise<Object>}
       */
      update: (settings) => {
        return userApi.put('/users/notification-settings/update', settings)
      }
    }
  },

  // ---------- 商品 ----------
  products: {
    /**
     * 商品一覧取得
     * @param {Object} params - クエリパラメータ {keyword, category, page, limit}
     * @returns {Promise<{items: Array, pagination: Object}>}
     */
    list: (params = {}) => {
      return userApi.get('/products/list', { params })
    },

    /**
     * 商品詳細取得
     * @param {string} productId - 商品ID
     * @returns {Promise<Object>}
     */
    getById: (productId) => {
      return userApi.get(`/products/list/${productId}`)
    },

    /**
     * 商品価格履歴取得
     * @param {string} productId - 商品ID
     * @param {string} period - 期間 (7d, 30d, 90d)
     * @returns {Promise<{productId: string, period: string, history: Array}>}
     */
    priceHistory: (productId, period = '30d') => {
      return userApi.get(`/products/price-history/${productId}`, { params: { period } })
    }
  },

  // ---------- 店舗 ----------
  stores: {
    /**
     * 店舗一覧取得
     * @param {Object} params - クエリパラメータ {region, prefecture, storeName, address, page, limit}
     * @returns {Promise<{items: Array, pagination: Object}>}
     */
    list: (params = {}) => {
      return userApi.get('/stores/list', { params })
    },

    /**
     * 店舗詳細取得
     * @param {string} storeId - 店舗ID
     * @returns {Promise<Object>}
     */
    getById: (storeId) => {
      return userApi.get(`/stores/list/${storeId}`)
    },

    /**
     * 店舗のチラシ一覧取得
     * @param {string} storeId - 店舗ID
     * @param {Object} params - クエリパラメータ {page, limit}
     * @returns {Promise<{items: Array, pagination: Object}>}
     */
    flyers: (storeId, params = {}) => {
      return userApi.get(`/stores/flyers/${storeId}`, { params })
    }
  },

  // ---------- 共有レシピ ----------
  sharedRecipes: {
    /**
     * 共有レシピ取得
     * @param {string} sharedRecipeId - 共有レシピID
     * @returns {Promise<Object>}
     */
    get: (sharedRecipeId) => {
      return userApi.get(`/shared-recipes/${sharedRecipeId}`)
    },

    /**
     * チラシから共有されたレシピ一覧取得
     * @param {string} flyerId - チラシID
     * @param {Object} params - クエリパラメータ {limit, sortBy}
     * @returns {Promise<{items: Array, total: number}>}
     */
    listByFlyer: (flyerId, params = {}) => {
      return userApi.get(`/flyers/${flyerId}/shared-recipes`, { params })
    }
  }
}

// ==================== 管理者側API ====================
export const adminAPI = {
  // ---------- 認証 ----------
  auth: {
    /**
     * 管理者ログイン
     * @param {string} username - ユーザー名
     * @param {string} password - パスワード
     * @returns {Promise<{token: string, admin: Object}>}
     */
    login: (username, password) => {
      return adminApi.post('/auth/login', { username, password })
    }
  },

  // ---------- コラム管理 ----------
  articles: {
    /**
     * コラム一覧取得
     * @param {Object} params - クエリパラメータ {search, status, category, tags, dateFrom, dateTo, page, limit}
     * @returns {Promise<{items: Array, pagination: Object}>}
     */
    list: (params = {}) => {
      return adminApi.get('/articles/list', { params })
    },

    /**
     * コラム追加
     * @param {Object} articleData - コラムデータ
     * @returns {Promise<Object>}
     */
    create: (articleData) => {
      return adminApi.post('/articles/add', articleData)
    },

    /**
     * コラム詳細取得
     * @param {number} articleId - コラムID
     * @returns {Promise<Object>}
     */
    getById: (articleId) => {
      return adminApi.get(`/articles/list/${articleId}`)
    },

    /**
     * コラム更新
     * @param {number} articleId - コラムID
     * @param {Object} articleData - 更新するコラムデータ
     * @returns {Promise<Object>}
     */
    update: (articleId, articleData) => {
      return adminApi.put(`/articles/update/${articleId}`, articleData)
    },

    /**
     * コラム削除
     * @param {number} articleId - コラムID
     * @returns {Promise<{message: string}>}
     */
    delete: (articleId) => {
      return adminApi.delete(`/articles/delete/${articleId}`)
    },

    /**
     * コラム一括ステータス変更
     * @param {Array<number>} articleIds - コラムIDの配列
     * @param {string} status - ステータス (published, draft)
     * @returns {Promise<{message: string, updatedCount: number}>}
     */
    bulkUpdateStatus: (articleIds, status) => {
      return adminApi.put('/articles/bulk-status', { articleIds, status })
    },

    /**
     * コラム一括削除
     * @param {Array<number>} articleIds - コラムIDの配列
     * @returns {Promise<{message: string, deletedCount: number}>}
     */
    bulkDelete: (articleIds) => {
      return adminApi.delete('/articles/bulk-delete', { params: { articleIds: articleIds.join(',') } })
    }
  },

  // ---------- 企業管理 ----------
  companies: {
    /**
     * 企業一覧取得
     * @param {Object} params - クエリパラメータ {search, contractStatus, contractPlan, page, limit}
     * @returns {Promise<{items: Array, pagination: Object}>}
     */
    list: (params = {}) => {
      return adminApi.get('/companies/list', { params })
    },

    /**
     * 企業追加
     * @param {Object} companyData - 企業データ
     * @returns {Promise<Object>}
     */
    create: (companyData) => {
      return adminApi.post('/companies/add', companyData)
    },

    /**
     * 企業詳細取得
     * @param {string} companyId - 企業ID
     * @returns {Promise<Object>}
     */
    getById: (companyId) => {
      return adminApi.get(`/companies/list/${companyId}`)
    },

    /**
     * 企業更新
     * @param {string} companyId - 企業ID
     * @param {Object} companyData - 更新する企業データ
     * @returns {Promise<Object>}
     */
    update: (companyId, companyData) => {
      return adminApi.put(`/companies/update/${companyId}`, companyData)
    },

    /**
     * 企業削除
     * @param {string} companyId - 企業ID
     * @returns {Promise<{message: string}>}
     */
    delete: (companyId) => {
      return adminApi.delete(`/companies/delete/${companyId}`)
    },

    /**
     * 企業一括ステータス変更
     * @param {Array<string>} companyIds - 企業IDの配列
     * @param {string} contractStatus - 契約ステータス (active, expired, suspended)
     * @returns {Promise<{message: string, updatedCount: number}>}
     */
    bulkUpdateStatus: (companyIds, contractStatus) => {
      return adminApi.put('/companies/bulk-status', { companyIds, contractStatus })
    }
  },

  // ---------- 店舗管理 ----------
  stores: {
    /**
     * 店舗一覧取得
     * @param {Object} params - クエリパラメータ {companyId, companyName, storeId, storeName, address, page, limit}
     * @returns {Promise<{items: Array, pagination: Object}>}
     */
    list: (params = {}) => {
      return adminApi.get('/stores/list', { params })
    },

    /**
     * 店舗追加
     * @param {Object} storeData - 店舗データ
     * @returns {Promise<Object>}
     */
    create: (storeData) => {
      return adminApi.post('/stores/add', storeData)
    },

    /**
     * 店舗詳細取得
     * @param {string} storeId - 店舗ID
     * @returns {Promise<Object>}
     */
    getById: (storeId) => {
      return adminApi.get(`/stores/list/${storeId}`)
    },

    /**
     * 店舗更新
     * @param {string} storeId - 店舗ID
     * @param {Object} storeData - 更新する店舗データ
     * @returns {Promise<Object>}
     */
    update: (storeId, storeData) => {
      return adminApi.put(`/stores/update/${storeId}`, storeData)
    },

    /**
     * 店舗削除
     * @param {string} storeId - 店舗ID
     * @returns {Promise<{message: string}>}
     */
    delete: (storeId) => {
      return adminApi.delete(`/stores/delete/${storeId}`)
    }
  },

  // ---------- チラシ管理 ----------
  flyers: {
    /**
     * チラシ一覧取得
     * @param {Object} params - クエリパラメータ {companyId, companyName, storeId, storeName, flyerId, address, validFrom, validUntil, page, limit}
     * @returns {Promise<{items: Array, pagination: Object}>}
     */
    list: (params = {}) => {
      return adminApi.get('/flyers/list', { params })
    },

    /**
     * チラシ追加
     * @param {FormData} formData - フォームデータ (画像含む)
     * @returns {Promise<Object>}
     */
    create: (formData) => {
      return adminApi.post('/flyers/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },

    /**
     * チラシ詳細取得
     * @param {string} flyerId - チラシID
     * @returns {Promise<Object>}
     */
    getById: (flyerId) => {
      return adminApi.get(`/flyers/list/${flyerId}`)
    },

    /**
     * チラシ更新
     * @param {string} flyerId - チラシID
     * @param {FormData} formData - フォームデータ (画像含む)
     * @returns {Promise<Object>}
     */
    update: (flyerId, formData) => {
      return adminApi.put(`/flyers/update/${flyerId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },

    /**
     * チラシ削除
     * @param {string} flyerId - チラシID
     * @returns {Promise<{message: string}>}
     */
    delete: (flyerId) => {
      return adminApi.delete(`/flyers/delete/${flyerId}`)
    }
  },

  // ---------- アカウント管理 ----------
  accounts: {
    /**
     * アカウント一覧取得
     * @param {Object} params - クエリパラメータ {search, role, companyId, page, limit}
     * @returns {Promise<{items: Array, pagination: Object}>}
     */
    list: (params = {}) => {
      return adminApi.get('/accounts/list', { params })
    },

    /**
     * アカウント追加
     * @param {Object} accountData - アカウントデータ
     * @returns {Promise<Object>}
     */
    create: (accountData) => {
      return adminApi.post('/accounts/add', accountData)
    },

    /**
     * アカウント詳細取得
     * @param {string} accountId - アカウントID
     * @returns {Promise<Object>}
     */
    getById: (accountId) => {
      return adminApi.get(`/accounts/list/${accountId}`)
    },

    /**
     * アカウント更新
     * @param {string} accountId - アカウントID
     * @param {Object} accountData - 更新するアカウントデータ
     * @returns {Promise<Object>}
     */
    update: (accountId, accountData) => {
      return adminApi.put(`/accounts/update/${accountId}`, accountData)
    },

    /**
     * アカウント削除
     * @param {string} accountId - アカウントID
     * @returns {Promise<{message: string}>}
     */
    delete: (accountId) => {
      return adminApi.delete(`/accounts/delete/${accountId}`)
    }
  }
}

// ==================== デフォルトエクスポート (後方互換性) ====================
export default {
  // 既存のメソッドを維持
  async getProducts() {
    // 開発環境用のダミーデータ
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([])
      }, 500)
    })
  },

  async saveNotificationSettings(settings) {
    try {
      // 本番環境ではこちらを使用
      // const response = await userAPI.users.notificationSettings.update(settings)
      // return response.data

      // 開発環境用
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, message: '設定を保存しました' })
        }, 500)
      })
    } catch (error) {
      console.error('通知設定の保存に失敗しました:', error)
      throw error
    }
  },

  // 新しいAPIを簡単にアクセスできるようにエクスポート
  user: userAPI,
  admin: adminAPI
}
