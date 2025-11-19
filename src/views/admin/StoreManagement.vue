<template>
  <div class="admin-store-list">
    <div class="admin-header">
      <div class="header-left">
        <h1 class="page-title">店舗管理</h1>
        <!-- パンくずリスト -->
        <nav class="breadcrumb">
          <router-link to="/admin">管理画面</router-link>
          <span class="separator">›</span>
          <span class="current">店舗管理</span>
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
            placeholder="店舗名、住所、電話番号で検索"
            class="search-input"
            @input="performSearch"
          />
          <button @click="goToCreatePage" class="btn-create">
            ➕ 新規作成
          </button>
        </div>

        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">企業ID:</label>
            <input
              v-model="filterCompanyId"
              type="text"
              placeholder="企業IDで検索"
              class="filter-input"
              @input="performSearch"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">店舗ID:</label>
            <input
              v-model="filterStoreId"
              type="text"
              placeholder="店舗IDで検索"
              class="filter-input"
              @input="performSearch"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">ステータス:</label>
            <select
              v-model="filterStatus"
              class="filter-select"
              @change="performSearch"
            >
              <option value="">すべて</option>
              <option value="active">有効</option>
              <option value="inactive">無効</option>
            </select>
          </div>
        </div>

        <!-- 一括操作 -->
        <div v-if="selectedIds.length > 0" class="bulk-actions">
          <span class="selected-count">{{ selectedIds.length }}件選択中</span>
          <button @click="bulkActivate" class="btn-bulk btn-publish">
            一括有効化
          </button>
          <button @click="bulkDeactivate" class="btn-bulk btn-unpublish">
            一括無効化
          </button>
          <button @click="confirmBulkDelete" class="btn-bulk btn-delete">
            一括削除
          </button>
        </div>
      </div>

      <!-- 店舗一覧 -->
      <div class="stores-section">
        <div class="section-header">
          <h2 class="section-title">
            店舗一覧
            <span class="result-count">（{{ filteredStores.length }}件）</span>
          </h2>
        </div>

        <div v-if="loading" class="loading">
          <p>読み込み中...</p>
        </div>

        <div v-else-if="filteredStores.length === 0" class="no-results">
          <p>店舗が見つかりませんでした</p>
        </div>

        <div v-else class="table-container">
          <table class="stores-table">
            <thead>
              <tr>
                <th class="col-checkbox">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th class="col-company-id">企業ID</th>
                <th class="col-store-id">店舗ID</th>
                <th class="col-name">店舗名</th>
                <th class="col-address">住所</th>
                <th class="col-phone">電話番号</th>
                <th class="col-status">ステータス</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="store in filteredStores"
                :key="store.id"
                :class="{ selected: selectedIds.includes(store.id) }"
              >
                <td class="col-checkbox">
                  <input
                    type="checkbox"
                    :checked="selectedIds.includes(store.id)"
                    @change="toggleSelect(store.id)"
                  />
                </td>
                <td class="col-company-id">
                  {{ store.companyId }}
                </td>
                <td class="col-store-id">
                  {{ store.storeId }}
                </td>
                <td class="col-name">
                  {{ store.name }}
                </td>
                <td class="col-address">
                  {{ store.address }}
                </td>
                <td class="col-phone">
                  {{ store.phone }}
                </td>
                <td class="col-status">
                  <span :class="['status-badge', store.status]">
                    {{ store.status === 'active' ? '有効' : '無効' }}
                  </span>
                </td>
                <td class="col-actions">
                  <button
                    @click="goToEditPage(store.id)"
                    class="btn-icon btn-edit"
                    title="編集"
                  >
                    ✏️
                  </button>
                  <button
                    @click="confirmDelete(store)"
                    class="btn-icon btn-delete"
                    title="削除"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAdminStore } from '@/store/admin'

export default {
  name: 'StoreManagement',
  data() {
    return {
      searchQuery: '',
      filterCompanyId: '',
      filterStoreId: '',
      filterStatus: '',
      loading: false,
      selectedIds: [],
      stores: []
    }
  },
  setup() {
    const adminStore = useAdminStore()
    return { adminStore }
  },
  computed: {
    filteredStores() {
      let stores = [...this.stores]

      // 店舗名、住所、電話番号で検索
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        stores = stores.filter(s =>
          s.name.toLowerCase().includes(query) ||
          s.address.toLowerCase().includes(query) ||
          s.phone.toLowerCase().includes(query)
        )
      }

      // 企業IDフィルター
      if (this.filterCompanyId.trim()) {
        const query = this.filterCompanyId.toLowerCase()
        stores = stores.filter(s => s.companyId.toLowerCase().includes(query))
      }

      // 店舗IDフィルター
      if (this.filterStoreId.trim()) {
        const query = this.filterStoreId.toLowerCase()
        stores = stores.filter(s => s.storeId.toLowerCase().includes(query))
      }

      // ステータスフィルター
      if (this.filterStatus) {
        stores = stores.filter(s => s.status === this.filterStatus)
      }

      return stores
    },
    isAllSelected() {
      return this.filteredStores.length > 0 &&
        this.selectedIds.length === this.filteredStores.length
    }
  },
  methods: {
    performSearch() {
      // リアルタイム検索のためのメソッド（computedで処理）
    },
    goToCreatePage() {
      this.$router.push('/admin/stores/new')
    },
    goToEditPage(id) {
      this.$router.push(`/admin/stores/edit/${id}`)
    },
    confirmDelete(store) {
      if (confirm(`「${store.name}」を削除しますか？\nこの操作は取り消せません。`)) {
        this.deleteStore(store.id)
      }
    },
    deleteStore(id) {
      const index = this.stores.findIndex(s => s.id === id)
      if (index > -1) {
        this.stores.splice(index, 1)
        this.selectedIds = this.selectedIds.filter(selectedId => selectedId !== id)
        alert('店舗を削除しました')
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
        this.selectedIds = this.filteredStores.map(store => store.id)
      }
    },
    bulkActivate() {
      if (confirm(`選択した${this.selectedIds.length}件の店舗を有効化しますか？`)) {
        this.selectedIds.forEach(id => {
          const store = this.stores.find(s => s.id === id)
          if (store) store.status = 'active'
        })
        alert('店舗を有効化しました')
        this.selectedIds = []
      }
    },
    bulkDeactivate() {
      if (confirm(`選択した${this.selectedIds.length}件の店舗を無効化しますか？`)) {
        this.selectedIds.forEach(id => {
          const store = this.stores.find(s => s.id === id)
          if (store) store.status = 'inactive'
        })
        alert('店舗を無効化しました')
        this.selectedIds = []
      }
    },
    confirmBulkDelete() {
      if (confirm(`選択した${this.selectedIds.length}件の店舗を削除しますか？\nこの操作は取り消せません。`)) {
        this.stores = this.stores.filter(s => !this.selectedIds.includes(s.id))
        alert('店舗を削除しました')
        this.selectedIds = []
      }
    },
    handleLogout() {
      if (confirm('ログアウトしますか？')) {
        this.adminStore.logout()
        this.$router.push('/admin/login')
      }
    },
    loadStores() {
      // ダミーデータ（実際はAPIから取得）
      this.stores = [
        {
          id: 1,
          companyId: 'COMP001',
          storeId: 'STORE001',
          name: 'イオン大宮店',
          address: '埼玉県さいたま市大宮区桜木町2-3',
          phone: '048-123-4567',
          status: 'active'
        },
        {
          id: 2,
          companyId: 'COMP001',
          storeId: 'STORE002',
          name: 'マルエツ浦和店',
          address: '埼玉県さいたま市浦和区高砂1-2-1',
          phone: '048-234-5678',
          status: 'active'
        },
        {
          id: 3,
          companyId: 'COMP002',
          storeId: 'STORE003',
          name: 'ライフ品川店',
          address: '東京都品川区北品川1-1-1',
          phone: '03-1111-2222',
          status: 'active'
        },
        {
          id: 4,
          companyId: 'COMP002',
          storeId: 'STORE004',
          name: 'サミット渋谷店',
          address: '東京都渋谷区道玄坂2-3-1',
          phone: '03-3333-4444',
          status: 'inactive'
        },
        {
          id: 5,
          companyId: 'COMP003',
          storeId: 'STORE005',
          name: 'オーケー川崎店',
          address: '神奈川県川崎市川崎区駅前本町1-1',
          phone: '044-555-6666',
          status: 'active'
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

    this.loadStores()
  }
}
</script>

<style scoped>
.admin-store-list {
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

.filter-input,
.filter-select {
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.filter-input {
  min-width: 150px;
}

.filter-select {
  min-width: 120px;
}

.filter-input:focus,
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

.btn-bulk.btn-delete {
  background-color: var(--danger-color);
  color: white;
}

.btn-bulk.btn-delete:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
}

/* 店舗一覧セクション */
.stores-section {
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
}

.stores-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 1200px;
}

.stores-table thead {
  background-color: var(--bg-light);
}

.stores-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.stores-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.stores-table tbody tr {
  transition: background-color 0.2s ease;
}

.stores-table tbody tr:hover {
  background-color: var(--bg-light);
}

.stores-table tbody tr.selected {
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

.col-store-id {
  width: 100px;
  font-weight: 500;
}

.col-name {
  min-width: 180px;
  font-weight: 500;
}

.col-address {
  min-width: 300px;
  color: var(--text-secondary);
}

.col-phone {
  min-width: 140px;
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

.status-badge.inactive {
  background-color: #f3f4f6;
  color: #374151;
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

.btn-icon:hover {
  background-color: var(--bg-light);
  transform: scale(1.1);
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

  .filter-input,
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
