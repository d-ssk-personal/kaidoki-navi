<template>
  <div class="admin-company-form">
    <div class="admin-header">
      <div class="header-left">
        <h1 class="page-title">{{ isEditMode ? '企業編集' : '企業追加' }}</h1>
        <!-- パンくずリスト -->
        <nav class="breadcrumb">
          <router-link to="/admin">管理画面</router-link>
          <span class="separator">›</span>
          <router-link to="/admin/companies">企業管理</router-link>
          <span class="separator">›</span>
          <span class="current">{{ isEditMode ? '企業編集' : '企業追加' }}</span>
        </nav>
      </div>
      <button @click="handleLogout" class="logout-button">
        ログアウト
      </button>
    </div>

    <div class="page-content">
      <form @submit.prevent="handleSubmit" class="company-form">
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

        <!-- 企業名 -->
        <div class="form-group">
          <label for="name" class="form-label required">企業名</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="企業名を入力"
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

        <!-- 担当者氏名 -->
        <div class="form-group">
          <label for="contactName" class="form-label required">担当者氏名</label>
          <input
            id="contactName"
            v-model="form.contactName"
            type="text"
            class="form-input"
            placeholder="担当者氏名を入力"
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

        <!-- メールアドレス -->
        <div class="form-group">
          <label for="email" class="form-label required">メールアドレス</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="example@company.co.jp"
            required
          />
        </div>

        <!-- 契約状態 -->
        <div class="form-group">
          <label for="contractStatus" class="form-label required">契約状態</label>
          <select
            id="contractStatus"
            v-model="form.contractStatus"
            class="form-select"
            required
          >
            <option value="">契約状態を選択</option>
            <option value="active">有効</option>
            <option value="expired">期限切れ</option>
            <option value="suspended">停止中</option>
          </select>
        </div>

        <!-- 契約プラン -->
        <div class="form-group">
          <label for="contractPlan" class="form-label required">契約プラン</label>
          <select
            id="contractPlan"
            v-model="form.contractPlan"
            class="form-select"
            required
          >
            <option value="">契約プランを選択</option>
            <option value="basic">ベーシック</option>
            <option value="standard">スタンダード</option>
            <option value="premium">プレミアム</option>
          </select>
        </div>

        <!-- 契約開始日 -->
        <div class="form-group">
          <label for="contractStartDate" class="form-label required">契約開始日</label>
          <input
            id="contractStartDate"
            v-model="form.contractStartDate"
            type="date"
            class="form-input"
            required
          />
        </div>

        <!-- 契約終了日 -->
        <div class="form-group">
          <label for="contractEndDate" class="form-label required">契約終了日</label>
          <input
            id="contractEndDate"
            v-model="form.contractEndDate"
            type="date"
            class="form-input"
            required
          />
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
            <span class="confirm-label">企業名:</span>
            <span class="confirm-value">{{ form.name }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">住所:</span>
            <span class="confirm-value">{{ form.address }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">担当者氏名:</span>
            <span class="confirm-value">{{ form.contactName }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">電話番号:</span>
            <span class="confirm-value">{{ form.phone }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">メールアドレス:</span>
            <span class="confirm-value">{{ form.email }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">契約状態:</span>
            <span class="confirm-value">{{ getStatusLabel(form.contractStatus) }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">契約プラン:</span>
            <span class="confirm-value">{{ getPlanLabel(form.contractPlan) }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">契約開始日:</span>
            <span class="confirm-value">{{ formatDate(form.contractStartDate) }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">契約終了日:</span>
            <span class="confirm-value">{{ formatDate(form.contractEndDate) }}</span>
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

export default {
  name: 'CompanyForm',
  data() {
    return {
      form: {
        companyId: '',
        name: '',
        address: '',
        contactName: '',
        phone: '',
        email: '',
        contractStatus: '',
        contractPlan: '',
        contractStartDate: '',
        contractEndDate: ''
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

      // 契約期間のバリデーション
      if (this.form.contractStartDate && this.form.contractEndDate) {
        const startDate = new Date(this.form.contractStartDate)
        const endDate = new Date(this.form.contractEndDate)

        if (startDate > endDate) {
          this.errorMessage = '契約終了日は契約開始日より後の日付を設定してください'
          return
        }
      }

      this.showConfirmModal = true
    },
    closeModal() {
      this.showConfirmModal = false
    },
    async confirmSave() {
      this.loading = true
      this.errorMessage = ''

      try {
        // 実際はAPIでデータを送信
        await new Promise(resolve => setTimeout(resolve, 500))

        if (this.isEditMode) {
          alert('企業情報を更新しました')
        } else {
          alert('企業を登録しました')
        }
        this.$router.push('/admin/companies')
      } catch (error) {
        this.errorMessage = '処理中にエラーが発生しました'
        console.error('Save error:', error)
      } finally {
        this.loading = false
        this.showConfirmModal = false
      }
    },
    getStatusLabel(status) {
      const labels = {
        active: '有効',
        expired: '期限切れ',
        suspended: '停止中'
      }
      return labels[status] || status
    },
    getPlanLabel(plan) {
      const labels = {
        basic: 'ベーシック',
        standard: 'スタンダード',
        premium: 'プレミアム'
      }
      return labels[plan] || plan
    },
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },
    loadCompany() {
      if (this.isEditMode) {
        // 実際はAPIから企業データを取得
        // ダミーデータ
        const dummyCompany = {
          id: this.$route.params.id,
          companyId: 'COMP001',
          name: '株式会社サンプル商事',
          address: '東京都千代田区丸の内1-1-1',
          contactName: '山田太郎',
          phone: '03-1234-5678',
          email: 'yamada@sample.co.jp',
          contractStatus: 'active',
          contractPlan: 'premium',
          contractStartDate: '2024-01-01',
          contractEndDate: '2025-12-31'
        }

        this.form.companyId = dummyCompany.companyId
        this.form.name = dummyCompany.name
        this.form.address = dummyCompany.address
        this.form.contactName = dummyCompany.contactName
        this.form.phone = dummyCompany.phone
        this.form.email = dummyCompany.email
        this.form.contractStatus = dummyCompany.contractStatus
        this.form.contractPlan = dummyCompany.contractPlan
        this.form.contractStartDate = dummyCompany.contractStartDate
        this.form.contractEndDate = dummyCompany.contractEndDate
      } else {
        // 新規作成時は企業IDを空にする
        this.form.companyId = ''
      }
    },
    goBack() {
      if (confirm('入力内容は破棄されます。よろしいですか？')) {
        this.$router.push('/admin/companies')
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
    // システム管理者のみアクセス可能
    if (!this.adminStore.isSystemAdmin) {
      alert('この機能はシステム管理者のみ利用できます')
      this.$router.push('/admin')
      return
    }

    // 編集モードの場合、企業データをロード
    this.loadCompany()
  }
}
</script>

<style scoped>
.admin-company-form {
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

.company-form {
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

  .company-form {
    padding: 20px;
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
