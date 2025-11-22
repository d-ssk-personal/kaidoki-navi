<template>
  <div class="admin-store-form">
    <div class="admin-header">
      <div class="header-left">
        <h1 class="page-title">{{ isEditMode ? '店舗編集' : '店舗追加' }}</h1>
        <!-- パンくずリスト -->
        <nav class="breadcrumb">
          <router-link to="/admin">管理画面</router-link>
          <span class="separator">›</span>
          <router-link to="/admin/stores">店舗管理</router-link>
          <span class="separator">›</span>
          <span class="current">{{ isEditMode ? '店舗編集' : '店舗追加' }}</span>
        </nav>
      </div>
      <button @click="handleLogout" class="logout-button">
        ログアウト
      </button>
    </div>

    <div class="page-content">
      <form @submit.prevent="handleSubmit" class="store-form">
        <!-- 企業ID -->
        <div class="form-group">
          <label for="companyId" class="form-label required">企業ID</label>
          <input
            id="companyId"
            v-model="form.companyId"
            type="text"
            class="form-input"
            placeholder="自動生成されます"
            :disabled="true"
          />
          <p class="form-hint">企業IDは自動生成されます（変更不可）</p>
        </div>

        <!-- 店舗ID -->
        <div class="form-group">
          <label for="storeId" class="form-label required">店舗ID</label>
          <input
            id="storeId"
            v-model="form.storeId"
            type="text"
            class="form-input"
            placeholder="自動生成されます"
            :disabled="true"
          />
          <p class="form-hint">店舗IDは自動生成されます（変更不可）</p>
        </div>

        <!-- 店舗名 -->
        <div class="form-group">
          <label for="name" class="form-label required">店舗名</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="店舗名を入力"
            required
          />
        </div>

        <!-- 住所 -->
        <div class="form-group">
          <label for="address" class="form-label required">住所</label>
          <input
            id="address"
            v-model="form.address"
            type="text"
            class="form-input"
            placeholder="住所を入力"
            required
          />
        </div>

        <!-- 電話番号 -->
        <div class="form-group">
          <label for="phone" class="form-label required">電話番号</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            class="form-input"
            placeholder="03-1234-5678"
            required
          />
        </div>

        <!-- 営業時間 -->
        <div class="form-group">
          <label for="businessHours" class="form-label">営業時間</label>
          <input
            id="businessHours"
            v-model="form.businessHours"
            type="text"
            class="form-input"
            placeholder="例: 9:00-21:00"
          />
        </div>

        <!-- ステータス -->
        <div class="form-group">
          <label class="form-label required">ステータス</label>
          <div class="radio-group">
            <label class="radio-label">
              <input
                type="radio"
                v-model="form.status"
                value="active"
                class="radio-input"
              />
              <span class="radio-text">有効</span>
            </label>
            <label class="radio-label">
              <input
                type="radio"
                v-model="form.status"
                value="inactive"
                class="radio-input"
              />
              <span class="radio-text">無効</span>
            </label>
          </div>
        </div>

        <!-- エラーメッセージ -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- フォームアクション -->
        <div class="form-actions">
          <button
            type="button"
            @click="goBack"
            class="btn btn-cancel"
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="btn btn-submit"
            :disabled="loading"
          >
            {{ loading ? '処理中...' : '登録内容を確認' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 確認モーダル -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">登録内容の確認</h2>
        </div>

        <div class="modal-body">
          <div class="confirm-item">
            <span class="confirm-label">企業ID:</span>
            <span class="confirm-value">{{ form.companyId || '（自動生成）' }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">店舗ID:</span>
            <span class="confirm-value">{{ form.storeId || '（自動生成）' }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">店舗名:</span>
            <span class="confirm-value">{{ form.name }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">住所:</span>
            <span class="confirm-value">{{ form.address }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">電話番号:</span>
            <span class="confirm-value">{{ form.phone }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">営業時間:</span>
            <span class="confirm-value">{{ form.businessHours || '未設定' }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">ステータス:</span>
            <span class="confirm-value">{{ form.status === 'active' ? '有効' : '無効' }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-cancel">
            キャンセル
          </button>
          <button @click="confirmSave" class="btn btn-submit">
            {{ isEditMode ? '更新する' : '登録する' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAdminStore } from '@/store/admin'
import api from '@/services/api'

export default {
  name: 'StoreForm',
  data() {
    return {
      form: {
        companyId: '',
        storeId: '',
        name: '',
        address: '',
        phone: '',
        businessHours: '',
        status: 'active'
      },
      showConfirmModal: false,
      errorMessage: '',
      loading: false
    }
  },
  setup() {
    const adminStore = useAdminStore()
    return { adminStore }
  },
  computed: {
    isEditMode() {
      return !!this.$route.params.id
    }
  },
  methods: {
    handleSubmit() {
      this.errorMessage = ''
      this.showConfirmModal = true
    },
    closeModal() {
      this.showConfirmModal = false
    },
    async confirmSave() {
      this.loading = true
      this.errorMessage = ''

      try {
        const storeData = {
          name: this.form.name,
          address: this.form.address,
          phone: this.form.phone,
          businessHours: this.form.businessHours,
          status: this.form.status
        }

        if (this.isEditMode) {
          await api.admin.updateStore(this.$route.params.id, storeData)
          alert('店舗情報を更新しました')
        } else {
          await api.admin.createStore(storeData)
          alert('店舗を登録しました')
        }
        this.$router.push('/admin/stores')
      } catch (error) {
        this.errorMessage = '処理中にエラーが発生しました'
        console.error('Save error:', error)
      } finally {
        this.loading = false
        this.showConfirmModal = false
      }
    },
    async loadStore() {
      if (this.isEditMode) {
        this.loading = true
        try {
          const response = await api.admin.getStores({ id: this.$route.params.id })
          const store = response.stores && response.stores.length > 0 ? response.stores[0] : null

          if (store) {
            this.form.companyId = store.companyId
            this.form.storeId = store.storeId
            this.form.name = store.name
            this.form.address = store.address
            this.form.phone = store.phone
            this.form.businessHours = store.businessHours
            this.form.status = store.status
          } else {
            alert('店舗が見つかりませんでした')
            this.$router.push('/admin/stores')
          }
        } catch (error) {
          console.error('Load store error:', error)
          alert('店舗データの取得に失敗しました')
          this.$router.push('/admin/stores')
        } finally {
          this.loading = false
        }
      } else {
        // 新規作成時は企業IDと店舗IDを空にする
        this.form.companyId = ''
        this.form.storeId = ''
      }
    },
    goBack() {
      if (confirm('入力内容は破棄されます。よろしいですか？')) {
        this.$router.push('/admin/stores')
      }
    },
    handleLogout() {
      if (confirm('ログアウトしますか？')) {
        this.adminStore.logout()
        this.$router.push('/admin/login')
      }
    }
  },
  mounted() {
    // 認証チェック
    this.adminStore.checkAuth()
    if (!this.adminStore.isAuthenticated) {
      this.$router.push('/admin/login')
      return
    }

    // 編集モードの場合、店舗データをロード
    this.loadStore()
  }
}
</script>

<style scoped>
.admin-store-form {
  min-height: 100vh;
  background-color: var(--bg-light);
}

.admin-header {
  background-color: white;
  padding: 24px 32px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
}

/* パンくずリスト */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.breadcrumb a {
  color: var(--primary-color);
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.breadcrumb a:hover {
  opacity: 0.7;
  text-decoration: underline;
}

.breadcrumb .separator {
  color: var(--text-secondary);
}

.breadcrumb .current {
  color: var(--text-primary);
  font-weight: 500;
}

.logout-button {
  padding: 10px 20px;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.page-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 32px;
}

.store-form {
  background-color: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-label.required::after {
  content: ' *';
  color: var(--danger-color);
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--primary-color);
}

.form-input:disabled {
  background-color: var(--bg-light);
  cursor: not-allowed;
  opacity: 0.6;
}

.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.radio-group {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.radio-label:hover {
  border-color: var(--primary-color);
  background-color: var(--bg-light);
}

.radio-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.radio-input:checked + .radio-text {
  font-weight: 600;
  color: var(--primary-color);
}

.radio-label:has(.radio-input:checked) {
  border-color: var(--primary-color);
  background-color: #eff6ff;
}

.radio-text {
  font-size: 16px;
  color: var(--text-primary);
}

.error-message {
  padding: 12px 16px;
  background-color: #fee;
  border: 1px solid var(--danger-color);
  border-radius: 8px;
  color: var(--danger-color);
  font-size: 14px;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid var(--border-color);
}

.btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background-color: var(--bg-light);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.btn-cancel:hover {
  background-color: #e5e7eb;
}

.btn-submit {
  background-color: var(--primary-color);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px;
  border-bottom: 2px solid var(--border-color);
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
}

.confirm-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.confirm-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.confirm-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.confirm-value {
  display: block;
  font-size: 16px;
  color: var(--text-primary);
}

.modal-footer {
  padding: 24px;
  border-top: 2px solid var(--border-color);
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .admin-header {
    padding: 16px 20px;
  }

  .page-title {
    font-size: 22px;
  }

  .page-content {
    padding: 24px 20px;
  }

  .store-form {
    padding: 20px;
  }

  .radio-group {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }
}
</style>
