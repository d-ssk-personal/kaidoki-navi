<template>
  <div class="settings-page">
    <h1 class="page-title">通知設定</h1>
    <p class="page-description">
      価格変動の通知を受け取るための設定を行います
    </p>

    <div class="settings-container">
      <!-- PWA通知設定 -->
      <section class="settings-section">
        <h2 class="section-title">🔔 通知方法</h2>
        <div class="settings-card">
          <div class="notification-option">
            <div class="option-info">
              <div class="option-icon">🌐</div>
              <div>
                <h3 class="option-title">PWA通知</h3>
                <p class="option-description">
                  アプリをインストールして価格変動の通知を受け取れます
                </p>
              </div>
            </div>
            <div class="notification-actions">
              <button
                :class="['btn', webPushEnabled ? 'btn-outline' : 'btn-primary']"
                @click="toggleWebPush"
              >
                {{ webPushEnabled ? '通知をオフにする' : '通知を有効にする' }}
              </button>
              <button class="btn btn-secondary" @click="showInstallModal = true">
                📱 インストール手順
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- カテゴリ設定 -->
      <section class="settings-section">
        <h2 class="section-title">📦 通知カテゴリ</h2>
        <div class="settings-card">
          <p class="section-description">
            通知を受け取りたい商品カテゴリを選択してください
          </p>
          <div class="category-list">
            <label 
              v-for="category in categories" 
              :key="category"
              class="category-item"
            >
              <input 
                type="checkbox" 
                :value="category"
                v-model="selectedCategories"
              />
              <span class="category-name">{{ category }}</span>
            </label>
          </div>
        </div>
      </section>

      <!-- 通知頻度設定 -->
      <section class="settings-section">
        <h2 class="section-title">⏰ 通知頻度</h2>
        <div class="settings-card">
          <div class="frequency-options">
            <label 
              v-for="freq in frequencies" 
              :key="freq.value"
              class="frequency-option"
            >
              <input 
                type="radio" 
                :value="freq.value"
                v-model="selectedFrequency"
                name="frequency"
              />
              <div class="frequency-info">
                <span class="frequency-title">{{ freq.label }}</span>
                <span class="frequency-description">{{ freq.description }}</span>
              </div>
            </label>
          </div>
        </div>
      </section>

      <!-- 価格変動閾値設定 -->
      <section class="settings-section">
        <h2 class="section-title">📊 価格変動の閾値</h2>
        <div class="settings-card">
          <p class="section-description">
            通知を受け取る価格変動の最小パーセンテージ
          </p>
          <div class="threshold-selector">
            <input 
              type="range" 
              min="1" 
              max="20" 
              v-model="priceThreshold"
              class="threshold-slider"
            />
            <div class="threshold-display">
              <span class="threshold-value">{{ priceThreshold }}%</span>
              <span class="threshold-label">以上の変動で通知</span>
            </div>
          </div>
        </div>
      </section>

      <!-- お気に入り商品 -->
      <section class="settings-section">
        <h2 class="section-title">⭐ お気に入り商品</h2>
        <div class="settings-card">
          <p class="section-description">
            お気に入りに追加した商品は優先的に通知されます
          </p>
          <div v-if="favoriteProducts.length === 0" class="empty-state">
            <p>お気に入り商品はまだありません</p>
            <router-link to="/top" class="btn btn-primary">
              商品を探す
            </router-link>
          </div>
          <div v-else class="favorite-list">
            <div 
              v-for="product in favoriteProducts" 
              :key="product.id"
              class="favorite-item"
            >
              <span class="favorite-name">{{ product.name }}</span>
              <button 
                class="remove-btn"
                @click="removeFavorite(product.id)"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 保存ボタン -->
      <div class="save-section">
        <button 
          class="btn btn-primary btn-large"
          @click="saveSettings"
          :disabled="saving"
        >
          {{ saving ? '保存中...' : '設定を保存' }}
        </button>
        <p v-if="saveMessage" :class="['save-message', saveMessageClass]">
          {{ saveMessage }}
        </p>
      </div>
    </div>

    <!-- PWAインストール手順モーダル -->
    <div v-if="showInstallModal" class="modal-overlay" @click="showInstallModal = false">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="showInstallModal = false">✕</button>

        <h2 class="modal-title">PWAインストール手順</h2>

        <div class="modal-body">
          <p class="modal-intro">
            お使いのデバイスに応じた手順を選択してください
          </p>

          <div class="device-tabs">
            <button
              :class="['device-tab', { active: selectedDevice === 'pc' }]"
              @click="selectedDevice = 'pc'"
            >
              💻 PC / Android
            </button>
            <button
              :class="['device-tab', { active: selectedDevice === 'ios' }]"
              @click="selectedDevice = 'ios'"
            >
              📱 iOS (iPhone/iPad)
            </button>
          </div>

          <!-- PC/Android手順 -->
          <div v-if="selectedDevice === 'pc'" class="install-steps">
            <h3 class="steps-title">PC / Androidでのインストール手順</h3>
            <div class="step-list">
              <div class="step-item">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>ブラウザのアドレスバー右側のアイコンをクリック</h4>
                  <p>Chrome: 「インストール」または「+」アイコン</p>
                  <p>Edge: 「アプリのインストール」アイコン</p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>「インストール」をクリック</h4>
                  <p>確認画面が表示されるので、「インストール」ボタンを押してください</p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>完了！</h4>
                  <p>デスクトップまたはアプリ一覧にアイコンが追加されます</p>
                </div>
              </div>
            </div>
          </div>

          <!-- iOS手順 -->
          <div v-if="selectedDevice === 'ios'" class="install-steps">
            <h3 class="steps-title">iOS (iPhone/iPad)でのインストール手順</h3>
            <div class="step-list">
              <div class="step-item">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>Safariブラウザで開く</h4>
                  <p>必ずSafariブラウザを使用してください（他のブラウザでは利用できません）</p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>画面下部の「共有」ボタンをタップ</h4>
                  <p>四角に上向き矢印のアイコンです</p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>「ホーム画面に追加」をタップ</h4>
                  <p>メニューを下にスクロールすると見つかります</p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">4</div>
                <div class="step-content">
                  <h4>「追加」をタップ</h4>
                  <p>アプリ名を確認して、右上の「追加」ボタンを押してください</p>
                </div>
              </div>

              <div class="step-item">
                <div class="step-number">5</div>
                <div class="step-content">
                  <h4>完了！</h4>
                  <p>ホーム画面にアイコンが追加されます</p>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-primary" @click="showInstallModal = false">
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from '@/store'
import api from '@/services/api'

export default {
  name: 'Settings',
  data() {
    return {
      webPushEnabled: false,
      showInstallModal: false,
      selectedDevice: 'pc',
      categories: ['食品', '飲料', '日用品', '調味料', '冷凍食品'],
      selectedCategories: [],
      frequencies: [
        {
          value: 'realtime',
          label: 'リアルタイム',
          description: '価格変動が発生したらすぐに通知'
        },
        {
          value: 'morning',
          label: '毎朝',
          description: '毎朝8時に前日の変動をまとめて通知'
        },
        {
          value: 'evening',
          label: '毎夕',
          description: '毎夕18時にその日の変動をまとめて通知'
        }
      ],
      selectedFrequency: 'realtime',
      priceThreshold: 5,
      saving: false,
      saveMessage: '',
      saveMessageClass: ''
    }
  },
  computed: {
    favoriteProducts() {
      const store = useMainStore()
      return store.products.filter(p => 
        store.favoriteProducts.includes(p.id)
      )
    }
  },
  mounted() {
    this.loadSettings()
  },
  methods: {
    loadSettings() {
      const store = useMainStore()
      const settings = store.notificationSettings
      
      this.selectedCategories = [...settings.categories]
      this.selectedFrequency = settings.frequency
      this.priceThreshold = settings.priceChangeThreshold
    },
    async toggleWebPush() {
      if (!this.webPushEnabled) {
        try {
          const permission = await Notification.requestPermission()
          if (permission === 'granted') {
            this.webPushEnabled = true
            this.saveMessage = 'Web Push通知を有効にしました'
            this.saveMessageClass = 'success'
          } else {
            this.saveMessage = '通知の許可が必要です'
            this.saveMessageClass = 'error'
          }
        } catch (error) {
          console.error('Web Push設定エラー:', error)
          this.saveMessage = 'Web Push通知の設定に失敗しました'
          this.saveMessageClass = 'error'
        }
      } else {
        this.webPushEnabled = false
        this.saveMessage = 'Web Push通知を無効にしました'
        this.saveMessageClass = 'success'
      }
      
      setTimeout(() => {
        this.saveMessage = ''
      }, 3000)
    },
    async saveSettings() {
      try {
        this.saving = true
        this.saveMessage = ''
        
        const settings = {
          categories: this.selectedCategories,
          frequency: this.selectedFrequency,
          priceChangeThreshold: this.priceThreshold
        }
        
        const store = useMainStore()
        store.updateNotificationSettings(settings)
        
        await api.saveNotificationSettings(settings)
        
        this.saveMessage = '設定を保存しました'
        this.saveMessageClass = 'success'
      } catch (error) {
        console.error('設定保存エラー:', error)
        this.saveMessage = '設定の保存に失敗しました'
        this.saveMessageClass = 'error'
      } finally {
        this.saving = false
        
        setTimeout(() => {
          this.saveMessage = ''
        }, 3000)
      }
    },
    removeFavorite(id) {
      const store = useMainStore()
      store.removeFavorite(id)
    }
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 60px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.page-description {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 40px;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-description {
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.6;
}

.settings-card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 通知オプション */
.notification-option {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 0;
}

.option-info {
  display: flex;
  align-items: start;
  gap: 16px;
}

.notification-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.option-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.option-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.option-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* カテゴリリスト */
.category-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-light);
}

.category-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.category-item input[type="checkbox"]:checked + .category-name {
  color: var(--primary-color);
  font-weight: 600;
}

.category-name {
  font-size: 16px;
  color: var(--text-primary);
}

/* 通知頻度 */
.frequency-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.frequency-option {
  display: flex;
  align-items: start;
  gap: 12px;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.frequency-option:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-light);
}

.frequency-option input[type="radio"] {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  cursor: pointer;
}

.frequency-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.frequency-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.frequency-description {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 閾値設定 */
.threshold-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.threshold-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--bg-light);
  outline: none;
  cursor: pointer;
}

.threshold-slider::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
}

.threshold-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: none;
}

.threshold-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.threshold-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
}

.threshold-label {
  color: var(--text-secondary);
}

/* お気に入りリスト */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.empty-state p {
  margin-bottom: 16px;
}

.favorite-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.favorite-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--bg-light);
  border-radius: 8px;
}

.favorite-name {
  font-weight: 500;
  color: var(--text-primary);
}

.remove-btn {
  padding: 6px 12px;
  background-color: transparent;
  border: 1px solid var(--danger-color);
  color: var(--danger-color);
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.remove-btn:hover {
  background-color: var(--danger-color);
  color: white;
}

/* 保存セクション */
.save-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-top: 20px;
}

.btn-large {
  min-width: 200px;
}

.save-message {
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 8px;
}

.save-message.success {
  background-color: #d1fae5;
  color: var(--secondary-color);
}

.save-message.error {
  background-color: #fee2e2;
  color: var(--danger-color);
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 28px;
  color: var(--text-secondary);
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background-color: var(--bg-light);
  color: var(--text-primary);
}

.modal-title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  padding: 32px 32px 16px;
  color: var(--text-primary);
}

.modal-body {
  padding: 0 32px 32px;
}

.modal-intro {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 24px;
  font-size: 16px;
}

.device-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  justify-content: center;
}

.device-tab {
  flex: 1;
  max-width: 250px;
  padding: 16px 24px;
  background-color: white;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.device-tab:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-light);
}

.device-tab.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.install-steps {
  margin-bottom: 32px;
}

.steps-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
  text-align: center;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background-color: var(--bg-light);
  border-radius: 12px;
}

.step-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.step-content p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 4px;
}

.modal-actions {
  text-align: center;
}

@media (max-width: 768px) {
  .category-list {
    grid-template-columns: 1fr;
  }

  .notification-actions {
    flex-direction: column;
  }

  .device-tabs {
    flex-direction: column;
  }

  .device-tab {
    max-width: 100%;
  }

  .modal-title {
    font-size: 22px;
    padding: 24px 16px 12px;
  }

  .modal-body {
    padding: 0 16px 24px;
  }

  .step-item {
    flex-direction: column;
    align-items: start;
  }
}
</style>