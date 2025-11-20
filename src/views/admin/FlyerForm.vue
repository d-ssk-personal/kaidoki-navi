<template>
  <div class="flyer-form">
    <!-- パンくずリスト -->
    <nav class="breadcrumb">
      <router-link to="/admin" class="breadcrumb-item">管理者トップ</router-link>
      <span class="breadcrumb-separator">›</span>
      <router-link to="/admin/flyers" class="breadcrumb-item">チラシ管理</router-link>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item active">{{ isEditMode ? 'チラシ編集' : 'チラシ追加' }}</span>
    </nav>

    <div class="page-header">
      <h1 class="page-title">{{ isEditMode ? 'チラシ編集' : 'チラシ追加' }}</h1>
      <p class="page-description">チラシ情報を入力してください</p>
    </div>

    <div class="form-container">
      <form @submit.prevent="showConfirmModal" class="flyer-form-content">
        <!-- 企業ID -->
        <div class="form-group">
          <label class="form-label">企業ID</label>
          <input
            v-model="form.companyId"
            type="text"
            class="form-input"
            disabled
          />
        </div>

        <!-- 店舗ID -->
        <div class="form-group">
          <label class="form-label">店舗ID</label>
          <input
            v-model="form.storeId"
            type="text"
            class="form-input"
            disabled
          />
        </div>

        <!-- 企業名 -->
        <div class="form-group">
          <label class="form-label">企業名</label>
          <input
            v-model="form.companyName"
            type="text"
            class="form-input"
            disabled
          />
        </div>

        <!-- 店舗名 -->
        <div class="form-group">
          <label class="form-label">店舗名</label>
          <input
            v-model="form.storeName"
            type="text"
            class="form-input"
            disabled
          />
        </div>

        <!-- 住所 -->
        <div class="form-group">
          <label class="form-label">住所</label>
          <input
            v-model="form.address"
            type="text"
            class="form-input"
            disabled
          />
        </div>

        <!-- チラシタイトル -->
        <div class="form-group">
          <label class="form-label required">チラシタイトル</label>
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="チラシタイトルを入力してください"
            required
          />
        </div>

        <!-- チラシ画像 -->
        <div class="form-group">
          <label class="form-label">チラシ画像（最大5枚）</label>
          <div class="image-upload-section">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              @change="handleFileChange"
              class="file-input"
            />
            <button
              type="button"
              class="btn-upload"
              @click="$refs.fileInput.click()"
              :disabled="form.images.length >= 5"
            >
              + 画像を選択
            </button>
            <p class="upload-hint">
              {{ form.images.length }}/5 枚選択済み
            </p>
          </div>

          <!-- 画像プレビュー -->
          <div v-if="form.images.length > 0" class="image-previews">
            <div
              v-for="(image, index) in form.images"
              :key="index"
              class="image-preview"
            >
              <img :src="image.preview" :alt="`画像 ${index + 1}`" />
              <button
                type="button"
                class="btn-remove-image"
                @click="removeImage(index)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- 掲載期間 -->
        <div class="form-group">
          <label class="form-label required">掲載期間</label>
          <div class="period-row">
            <input
              v-model="form.periodFrom"
              type="date"
              class="form-input period-input"
              required
            />
            <span class="period-separator">〜</span>
            <input
              v-model="form.periodTo"
              type="date"
              class="form-input period-input"
              required
            />
          </div>
          <p v-if="periodToError" class="error-message">
            {{ periodToError }}
          </p>
        </div>

        <!-- チラシカテゴリ -->
        <div class="form-group">
          <label class="form-label required">チラシカテゴリ</label>
          <select
            v-model="form.category"
            class="form-input"
            required
          >
            <option value="">カテゴリを選択してください</option>
            <option value="food">食品</option>
            <option value="daily">日用品</option>
            <option value="electronics">家電</option>
            <option value="fashion">ファッション</option>
            <option value="other">その他</option>
          </select>
        </div>

        <!-- 掲載ステータス -->
        <div class="form-group">
          <label class="form-label required">掲載ステータス</label>
          <select
            v-model="form.status"
            class="form-input"
            required
          >
            <option value="active">掲載中</option>
            <option value="inactive">掲載終了</option>
            <option value="scheduled">掲載予定</option>
          </select>
        </div>

        <!-- フォームアクション -->
        <div class="form-actions">
          <router-link to="/admin/flyers" class="btn-cancel">
            キャンセル
          </router-link>
          <button type="submit" class="btn-submit">
            {{ isEditMode ? '更新' : '登録' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 確認モーダル -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">確認</h2>
        <p class="modal-message">
          この内容で{{ isEditMode ? '更新' : '登録' }}しますか？
        </p>
        <div class="modal-details">
          <div class="detail-row">
            <span class="detail-label">企業ID:</span>
            <span class="detail-value">{{ form.companyId }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">企業名:</span>
            <span class="detail-value">{{ form.companyName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">店舗ID:</span>
            <span class="detail-value">{{ form.storeId }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">店舗名:</span>
            <span class="detail-value">{{ form.storeName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">住所:</span>
            <span class="detail-value">{{ form.address }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">チラシタイトル:</span>
            <span class="detail-value">{{ form.title }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">チラシ画像:</span>
            <span class="detail-value">{{ form.images.length }}枚</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">掲載期間:</span>
            <span class="detail-value">
              {{ formatDate(form.periodFrom) }} 〜 {{ formatDate(form.periodTo) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">チラシカテゴリ:</span>
            <span class="detail-value">{{ getCategoryLabel(form.category) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">掲載ステータス:</span>
            <span class="detail-value">{{ getStatusLabel(form.status) }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-modal-cancel" @click="closeModal">
            キャンセル
          </button>
          <button type="button" class="btn-modal-confirm" @click="submitForm">
            {{ isEditMode ? '更新' : '登録' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAdminStore } from '@/store/admin'

export default {
  name: 'FlyerForm',
  setup() {
    const adminStore = useAdminStore()
    return { adminStore }
  },
  data() {
    return {
      isEditMode: false,
      showModal: false,
      form: {
        companyId: '',
        storeId: '',
        companyName: '',
        storeName: '',
        address: '',
        title: '',
        images: [],
        periodFrom: '',
        periodTo: '',
        category: '',
        status: 'active'
      }
    }
  },
  computed: {
    periodToError() {
      if (this.form.periodFrom && this.form.periodTo) {
        if (this.form.periodTo < this.form.periodFrom) {
          return '掲載期間Toは掲載期間From以降の日付を選択してください'
        }
      }
      return ''
    }
  },
  mounted() {
    // 認証チェック
    this.adminStore.checkAuth()
    if (!this.adminStore.isAuthenticated) {
      this.$router.push('/admin/login')
      return
    }

    // 編集モードチェック
    const flyerId = this.$route.params.id
    if (flyerId) {
      this.isEditMode = true
      this.loadFlyer(flyerId)
    }
  },
  methods: {
    loadFlyer(id) {
      // 実際のAPIからデータを取得する場合はここで実装
      // ダミーデータで初期化
      const dummyFlyer = {
        id: id,
        companyId: 'COMP001',
        storeId: 'STORE001',
        companyName: '株式会社ABC商事',
        storeName: 'スーパーマーケット ABC',
        address: '東京都渋谷区渋谷1-1-1',
        title: '週末限定セール',
        images: [
          { preview: 'https://via.placeholder.com/300x200?text=Flyer+1' },
          { preview: 'https://via.placeholder.com/300x200?text=Flyer+2' }
        ],
        periodFrom: '2024-01-15',
        periodTo: '2024-01-21',
        category: 'food',
        status: 'active'
      }

      this.form = {
        companyId: dummyFlyer.companyId,
        storeId: dummyFlyer.storeId,
        companyName: dummyFlyer.companyName,
        storeName: dummyFlyer.storeName,
        address: dummyFlyer.address,
        title: dummyFlyer.title,
        images: dummyFlyer.images,
        periodFrom: dummyFlyer.periodFrom,
        periodTo: dummyFlyer.periodTo,
        category: dummyFlyer.category,
        status: dummyFlyer.status
      }
    },
    handleFileChange(event) {
      const files = Array.from(event.target.files)
      const remainingSlots = 5 - this.form.images.length

      if (files.length > remainingSlots) {
        alert(`画像は最大5枚までです。現在${this.form.images.length}枚選択済みです。`)
        return
      }

      files.forEach(file => {
        if (this.form.images.length >= 5) return

        // ファイルサイズチェック（5MB以下）
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} のサイズが大きすぎます（最大5MB）`)
          return
        }

        // プレビュー用のURLを生成
        const reader = new FileReader()
        reader.onload = (e) => {
          this.form.images.push({
            file: file,
            preview: e.target.result
          })
        }
        reader.readAsDataURL(file)
      })

      // input をリセット
      event.target.value = ''
    },
    removeImage(index) {
      this.form.images.splice(index, 1)
    },
    showConfirmModal() {
      // バリデーション
      if (!this.form.title) {
        alert('チラシタイトルを入力してください')
        return
      }

      if (!this.form.periodFrom || !this.form.periodTo) {
        alert('掲載期間を入力してください')
        return
      }

      if (this.periodToError) {
        alert(this.periodToError)
        return
      }

      if (!this.form.category) {
        alert('チラシカテゴリを選択してください')
        return
      }

      if (!this.form.status) {
        alert('掲載ステータスを選択してください')
        return
      }

      this.showModal = true
    },
    closeModal() {
      this.showModal = false
    },
    submitForm() {
      // 実際のAPI呼び出しはここで実装
      console.log('Submitting flyer:', this.form)

      alert(this.isEditMode ? 'チラシを更新しました' : 'チラシを登録しました')
      this.$router.push('/admin/flyers')
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}/${month}/${day}`
    },
    getCategoryLabel(category) {
      const labels = {
        food: '食品',
        daily: '日用品',
        electronics: '家電',
        fashion: 'ファッション',
        other: 'その他'
      }
      return labels[category] || category
    },
    getStatusLabel(status) {
      const labels = {
        active: '掲載中',
        inactive: '掲載終了',
        scheduled: '掲載予定'
      }
      return labels[status] || status
    }
  }
}
</script>

<style scoped>
.flyer-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

/* パンくずリスト */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  color: var(--text-secondary);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.breadcrumb-item:hover:not(.active) {
  color: var(--primary-color);
}

.breadcrumb-item.active {
  color: var(--text-primary);
  font-weight: 600;
}

.breadcrumb-separator {
  color: var(--text-secondary);
}

/* ページヘッダー */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 40px;
  color: white;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.page-description {
  font-size: 16px;
  opacity: 0.95;
}

/* フォームコンテナ */
.form-container {
  background-color: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.flyer-form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* フォームグループ */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-label.required::after {
  content: ' *';
  color: var(--danger-color);
}

.form-input,
.form-select {
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-input:disabled {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

/* 掲載期間の横並び表示 */
.period-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.period-input {
  flex: 1;
}

.period-separator {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.error-message {
  color: var(--danger-color);
  font-size: 13px;
  margin-top: 4px;
}

/* 画像アップロード */
.image-upload-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-input {
  display: none;
}

.btn-upload {
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-upload:hover:not(:disabled) {
  background-color: #5a67d8;
}

.btn-upload:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.upload-hint {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 画像プレビュー */
.image-previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.image-preview {
  position: relative;
  aspect-ratio: 3/2;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--border-color);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.btn-remove-image:hover {
  background-color: var(--danger-color);
}

/* フォームアクション */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.btn-cancel,
.btn-submit {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-cancel {
  background-color: white;
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.btn-cancel:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-submit {
  background-color: var(--primary-color);
  color: white;
}

.btn-submit:hover {
  background-color: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.modal-message {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.modal-details {
  background-color: var(--bg-light);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: var(--text-primary);
}

.detail-value {
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-modal-cancel,
.btn-modal-confirm {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-modal-cancel {
  background-color: white;
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.btn-modal-cancel:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-modal-confirm {
  background-color: var(--primary-color);
  color: white;
}

.btn-modal-confirm:hover {
  background-color: #5a67d8;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .flyer-form {
    padding: 16px;
  }

  .page-header {
    padding: 24px;
  }

  .page-title {
    font-size: 24px;
  }

  .form-container {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }

  .modal-content {
    padding: 24px;
  }

  .image-previews {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
