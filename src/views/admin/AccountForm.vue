<template>
  <div class="admin-account-form">
    <div class="admin-header">
      <div class="header-left">
        <h1 class="page-title">{{ isEditMode ? 'アカウント編集' : 'アカウント追加' }}</h1>
        <!-- パンくずリスト -->
        <nav class="breadcrumb">
          <router-link to="/admin">管理画面</router-link>
          <span class="separator">›</span>
          <router-link to="/admin/accounts">アカウント管理</router-link>
          <span class="separator">›</span>
          <span class="current">{{ isEditMode ? 'アカウント編集' : 'アカウント追加' }}</span>
        </nav>
      </div>
      <button @click="handleLogout" class="logout-button">
        ログアウト
      </button>
    </div>

    <div class="page-content">
      <form @submit.prevent="handleSubmit" class="account-form">
        <!-- 店舗情報セクション（アコーディオン） -->
        <div class="form-section">
          <div class="section-header" @click="toggleStoreInfo">
            <h3 class="section-title">
              店舗情報
              <span class="toggle-icon">{{ isStoreInfoExpanded ? '▼' : '▶' }}</span>
            </h3>
          </div>

          <div v-show="isStoreInfoExpanded" class="section-content">
            <!-- 企業ID -->
            <div class="form-group">
              <label for="companyId" class="form-label">企業ID</label>
              <input
                id="companyId"
                v-model="form.companyId"
                type="text"
                class="form-input"
                disabled
              />
            </div>

            <!-- 企業名 -->
            <div class="form-group">
              <label for="companyName" class="form-label">企業名</label>
              <input
                id="companyName"
                v-model="form.companyName"
                type="text"
                class="form-input"
                disabled
              />
            </div>

            <!-- 店舗ID -->
            <div class="form-group">
              <label for="storeId" class="form-label">店舗ID</label>
              <input
                id="storeId"
                v-model="form.storeId"
                type="text"
                class="form-input"
                disabled
              />
            </div>

            <!-- 店舗名 -->
            <div class="form-group">
              <label for="storeName" class="form-label">店舗名</label>
              <input
                id="storeName"
                v-model="form.storeName"
                type="text"
                class="form-input"
                disabled
              />
            </div>
          </div>
        </div>

        <!-- アカウント情報セクション -->
        <div class="form-section expanded">
          <div class="section-header">
            <h3 class="section-title">アカウント情報</h3>
          </div>

          <div class="section-content">
            <!-- アカウントID -->
            <div class="form-group">
              <label for="accountId" class="form-label required">アカウントID</label>
              <input
                id="accountId"
                v-model="form.accountId"
                type="text"
                class="form-input"
                placeholder="アカウントIDを入力"
                :disabled="isEditMode"
                required
              />
              <p v-if="isEditMode" class="form-hint">アカウントIDは変更できません</p>
            </div>

            <!-- パスワード -->
            <div class="form-group">
              <label for="password" class="form-label required">パスワード</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-input"
                placeholder="パスワードを入力"
                required
              />
            </div>

            <!-- パスワード（確認用） -->
            <div class="form-group">
              <label for="passwordConfirm" class="form-label required">パスワード（確認用）</label>
              <input
                id="passwordConfirm"
                v-model="form.passwordConfirm"
                type="password"
                class="form-input"
                placeholder="パスワードを再入力"
                required
              />
              <p v-if="passwordMismatch" class="form-error">パスワードが一致しません</p>
            </div>
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
            :disabled="loading || passwordMismatch"
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
          <div class="confirm-section">
            <h4 class="confirm-section-title">店舗情報</h4>
            <div class="confirm-item">
              <span class="confirm-label">企業ID:</span>
              <span class="confirm-value">{{ form.companyId }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">企業名:</span>
              <span class="confirm-value">{{ form.companyName }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">店舗ID:</span>
              <span class="confirm-value">{{ form.storeId }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">店舗名:</span>
              <span class="confirm-value">{{ form.storeName }}</span>
            </div>
          </div>

          <div class="confirm-section">
            <h4 class="confirm-section-title">アカウント情報</h4>
            <div class="confirm-item">
              <span class="confirm-label">アカウントID:</span>
              <span class="confirm-value">{{ form.accountId }}</span>
            </div>
            <div class="confirm-item">
              <span class="confirm-label">パスワード:</span>
              <span class="confirm-value">******</span>
            </div>
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
  name: 'AccountForm',
  data() {
    return {
      form: {
        companyId: '',
        companyName: '',
        storeId: '',
        storeName: '',
        accountId: '',
        password: '',
        passwordConfirm: ''
      },
      isStoreInfoExpanded: false,
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
    },
    passwordMismatch() {
      return this.form.password !== '' &&
             this.form.passwordConfirm !== '' &&
             this.form.password !== this.form.passwordConfirm
    }
  },
  methods: {
    toggleStoreInfo() {
      this.isStoreInfoExpanded = !this.isStoreInfoExpanded
    },
    handleSubmit() {
      if (this.passwordMismatch) {
        this.errorMessage = 'パスワードが一致しません'
        return
      }
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
        const accountData = {
          accountId: this.form.accountId,
          password: this.form.password,
          companyId: this.form.companyId,
          storeId: this.form.storeId
        }

        if (this.isEditMode) {
          await api.admin.updateAccount(this.$route.params.id, accountData)
          alert('アカウント情報を更新しました')
        } else {
          await api.admin.createAccount(accountData)
          alert('アカウントを登録しました')
        }
        this.$router.push('/admin/accounts')
      } catch (error) {
        this.errorMessage = '処理中にエラーが発生しました'
        console.error('Save error:', error)
      } finally {
        this.loading = false
        this.showConfirmModal = false
      }
    },
    async loadAccount() {
      if (this.isEditMode) {
        this.loading = true
        try {
          const response = await api.admin.getAccounts({ id: this.$route.params.id })
          const account = response.accounts && response.accounts.length > 0 ? response.accounts[0] : null

          if (account) {
            this.form.companyId = account.companyId
            this.form.companyName = account.companyName
            this.form.storeId = account.storeId
            this.form.storeName = account.storeName
            this.form.accountId = account.accountId
            // パスワードは空にしておく
            this.form.password = ''
            this.form.passwordConfirm = ''
          } else {
            alert('アカウントが見つかりませんでした')
            this.$router.push('/admin/accounts')
          }
        } catch (error) {
          console.error('Load account error:', error)
          alert('アカウントデータの取得に失敗しました')
          this.$router.push('/admin/accounts')
        } finally {
          this.loading = false
        }
      } else {
        // 新規作成時はログインユーザーの情報を取得
        if (this.adminStore.isSystemAdmin) {
          // システム管理者は任意の企業・店舗を選択できる（実際はフォームで選択）
          this.form.companyId = 'COMP001'
          this.form.companyName = '株式会社マルエツ'
          this.form.storeId = 'STORE001'
          this.form.storeName = 'マルエツ赤坂店'
        } else if (this.adminStore.isCompanyAdmin) {
          // 企業管理者は自社の店舗のみ
          this.form.companyId = this.adminStore.userCompanyId
          this.form.companyName = '株式会社マルエツ' // 実際はAPIから取得
          // 店舗は選択できる（実際はフォームで選択）
          this.form.storeId = 'STORE001'
          this.form.storeName = 'マルエツ赤坂店'
        } else if (this.adminStore.isStoreUser) {
          // 店舗ユーザーは新規作成不可（画面には来ないはず）
          this.form.companyId = this.adminStore.userCompanyId
          this.form.storeId = this.adminStore.userStoreId
        }
      }
    },
    goBack() {
      if (confirm('入力内容は破棄されます。よろしいですか？')) {
        this.$router.push('/admin/accounts')
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

    // 権限チェック
    if (!this.isEditMode) {
      // 新規作成はシステム管理者と企業管理者のみ
      if (!this.adminStore.isSystemAdmin && !this.adminStore.isCompanyAdmin) {
        alert('この機能はシステム管理者または企業管理者のみ利用可能です')
        this.$router.push('/admin/accounts')
        return
      }
    }

    // アカウントデータをロード
    this.loadAccount()
  }
}
</script>

<style scoped>
.admin-account-form {
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

.account-form {
  background-color: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* セクション */
.form-section {
  margin-bottom: 32px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.form-section.expanded {
  border-color: var(--primary-color);
}

.section-header {
  background-color: var(--bg-light);
  padding: 16px 24px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.form-section:not(.expanded) .section-header:hover {
  background-color: #e5e7eb;
}

.form-section.expanded .section-header {
  background-color: var(--primary-color);
  cursor: default;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-section.expanded .section-title {
  color: white;
}

.toggle-icon {
  font-size: 14px;
  margin-left: 8px;
}

.section-content {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group:last-child {
  margin-bottom: 0;
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

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-input:focus {
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

.form-error {
  margin-top: 6px;
  font-size: 12px;
  color: var(--danger-color);
  font-weight: 600;
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
  margin: 0;
}

.modal-body {
  padding: 24px;
}

.confirm-section {
  margin-bottom: 24px;
}

.confirm-section:last-child {
  margin-bottom: 0;
}

.confirm-section-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-color);
}

.confirm-item {
  margin-bottom: 16px;
  padding-bottom: 16px;
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

  .account-form {
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
