<template>
  <div class="admin-account-list">
    <div class="admin-header">
      <div class="header-left">
        <h1 class="page-title">アカウント管理</h1>
        <!-- パンくずリスト -->
        <nav class="breadcrumb">
          <router-link to="/admin">管理画面</router-link>
          <span class="separator">›</span>
          <span class="current">アカウント管理</span>
        </nav>
      </div>
      <button @click="handleLogout" class="logout-button">
        ログアウト
      </button>
    </div>

    <div class="page-content">
      <!-- 検索・フィルターセクション -->
      <div class="search-section">
        <div class="search-row">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="アカウントIDで検索"
            class="search-input"
          />
          <button @click="performSearch" class="btn-search">
            🔍 検索
          </button>
          <button
            v-if="canCreateAccount"
            @click="goToCreatePage"
            class="btn-create"
          >
            ➕ 新規作成
          </button>
        </div>

        <div class="filter-row">
          <div class="filter-group" v-if="adminStore.isSystemAdmin">
            <label class="filter-label">企業ID:</label>
            <input
              v-model="filterCompanyId"
              type="text"
              placeholder="企業IDで検索"
              class="filter-input"
            />
          </div>

          <div class="filter-group" v-if="adminStore.isSystemAdmin">
            <label class="filter-label">企業名:</label>
            <input
              v-model="filterCompanyName"
              type="text"
              placeholder="企業名で検索"
              class="filter-input"
            />
          </div>

          <div class="filter-group" v-if="adminStore.isSystemAdmin || adminStore.isCompanyAdmin">
            <label class="filter-label">店舗ID:</label>
            <input
              v-model="filterStoreId"
              type="text"
              placeholder="店舗IDで検索"
              class="filter-input"
            />
          </div>

          <div class="filter-group" v-if="adminStore.isSystemAdmin || adminStore.isCompanyAdmin">
            <label class="filter-label">店舗名:</label>
            <input
              v-model="filterStoreName"
              type="text"
              placeholder="店舗名で検索"
              class="filter-input"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">アカウントID:</label>
            <input
              v-model="filterAccountId"
              type="text"
              placeholder="アカウントIDで検索"
              class="filter-input"
            />
          </div>
        </div>

        <!-- 一括操作 -->
        <div v-if="selectedIds.length > 0 && canBulkDelete" class="bulk-actions">
          <span class="selected-count">{{ selectedIds.length }}件選択中</span>
          <button @click="confirmBulkDelete" class="btn-bulk btn-delete">
            一括削除
          </button>
        </div>
      </div>

      <!-- アカウント一覧 -->
      <div class="accounts-section">
        <div class="section-header">
          <h2 class="section-title">
            アカウント一覧
            <span class="result-count">（{{ filteredAccounts.length }}件）</span>
          </h2>
        </div>

        <div v-if="loading" class="loading">
          <p>読み込み中...</p>
        </div>

        <div v-else-if="filteredAccounts.length === 0" class="no-results">
          <p>アカウントが見つかりませんでした</p>
        </div>

        <div v-else
          class="table-container"
          ref="tableContainer"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
        >
          <table class="accounts-table">
            <thead>
              <tr>
                <th v-if="canBulkDelete" class="col-checkbox">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th class="col-company-id">企業ID</th>
                <th class="col-company-name">企業名</th>
                <th class="col-store-id">店舗ID</th>
                <th class="col-store-name">店舗名</th>
                <th class="col-account-id">アカウントID</th>
                <th class="col-password">パスワード</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="account in paginatedAccounts"
                :key="account.id"
                :class="{ selected: selectedIds.includes(account.id) }"
              >
                <td v-if="canBulkDelete" class="col-checkbox">
                  <input
                    type="checkbox"
                    :checked="selectedIds.includes(account.id)"
                    @change="toggleSelect(account.id)"
                  />
                </td>
                <td class="col-company-id">
                  {{ account.companyId }}
                </td>
                <td class="col-company-name">
                  {{ account.companyName }}
                </td>
                <td class="col-store-id">
                  {{ account.storeId }}
                </td>
                <td class="col-store-name">
                  {{ account.storeName }}
                </td>
                <td class="col-account-id">
                  {{ account.accountId }}
                </td>
                <td class="col-password">
                  ******
                </td>
                <td class="col-actions">
                  <button
                    @click="goToEditPage(account.id)"
                    class="btn-icon btn-edit"
                    title="編集"
                    :disabled="!canEditAccount(account)"
                  >
                    ✏️
                  </button>
                  <button
                    @click="confirmDelete(account)"
                    class="btn-icon btn-delete"
                    title="削除"
                    :disabled="!canDeleteAccount(account)"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ページネーション -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="goToFirstPage"
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            ≪
          </button>
          <button
            @click="goToPrevPage"
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            ‹
          </button>
          <button
            v-for="page in displayedPages"
            :key="page"
            @click="goToPage(page)"
            :class="['pagination-btn', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
          <button
            @click="goToNextPage"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            ›
          </button>
          <button
            @click="goToLastPage"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            ≫
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAdminStore } from '@/store/admin'

export default {
  name: 'AccountManagement',
  data() {
    return {
      searchQuery: '',
      filterCompanyId: '',
      filterCompanyName: '',
      filterStoreId: '',
      filterStoreName: '',
      filterAccountId: '',
      loading: false,
      selectedIds: [],
      accounts: [],
      allAccounts: [],
      filteredAccounts: [],
      currentPage: 1,
      itemsPerPage: 2,
      isDragging: false,
      startX: 0,
      scrollLeft: 0,
      searchTriggered: false
    }
  },
  setup() {
    const adminStore = useAdminStore()
    return { adminStore }
  },
  computed: {
    paginatedAccounts() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredAccounts.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredAccounts.length / this.itemsPerPage)
    },
    displayedPages() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage

      // 現在のページの前後2ページを表示（最大5ページ）
      let start = Math.max(1, current - 2)
      let end = Math.min(total, current + 2)

      // 5ページ表示できるように調整
      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(total, start + 4)
        } else if (end === total) {
          start = Math.max(1, end - 4)
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    },
    isAllSelected() {
      return this.paginatedAccounts.length > 0 &&
        this.selectedIds.length === this.filteredAccounts.length
    },
    // 新規作成ボタンの活性制御
    canCreateAccount() {
      return this.adminStore.isSystemAdmin || this.adminStore.isCompanyAdmin
    },
    // 一括削除ボタンの活性制御
    canBulkDelete() {
      return this.adminStore.isSystemAdmin || this.adminStore.isCompanyAdmin
    }
  },
  methods: {
    performSearch() {
      let accounts = [...this.allAccounts]

      // 企業管理者は自社のアカウントのみ表示
      if (this.adminStore.isCompanyAdmin) {
        accounts = accounts.filter(a => a.companyId === this.adminStore.userCompanyId)
      }

      // 店舗ユーザーは自店舗のアカウントのみ表示
      if (this.adminStore.isStoreUser) {
        accounts = accounts.filter(a => a.storeId === this.adminStore.userStoreId)
      }

      // アカウントIDで検索
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        accounts = accounts.filter(a =>
          a.accountId.toLowerCase().includes(query)
        )
      }

      // 企業IDフィルター（システム管理者のみ）
      if (this.filterCompanyId.trim() && this.adminStore.isSystemAdmin) {
        const query = this.filterCompanyId.toLowerCase()
        accounts = accounts.filter(a => a.companyId.toLowerCase().includes(query))
      }

      // 企業名フィルター（システム管理者のみ）
      if (this.filterCompanyName.trim() && this.adminStore.isSystemAdmin) {
        const query = this.filterCompanyName.toLowerCase()
        accounts = accounts.filter(a => a.companyName.toLowerCase().includes(query))
      }

      // 店舗IDフィルター（システム管理者または企業管理者のみ）
      if (this.filterStoreId.trim() && (this.adminStore.isSystemAdmin || this.adminStore.isCompanyAdmin)) {
        const query = this.filterStoreId.toLowerCase()
        accounts = accounts.filter(a => a.storeId.toLowerCase().includes(query))
      }

      // 店舗名フィルター（システム管理者または企業管理者のみ）
      if (this.filterStoreName.trim() && (this.adminStore.isSystemAdmin || this.adminStore.isCompanyAdmin)) {
        const query = this.filterStoreName.toLowerCase()
        accounts = accounts.filter(a => a.storeName.toLowerCase().includes(query))
      }

      // アカウントIDフィルター
      if (this.filterAccountId.trim()) {
        const query = this.filterAccountId.toLowerCase()
        accounts = accounts.filter(a => a.accountId.toLowerCase().includes(query))
      }

      this.filteredAccounts = accounts
      this.searchTriggered = true
      this.currentPage = 1
    },
    loadAllAccounts() {
      let accounts = [...this.allAccounts]

      // 企業管理者は自社のアカウントのみ表示
      if (this.adminStore.isCompanyAdmin) {
        accounts = accounts.filter(a => a.companyId === this.adminStore.userCompanyId)
      }

      // 店舗ユーザーは自店舗のアカウントのみ表示
      if (this.adminStore.isStoreUser) {
        accounts = accounts.filter(a => a.storeId === this.adminStore.userStoreId)
      }

      this.filteredAccounts = accounts
    },
    // 編集権限チェック
    canEditAccount(account) {
      // システム管理者と企業管理者は全て編集可能
      if (this.adminStore.isSystemAdmin || this.adminStore.isCompanyAdmin) {
        return true
      }
      // 店舗ユーザーは自分のアカウントのみ編集可能
      if (this.adminStore.isStoreUser) {
        return account.accountId === this.adminStore.adminUser.id
      }
      return false
    },
    // 削除権限チェック
    canDeleteAccount(account) {
      // システム管理者と企業管理者は全て削除可能
      if (this.adminStore.isSystemAdmin || this.adminStore.isCompanyAdmin) {
        return true
      }
      // 店舗ユーザーは削除不可
      return false
    },
    // ページネーション関連
    goToPage(page) {
      this.currentPage = page
    },
    goToFirstPage() {
      this.currentPage = 1
    },
    goToLastPage() {
      this.currentPage = this.totalPages
    },
    goToPrevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    goToNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },
    // ドラッグスクロール関連
    onMouseDown(e) {
      this.isDragging = true
      this.startX = e.pageX - this.$refs.tableContainer.offsetLeft
      this.scrollLeft = this.$refs.tableContainer.scrollLeft
      this.$refs.tableContainer.style.cursor = 'grabbing'
    },
    onMouseMove(e) {
      if (!this.isDragging) return
      e.preventDefault()
      const x = e.pageX - this.$refs.tableContainer.offsetLeft
      const walk = (x - this.startX) * 2
      this.$refs.tableContainer.scrollLeft = this.scrollLeft - walk
    },
    onMouseUp() {
      this.isDragging = false
      if (this.$refs.tableContainer) {
        this.$refs.tableContainer.style.cursor = 'grab'
      }
    },
    goToCreatePage() {
      this.$router.push('/admin/accounts/new')
    },
    goToEditPage(id) {
      this.$router.push(`/admin/accounts/edit/${id}`)
    },
    confirmDelete(account) {
      if (confirm(`「${account.accountId}」を削除しますか？\nこの操作は取り消せません。`)) {
        this.deleteAccount(account.id)
      }
    },
    deleteAccount(id) {
      const index = this.accounts.findIndex(a => a.id === id)
      if (index > -1) {
        this.accounts.splice(index, 1)
        this.allAccounts = [...this.accounts]
        this.selectedIds = this.selectedIds.filter(selectedId => selectedId !== id)
        this.loadAllAccounts()
        alert('アカウントを削除しました')
      }
    },
    toggleSelect(id) {
      const index = this.selectedIds.indexOf(id)
      if (index > -1) {
        this.selectedIds.splice(index, 1)
      } else {
        this.selectedIds.push(id)
      }
    },
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedIds = []
      } else {
        this.selectedIds = this.filteredAccounts.map(account => account.id)
      }
    },
    confirmBulkDelete() {
      if (confirm(`選択した${this.selectedIds.length}件のアカウントを削除しますか？\nこの操作は取り消せません。`)) {
        this.accounts = this.accounts.filter(a => !this.selectedIds.includes(a.id))
        this.allAccounts = [...this.accounts]
        alert('アカウントを削除しました')
        this.selectedIds = []
        this.loadAllAccounts()
      }
    },
    handleLogout() {
      if (confirm('ログアウトしますか？')) {
        this.adminStore.logout()
        this.$router.push('/admin/login')
      }
    },
    loadAccounts() {
      // ダミーデータ（実際はAPIから取得）
      this.accounts = [
        {
          id: 1,
          companyId: 'COMP001',
          companyName: '株式会社マルエツ',
          storeId: 'STORE001',
          storeName: 'マルエツ赤坂店',
          accountId: 'admin',
          password: 'password'
        },
        {
          id: 2,
          companyId: 'COMP001',
          companyName: '株式会社マルエツ',
          storeId: 'STORE002',
          storeName: 'マルエツ浦和店',
          accountId: 'company',
          password: 'password'
        },
        {
          id: 3,
          companyId: 'COMP001',
          companyName: '株式会社マルエツ',
          storeId: 'STORE001',
          storeName: 'マルエツ赤坂店',
          accountId: 'store',
          password: 'password'
        },
        {
          id: 4,
          companyId: 'COMP002',
          companyName: '株式会社ライフコーポレーション',
          storeId: 'STORE003',
          storeName: 'ライフ品川店',
          accountId: 'life_shinagawa',
          password: 'password'
        },
        {
          id: 5,
          companyId: 'COMP002',
          companyName: '株式会社ライフコーポレーション',
          storeId: 'STORE004',
          storeName: 'ライフ梅田店',
          accountId: 'life_umeda',
          password: 'password'
        },
        {
          id: 6,
          companyId: 'COMP003',
          companyName: '株式会社イオンリテール',
          storeId: 'STORE005',
          storeName: 'イオン幕張新都心店',
          accountId: 'aeon_makuhari',
          password: 'password'
        }
      ]
      this.allAccounts = [...this.accounts]
    }
  },
  mounted() {
    // 認証チェック
    this.adminStore.checkAuth()
    if (!this.adminStore.isAuthenticated) {
      this.$router.push('/admin/login')
      return
    }

    // 権限チェック（システム管理者または企業管理者、店舗ユーザーも参照可能）
    // アカウント管理は全ての管理者が利用可能

    this.loadAccounts()
    this.loadAllAccounts()
  }
}
</script>

<style scoped>
.admin-account-list {
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
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px 32px;
}

/* 検索セクション */
.search-section {
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.search-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: var(--primary-color);
}

.btn-search {
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-search:hover {
  background-color: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-create {
  padding: 12px 24px;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-create:hover {
  background-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.filter-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.filter-input {
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
  min-width: 150px;
}

.filter-input:focus {
  border-color: var(--primary-color);
}

/* 一括操作 */
.bulk-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid var(--border-color);
}

.selected-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-right: auto;
}

.btn-bulk {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-bulk.btn-delete {
  background-color: var(--danger-color);
  color: white;
}

.btn-bulk.btn-delete:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
}

/* アカウント一覧セクション */
.accounts-section {
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
}

.result-count {
  font-size: 18px;
  color: var(--text-secondary);
  font-weight: normal;
}

.loading,
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 16px;
}

/* テーブル */
.table-container {
  overflow-x: auto;
  cursor: grab;
  user-select: none;
}

.table-container:active {
  cursor: grabbing;
}

.accounts-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 1200px;
}

.accounts-table thead {
  background-color: var(--bg-light);
}

.accounts-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.accounts-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.accounts-table tbody tr {
  transition: background-color 0.2s ease;
}

.accounts-table tbody tr:hover {
  background-color: var(--bg-light);
}

.accounts-table tbody tr.selected {
  background-color: #dbeafe;
}

.col-checkbox {
  width: 40px;
  text-align: center;
}

.col-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.col-company-id {
  width: 100px;
  font-weight: 500;
}

.col-company-name {
  min-width: 180px;
  font-weight: 500;
}

.col-store-id {
  width: 100px;
  font-weight: 500;
}

.col-store-name {
  min-width: 180px;
  font-weight: 500;
}

.col-account-id {
  min-width: 150px;
  font-weight: 500;
}

.col-password {
  width: 100px;
  color: var(--text-secondary);
}

.col-actions {
  width: 100px;
  text-align: center;
}

.btn-icon {
  padding: 6px 10px;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-icon:hover:not(:disabled) {
  background-color: var(--bg-light);
  transform: scale(1.1);
}

.btn-icon:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ページネーション */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid var(--border-color);
}

.pagination-btn {
  min-width: 40px;
  height: 40px;
  padding: 8px 12px;
  background-color: white;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.pagination-btn.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
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

  .search-row {
    flex-direction: column;
  }

  .btn-create {
    width: 100%;
  }

  .filter-row {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .filter-input {
    flex: 1;
  }

  .bulk-actions {
    flex-wrap: wrap;
  }

  .selected-count {
    width: 100%;
    margin-bottom: 8px;
  }

  .table-container {
    overflow-x: scroll;
  }
}
</style>
