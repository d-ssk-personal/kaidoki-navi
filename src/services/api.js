import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// 本番環境用のAPI設定
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

export default {
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