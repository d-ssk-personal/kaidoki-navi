<template>
  <div class="admin-company-list">
    <div class="admin-header">
      <div class="header-left">
        <h1 class="page-title">企業管理</h1>
        <!-- パンくずリスト -->
        <nav class="breadcrumb">
          <router-link to="/admin">管理画面</router-link>
          <span class="separator">›</span>
          <span class="current">企業管理</span>
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
            placeholder="企業名または担当者氏名で検索"
            class="search-input"
          />
          <button @click="performSearch" class="btn-search">
            🔍 検索
          </button>
          <button @click="goToCreatePage" class="btn-create">
            ➕ 新規作成
          </button>
        </div>

        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">契約状態:</label>
            <select
              v-model="filterContractStatus"
              class="filter-select"
            >
              <option value="">すべて</option>
              <option value="active">有効</option>
              <option value="expired">期限切れ</option>
              <option value="suspended">停止中</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">契約プラン:</label>
            <select
              v-model="filterContractPlan"
              class="filter-select"
            >
              <option value="">すべて</option>
              <option value="basic">ベーシック</option>
              <option value="standard">スタンダード</option>
              <option value="premium">プレミアム</option>
            </select>
          </div>
        </div>

        <!-- 一括操作 -->
        <div v-if="selectedIds.length > 0" class="bulk-actions">
          <span class="selected-count">{{ selectedIds.length }}件選択中</span>
          <button @click="bulkActivate" class="btn-bulk btn-publish">
            一括有効化
          </button>
          <button @click="bulkSuspend" class="btn-bulk btn-unpublish">
            一括停止
          </button>
        </div>
      </div>

      <!-- 企業一覧 -->
      <div class="companies-section">
        <div class="section-header">
          <h2 class="section-title">
            企業一覧
            <span class="result-count">（{{ filteredCompanies.length }}件）</span>
          </h2>
        </div>

        <div v-if="loading" class="loading">
          <p>読み込み中...</p>
        </div>

        <div v-else-if="filteredCompanies.length === 0" class="no-results">
          <p>企業が見つかりませんでした</p>
        </div>

        <div v-else
          class="table-container"
          ref="tableContainer"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
        >
          <table class="companies-table">
            <thead>
              <tr>
                <th class="col-checkbox">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th class="col-id">企業ID</th>
                <th class="col-name">企業名</th>
                <th class="col-address">住所</th>
                <th class="col-contact">担当者氏名</th>
                <th class="col-phone">電話番号</th>
                <th class="col-email">メールアドレス</th>
                <th class="col-status">契約状態</th>
                <th class="col-plan">契約プラン</th>
                <th class="col-date">契約開始日</th>
                <th class="col-date">契約終了日</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="company in paginatedCompanies"
                :key="company.id"
                :class="{ selected: selectedIds.includes(company.id) }"
              >
                <td class="col-checkbox">
                  <input
                    type="checkbox"
                    :checked="selectedIds.includes(company.id)"
                    @change="toggleSelect(company.id)"
                  />
                </td>
                <td class="col-id">
                  {{ company.companyId }}
                </td>
                <td class="col-name">
                  {{ company.name }}
                </td>
                <td class="col-address">
                  {{ company.address }}
                </td>
                <td class="col-contact">
                  {{ company.contactName }}
                </td>
                <td class="col-phone">
                  {{ company.phone }}
                </td>
                <td class="col-email">
                  {{ company.email }}
                </td>
                <td class="col-status">
                  <span :class="['status-badge', company.contractStatus]">
                    {{ getStatusLabel(company.contractStatus) }}
                  </span>
                </td>
                <td class="col-plan">
                  <span :class="['plan-badge', company.contractPlan]">
                    {{ getPlanLabel(company.contractPlan) }}
                  </span>
                </td>
                <td class="col-date">
                  {{ formatDate(company.contractStartDate) }}
                </td>
                <td class="col-date">
                  {{ formatDate(company.contractEndDate) }}
                </td>
                <td class="col-actions">
                  <button
                    @click="goToEditPage(company.id)"
                    class="btn-icon btn-edit"
                    title="編集"
                  >
                    ✏️
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
  name: 'CompanyManagement',
  data() {
    return {
      searchQuery: '',
      filterContractStatus: '',
      filterContractPlan: '',
      loading: false,
      selectedIds: [],
      companies: [],
      currentPage: 1,
      itemsPerPage: 50,
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
    filteredCompanies() {
      // 検索ボタンが押されていない場合は全件表示
      if (!this.searchTriggered) {
        return [...this.companies]
      }

      let companies = [...this.companies]

      // 企業名または担当者氏名で検索
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        companies = companies.filter(c =>
          c.name.toLowerCase().includes(query) ||
          c.contactName.toLowerCase().includes(query)
        )
      }

      // 契約状態フィルター
      if (this.filterContractStatus) {
        companies = companies.filter(c => c.contractStatus === this.filterContractStatus)
      }

      // 契約プランフィルター
      if (this.filterContractPlan) {
        companies = companies.filter(c => c.contractPlan === this.filterContractPlan)
      }

      return companies
    },
    paginatedCompanies() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredCompanies.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredCompanies.length / this.itemsPerPage)
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
      return this.paginatedCompanies.length > 0 &&
        this.selectedIds.length === this.filteredCompanies.length
    }
  },
  methods: {
    performSearch() {
      this.searchTriggered = true
      this.currentPage = 1
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
    goToCreatePage() {
      this.$router.push('/admin/companies/new')
    },
    goToEditPage(id) {
      this.$router.push(`/admin/companies/edit/${id}`)
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
        this.selectedIds = this.filteredCompanies.map(company => company.id)
      }
    },
    bulkActivate() {
      if (confirm(`選択した${this.selectedIds.length}件の企業を有効化しますか？`)) {
        this.selectedIds.forEach(id => {
          const company = this.companies.find(c => c.id === id)
          if (company) company.contractStatus = 'active'
        })
        alert('企業を有効化しました')
        this.selectedIds = []
      }
    },
    bulkSuspend() {
      if (confirm(`選択した${this.selectedIds.length}件の企業を停止しますか？`)) {
        this.selectedIds.forEach(id => {
          const company = this.companies.find(c => c.id === id)
          if (company) company.contractStatus = 'suspended'
        })
        alert('企業を停止しました')
        this.selectedIds = []
      }
    },
    handleLogout() {
      if (confirm('ログアウトしますか？')) {
        this.adminStore.logout()
        this.$router.push('/admin/login')
      }
    },
    loadCompanies() {
      // ダミーデータ（実際はAPIから取得）
      this.companies = [
        {
          id: 1,
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
        },
        {
          id: 2,
          companyId: 'COMP002',
          name: 'テスト株式会社',
          address: '大阪府大阪市北区梅田2-2-2',
          contactName: '佐藤花子',
          phone: '06-9876-5432',
          email: 'sato@test.co.jp',
          contractStatus: 'active',
          contractPlan: 'standard',
          contractStartDate: '2024-03-01',
          contractEndDate: '2025-02-28'
        },
        {
          id: 3,
          companyId: 'COMP003',
          name: '有限会社サンプル',
          address: '愛知県名古屋市中区栄3-3-3',
          contactName: '鈴木一郎',
          phone: '052-1111-2222',
          email: 'suzuki@sample-ltd.co.jp',
          contractStatus: 'expired',
          contractPlan: 'basic',
          contractStartDate: '2023-01-01',
          contractEndDate: '2023-12-31'
        },
        {
          id: 4,
          companyId: 'COMP004',
          name: 'サンプルコーポレーション',
          address: '福岡県福岡市博多区博多駅前4-4-4',
          contactName: '田中次郎',
          phone: '092-3333-4444',
          email: 'tanaka@samplecorp.co.jp',
          contractStatus: 'suspended',
          contractPlan: 'standard',
          contractStartDate: '2024-02-01',
          contractEndDate: '2025-01-31'
        }
      ]
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

    this.loadCompanies()
  }
}
</script>

<style scoped>
.admin-company-list {
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

.filter-select {
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
  min-width: 140px;
}

.filter-select:focus {
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

.btn-bulk.btn-publish {
  background-color: var(--secondary-color);
  color: white;
}

.btn-bulk.btn-publish:hover {
  background-color: #059669;
  transform: translateY(-2px);
}

.btn-bulk.btn-unpublish {
  background-color: #6b7280;
  color: white;
}

.btn-bulk.btn-unpublish:hover {
  background-color: #4b5563;
  transform: translateY(-2px);
}

/* 企業一覧セクション */
.companies-section {
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

.companies-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 1400px;
}

.companies-table thead {
  background-color: var(--bg-light);
}

.companies-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.companies-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.companies-table tbody tr {
  transition: background-color 0.2s ease;
}

.companies-table tbody tr:hover {
  background-color: var(--bg-light);
}

.companies-table tbody tr.selected {
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

.col-id {
  width: 100px;
  font-weight: 500;
}

.col-name {
  min-width: 180px;
  font-weight: 500;
}

.col-address {
  min-width: 250px;
  color: var(--text-secondary);
}

.col-contact {
  min-width: 120px;
}

.col-phone {
  min-width: 130px;
}

.col-email {
  min-width: 200px;
  color: var(--text-secondary);
}

.col-status {
  width: 100px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.expired {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-badge.suspended {
  background-color: #f3f4f6;
  color: #374151;
}

.col-plan {
  width: 120px;
}

.plan-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.plan-badge.basic {
  background-color: #e0e7ff;
  color: #3730a3;
}

.plan-badge.standard {
  background-color: #dbeafe;
  color: #1e40af;
}

.plan-badge.premium {
  background-color: #fce7f3;
  color: #831843;
}

.col-date {
  width: 110px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.col-actions {
  width: 80px;
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

.btn-icon:hover {
  background-color: var(--bg-light);
  transform: scale(1.1);
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

  .filter-select {
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
