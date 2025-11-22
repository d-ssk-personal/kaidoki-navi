<template>
  <div class="mypage">
    <div class="container">
      <!-- ヘッダー -->
      <div class="page-header">
        <h1 class="page-title">マイページ</h1>
        <p class="page-subtitle">{{ authStore.currentUser?.name }}さん、こんにちは</p>
      </div>

      <!-- お気に入り店舗セクション -->
      <section class="favorites-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">⭐</span>
            お気に入りの店舗
          </h2>
          <p class="section-count">{{ favoriteStoresList.length }}件</p>
        </div>

        <!-- お気に入りがない場合 -->
        <div v-if="favoriteStoresList.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p class="empty-text">お気に入りの店舗がまだありません</p>
          <p class="empty-subtext">
            チラシモーダルから店舗をお気に入りに追加してください
          </p>
          <router-link to="/top" class="btn-primary">
            トップページへ
          </router-link>
        </div>

        <!-- お気に入り店舗リスト -->
        <div v-else class="favorites-grid">
          <div
            v-for="store in favoriteStoresList"
            :key="store.id"
            class="store-card"
          >
            <div class="store-card-content" @click="openStoreFlyer(store)">
              <div class="store-card-header">
                <h3 class="store-name">{{ store.name }}</h3>
                <button
                  class="favorite-btn active"
                  @click.stop="confirmRemoveFavorite(store)"
                  title="お気に入りから削除"
                >
                  ⭐
                </button>
              </div>

              <div class="store-info">
                <div class="info-item">
                  <span class="info-icon">📍</span>
                  <span class="info-text">{{ store.address }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">📞</span>
                  <span class="info-text">{{ store.phone }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">🗓️</span>
                  <span class="info-text">{{ store.salePeriod }}</span>
                </div>
              </div>

              <div class="store-card-footer">
                <span class="view-flyer-text">チラシを見る →</span>
              </div>
            </div>

            <!-- 通知トグル -->
            <div class="notification-toggle-section" @click.stop>
              <div class="toggle-content">
                <div class="toggle-info">
                  <span class="toggle-icon">🔔</span>
                  <span class="toggle-label">新着チラシ通知</span>
                </div>
                <label class="switch">
                  <input
                    type="checkbox"
                    :checked="storeNotifications[store.id]"
                    @change="toggleStoreNotification(store.id)"
                  />
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 通知設定セクション -->
      <section class="notification-settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">🔔</span>
            通知設定
          </h2>
        </div>

        <!-- PWA通知設定 -->
        <div class="settings-card">
          <h3 class="settings-subtitle">通知方法</h3>
          <div class="notification-option">
            <div class="option-info">
              <div class="option-icon">🌐</div>
              <div>
                <h4 class="option-title">PWA通知</h4>
                <p class="option-description">
                  アプリをインストールして新着チラシの通知を受け取れます
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
            </div>
          </div>
        </div>

        <!-- 通知頻度設定 -->
        <div class="settings-card">
          <h3 class="settings-subtitle">通知頻度</h3>
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

        <!-- 保存ボタン -->
        <div class="save-section">
          <button
            class="btn btn-primary btn-large"
            @click="saveNotificationSettings"
            :disabled="saving"
          >
            {{ saving ? '保存中...' : '設定を保存' }}
          </button>
          <p v-if="saveMessage" :class="['save-message', saveMessageClass]">
            {{ saveMessage }}
          </p>
        </div>
      </section>
    </div>

    <!-- チラシモーダル -->
    <FlyerModal
      :show="showModal"
      :store="selectedStore"
      :activeTab="activeTab"
      :currentFlyerImageIndex="currentFlyerImageIndex"
      :currentRecipeIndex="currentRecipeIndex"
      :recipes="recipes"
      :isLoadingRecipe="isLoadingRecipe"
      @close="closeModal"
      @generate-recipes="generateRecipes"
      @switch-tab="switchTab"
      @previous-flyer-image="previousFlyerImage"
      @next-flyer-image="nextFlyerImage"
      @go-to-flyer-image="goToFlyerImage"
      @previous-recipe="previousRecipe"
      @next-recipe="nextRecipe"
      @go-to-recipe="goToRecipe"
      @share-sns="shareSNS"
    />

    <!-- お気に入り削除確認モーダル -->
    <div v-if="showRemoveConfirmModal" class="modal-overlay" @click="cancelRemoveFavorite">
      <div class="modal-content confirm-modal" @click.stop>
        <button class="modal-close" @click="cancelRemoveFavorite">✕</button>

        <div class="confirm-icon">⚠️</div>
        <h2 class="confirm-title">お気に入りから削除しますか？</h2>

        <div class="confirm-body">
          <p class="confirm-store-name">{{ storeToRemove?.name }}</p>
          <p class="confirm-description">
            削除すると、この店舗の通知設定もリセットされます。
          </p>
        </div>

        <div class="confirm-actions">
          <button class="btn btn-secondary" @click="cancelRemoveFavorite">
            キャンセル
          </button>
          <button class="btn btn-danger" @click="executeRemoveFavorite">
            削除する
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/store/auth'
import FlyerModal from '@/components/FlyerModal.vue'
import api from '@/services/api'

export default {
  name: 'MyPage',
  components: {
    FlyerModal
  },
  data() {
    return {
      // モーダル関連
      showModal: false,
      selectedStore: null,
      activeTab: 'flyer',
      currentFlyerImageIndex: 0,
      currentRecipeIndex: 0,
      recipes: [],
      isLoadingRecipe: false,

      // 削除確認モーダル
      showRemoveConfirmModal: false,
      storeToRemove: null,

      // 通知設定
      storeNotifications: {
        1: true,
        2: false,
        3: true
      },
      webPushEnabled: false,
      selectedFrequency: 'realtime',
      frequencies: [
        {
          value: 'realtime',
          label: 'リアルタイム',
          description: '新着チラシが追加されたらすぐに通知'
        },
        {
          value: 'morning',
          label: '毎朝',
          description: '毎朝8時に前日の新着をまとめて通知'
        },
        {
          value: 'evening',
          label: '毎夕',
          description: '毎夕18時にその日の新着をまとめて通知'
        }
      ],
      saving: false,
      saveMessage: '',
      saveMessageClass: '',

      // お気に入り店舗データ（APIから取得）
      allStores: []
    }
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  computed: {
    favoriteStoresList() {
      // お気に入り店舗IDリストに基づいて店舗情報を取得
      return this.allStores.filter(store =>
        this.authStore.isFavorite(store.id)
      )
    }
  },
  async mounted() {
    // 未ログインの場合はログインページにリダイレクト
    if (!this.authStore.isLoggedIn) {
      this.$router.push('/login')
      return
    }

    await this.loadFavoriteStores()
    await this.loadNotificationSettings()
  },
  methods: {
    async loadFavoriteStores() {
      try {
        const data = await api.getFavoriteStores()
        this.allStores = data
      } catch (err) {
        console.error('お気に入り店舗の取得に失敗しました:', err)
        this.allStores = []
      }
    },

    async loadNotificationSettings() {
      try {
        const data = await api.getNotificationSettings()
        if (data) {
          this.storeNotifications = data.storeNotifications || {}
          this.selectedFrequency = data.frequency || 'realtime'
          this.webPushEnabled = data.webPushEnabled || false
        }
      } catch (err) {
        console.error('通知設定の取得に失敗しました:', err)
      }
    },

    openStoreFlyer(store) {
      this.selectedStore = store
      this.activeTab = 'flyer'
      this.currentFlyerImageIndex = 0
      this.currentRecipeIndex = 0
      this.recipes = []
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.selectedStore = null
    },

    confirmRemoveFavorite(store) {
      this.storeToRemove = store
      this.showRemoveConfirmModal = true
    },

    cancelRemoveFavorite() {
      this.showRemoveConfirmModal = false
      this.storeToRemove = null
    },

    executeRemoveFavorite() {
      if (this.storeToRemove) {
        this.authStore.removeFavorite(this.storeToRemove.id)
        // 通知設定もリセット
        this.storeNotifications[this.storeToRemove.id] = false
      }
      this.cancelRemoveFavorite()
    },

    toggleStoreNotification(storeId) {
      this.storeNotifications[storeId] = !this.storeNotifications[storeId]
      // 本来はここでAPIに保存
      console.log(`Store ${storeId} notification:`, this.storeNotifications[storeId])
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

    async saveNotificationSettings() {
      try {
        this.saving = true
        this.saveMessage = ''

        const settings = {
          storeNotifications: this.storeNotifications,
          frequency: this.selectedFrequency,
          webPushEnabled: this.webPushEnabled
        }

        await api.updateNotificationSettings(settings)

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

    switchTab(tab) {
      this.activeTab = tab
    },

    previousFlyerImage() {
      if (this.currentFlyerImageIndex > 0) {
        this.currentFlyerImageIndex--
      }
    },

    nextFlyerImage() {
      if (this.currentFlyerImageIndex < this.selectedStore.flyerImages.length - 1) {
        this.currentFlyerImageIndex++
      }
    },

    goToFlyerImage(index) {
      this.currentFlyerImageIndex = index
    },

    previousRecipe() {
      if (this.currentRecipeIndex > 0) {
        this.currentRecipeIndex--
      }
    },

    nextRecipe() {
      if (this.currentRecipeIndex < this.recipes.length - 1) {
        this.currentRecipeIndex++
      }
    },

    goToRecipe(index) {
      this.currentRecipeIndex = index
    },

    async generateRecipes() {
      if (!this.selectedStore?.id) return

      try {
        this.isLoadingRecipe = true
        this.activeTab = 'recipe'
        const data = await api.generateRecipe(this.selectedStore.id)
        this.recipes = data.recipes || []
        this.currentRecipeIndex = 0
      } catch (err) {
        console.error('レシピ生成に失敗しました:', err)
        this.recipes = []
      } finally {
        this.isLoadingRecipe = false
      }
    },

    shareSNS(platform) {
      const recipe = this.recipes[this.currentRecipeIndex]
      if (!recipe) return

      const text = `${this.selectedStore.name}のチラシから「${recipe.title}」のレシピを提案してもらいました！ #チラシキッチン`
      const url = window.location.origin

      switch (platform) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            '_blank'
          )
          break
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
            '_blank'
          )
          break
        case 'instagram':
          // InstagramはWebからの直接共有が制限されているため、クリップボードにコピー
          navigator.clipboard.writeText(text + '\n' + url)
          alert('投稿内容をクリップボードにコピーしました。Instagramアプリで貼り付けてください。')
          break
      }
    }
  }
}
</script>

<style scoped>
.mypage {
  min-height: calc(100vh - 70px);
  background-color: var(--bg-light);
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ページヘッダー */
.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

/* セクション */
.favorites-section,
.notification-settings-section {
  background-color: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 28px;
}

.section-count {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
  background-color: rgba(102, 126, 234, 0.1);
  padding: 6px 16px;
  border-radius: 20px;
}

/* 空の状態 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-text {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.empty-subtext {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.btn-primary {
  display: inline-block;
  padding: 12px 32px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 店舗カードグリッド */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.store-card {
  background-color: white;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.store-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.store-card-content {
  padding: 20px;
  cursor: pointer;
}

.store-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.store-name {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary);
  flex: 1;
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px;
  flex-shrink: 0;
}

.favorite-btn.active {
  filter: grayscale(0);
}

.favorite-btn:hover {
  transform: scale(1.2);
}

.store-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.info-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.info-text {
  flex: 1;
  line-height: 1.5;
}

.store-card-footer {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  text-align: right;
}

.view-flyer-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

/* 通知トグルセクション */
.notification-toggle-section {
  padding: 16px 20px;
  background-color: var(--bg-light);
  border-top: 1px solid var(--border-color);
}

.toggle-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-icon {
  font-size: 18px;
}

.toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

/* スイッチトグル */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 26px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.switch input:checked + .slider {
  background-color: var(--primary-color);
}

.switch input:checked + .slider:before {
  transform: translateX(24px);
}

/* 通知設定セクション */
.notification-settings-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-card {
  background-color: var(--bg-light);
  border-radius: 12px;
  padding: 24px;
}

.settings-subtitle {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
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
  background-color: white;
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

/* 保存セクション */
.save-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-top: 8px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-block;
}

.btn-large {
  min-width: 200px;
  padding: 14px 32px;
}

.btn-outline {
  background-color: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.btn-outline:hover {
  background-color: var(--primary-color);
  color: white;
}

.btn-secondary {
  background-color: white;
  color: var(--text-secondary);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover {
  border-color: var(--text-primary);
  color: var(--text-primary);
}

.btn-danger {
  background-color: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  opacity: 0.9;
  transform: translateY(-2px);
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

/* 確認モーダル */
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

.confirm-modal {
  max-width: 500px;
  width: 100%;
  padding: 40px 32px;
  text-align: center;
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

.confirm-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.confirm-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.confirm-body {
  margin-bottom: 32px;
}

.confirm-store-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 12px;
}

.confirm-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

@media (max-width: 768px) {
  .mypage {
    padding: 24px 16px;
  }

  .page-header {
    margin-bottom: 32px;
  }

  .page-title {
    font-size: 28px;
  }

  .favorites-section,
  .notification-settings-section {
    padding: 20px 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .section-title {
    font-size: 20px;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .store-card-content {
    padding: 16px;
  }

  .store-name {
    font-size: 18px;
  }

  .confirm-modal {
    padding: 32px 24px;
  }

  .confirm-title {
    font-size: 20px;
  }

  .confirm-actions {
    flex-direction: column;
  }

  .notification-actions {
    flex-direction: column;
  }
}
</style>
