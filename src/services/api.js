import axios from 'axios'

// 開発環境用のモックデータ生成
const generateMockData = () => {
  const categories = ['飲料', 'お菓子・おつまみ', '生鮮食品', '冷蔵・冷凍', '調味料', 'パン・シリアル', '日用品']
  const products = [
    { name: '牛乳', category: '飲料', basePrice: 250 },
    { name: '卵', category: '生鮮食品', basePrice: 200 },
    { name: '食用油', category: '調味料', basePrice: 350 },
    { name: '食パン', category: 'パン・シリアル', basePrice: 180 },
    { name: 'トイレットペーパー', category: '日用品', basePrice: 500 },
    { name: 'コーラ', category: '飲料', basePrice: 150 },
    { name: 'ポテトチップス', category: 'お菓子・おつまみ', basePrice: 120 },
    { name: '冷凍餃子', category: '冷蔵・冷凍', basePrice: 280 },
    { name: '醤油', category: '調味料', basePrice: 200 },
    { name: 'チョコレート', category: 'お菓子・おつまみ', basePrice: 180 }
  ]
  
  return products.map((product, index) => ({
    id: `item-${index + 1}`,
    name: product.name,
    category: product.category,
    currentPrice: Math.round(product.basePrice * (0.9 + Math.random() * 0.2)),
    previousPrice: product.basePrice,
    shop: ['スーパーA', 'ドラッグストアB', 'コンビニC'][Math.floor(Math.random() * 3)],
    priceChange: Math.round((Math.random() - 0.5) * 50),
    lastUpdated: new Date().toISOString()
  }))
}

const generatePriceHistory = (days = 30) => {
  const history = []
  const basePrice = 200 + Math.random() * 200
  
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(basePrice * (0.85 + Math.random() * 0.3))
    })
  }
  
  return history
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// 本番環境用のAPI設定
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

export default {
  // 商品一覧取得
  async getProducts() {
    try {
      // 本番環境ではこちらを使用
      // const response = await api.get('/products')
      // return response.data
      
      // 開発環境用モックデータ
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(generateMockData())
        }, 500)
      })
    } catch (error) {
      console.error('商品一覧の取得に失敗しました:', error)
      throw error
    }
  },

  // 商品詳細取得
  async getProductDetail(id) {
    try {
      // 本番環境ではこちらを使用
      // const response = await api.get(`/products/${id}`)
      // return response.data
      
      // 開発環境用モックデータ
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id,
            name: '牛乳',
            category: '飲料',
            currentPrice: 240,
            previousPrice: 250,
            shop: 'スーパーA',
            priceHistory: generatePriceHistory(30),
            aiSummary: {
              lowestPrice: '直近30日で最安値は230円です',
              trend: '来週火曜日に値下げの傾向があります（過去の曜日パターンより）',
              recommendation: '今週末の購入がお得です'
            }
          })
        }, 500)
      })
    } catch (error) {
      console.error('商品詳細の取得に失敗しました:', error)
      throw error
    }
  },

  // 価格履歴取得
  async getPriceHistory(id, days = 30) {
    try {
      // 本番環境ではこちらを使用
      // const response = await api.get(`/products/${id}/history?days=${days}`)
      // return response.data
      
      // 開発環境用モックデータ
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(generatePriceHistory(days))
        }, 500)
      })
    } catch (error) {
      console.error('価格履歴の取得に失敗しました:', error)
      throw error
    }
  },

  // 通知設定の保存
  async saveNotificationSettings(settings) {
    try {
      // 本番環境ではこちらを使用
      // const response = await api.post('/settings/notifications', settings)
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
  }
}