<template>
  <div class="admin-flyer-list">
    <div class="admin-header">
      <div class="header-left">
        <h1 class="page-title">チラシ管理</h1>
        <!-- パンくずリスト -->
        <nav class="breadcrumb">
          <router-link to="/admin">管理画面</router-link>
          <span class="separator">›</span>
          <span class="current">チラシ管理</span>
        </nav>
      </div>
      <button @click="handleLogout" class="logout-button">
        ログアウト
      </button>
    </div>

    <div class="page-content">

    <!-- 検索フィルター -->
    <div class="search-section">
      <div class="search-filters">
        <div v-if="adminStore.isSystemAdmin" class="filter-group">
          <label class="filter-label">企業ID</label>
          <input
            v-model="filters.companyId"
            type="text"
            class="filter-input"
            placeholder="企業IDで検索"
          />
        </div>

        <div v-if="adminStore.isSystemAdmin" class="filter-group">
          <label class="filter-label">企業名</label>
          <input
            v-model="filters.companyName"
            type="text"
            class="filter-input"
            placeholder="企業名で検索"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">店舗ID</label>
          <input
            v-model="filters.storeId"
            type="text"
            class="filter-input"
            placeholder="店舗IDで検索"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">店舗名</label>
          <input
            v-model="filters.storeName"
            type="text"
            class="filter-input"
            placeholder="店舗名で検索"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">チラシID</label>
          <input
            v-model="filters.flyerId"
            type="text"
            class="filter-input"
            placeholder="チラシIDで検索"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">住所</label>
          <input
            v-model="filters.address"
            type="text"
            class="filter-input"
            placeholder="住所で検索"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">掲載期間From</label>
          <input
            v-model="filters.periodFrom"
            type="date"
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">掲載期間To</label>
          <input
            v-model="filters.periodTo"
            type="date"
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">掲載ステータス</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">すべて</option>
            <option value="active">掲載中</option>
            <option value="inactive">掲載終了</option>
            <option value="scheduled">掲載予定</option>
          </select>
        </div>
      </div>

      <div class="search-actions">
        <button class="btn-secondary" @click="resetFilters">
          リセット
        </button>
        <button class="btn-primary" @click="search">
          検索
        </button>
      </div>
    </div>

    <!-- 一括操作バー -->
    <div v-if="selectedIds.length > 0" class="bulk-actions">
      <div class="bulk-info">
        <input
          type="checkbox"
          :checked="isAllSelected"
          @change="toggleSelectAll"
          class="bulk-checkbox"
        />
        <span class="bulk-count">{{ selectedIds.length }}件選択中</span>
      </div>
      <div class="bulk-buttons">
        <select v-model="bulkStatusChange" class="bulk-status-select">
          <option value="">ステータスを選択</option>
          <option value="active">掲載中</option>
          <option value="inactive">掲載終了</option>
          <option value="scheduled">掲載予定</option>
        </select>
        <button class="btn-primary" @click="bulkChangeStatus" :disabled="!bulkStatusChange">
          一括ステータス変更
        </button>
        <button class="btn-danger" @click="bulkDelete">
          一括削除
        </button>
      </div>
    </div>

    <!-- チラシ一覧 -->
    <div class="flyers-section">
      <div class="section-header">
        <h2 class="section-title">
          チラシ一覧
          <span class="result-count">（{{ filteredFlyers.length }}件）</span>
        </h2>
        <router-link to="/admin/flyers/new" class="btn-create">
          ➕ 新規作成
        </router-link>
      </div>

      <div v-if="filteredFlyers.length === 0" class="no-results">
        <p>チラシが見つかりませんでした</p>
      </div>

      <div v-else class="table-container">
      <table class="flyer-table">
        <thead>
          <tr>
            <th class="col-checkbox">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
            </th>
            <th v-if="adminStore.isSystemAdmin" class="col-company-id">企業ID</th>
            <th v-if="adminStore.isSystemAdmin" class="col-company-name">企業名</th>
            <th class="col-store-id">店舗ID</th>
            <th class="col-store-name">店舗名</th>
            <th class="col-flyer-id">チラシID</th>
            <th class="col-address">住所</th>
            <th class="col-period-from">掲載期間From</th>
            <th class="col-period-to">掲載期間To</th>
            <th class="col-status">掲載ステータス</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="flyer in filteredFlyers"
            :key="flyer.id"
            :class="{ selected: selectedIds.includes(flyer.id) }"
          >
            <td class="col-checkbox">
              <input
                type="checkbox"
                :checked="selectedIds.includes(flyer.id)"
                @change="toggleSelect(flyer.id)"
              />
            </td>
            <td v-if="adminStore.isSystemAdmin" class="col-company-id">{{ flyer.companyId }}</td>
            <td v-if="adminStore.isSystemAdmin" class="col-company-name">{{ flyer.companyName }}</td>
            <td class="col-store-id">{{ flyer.storeId }}</td>
            <td class="col-store-name">{{ flyer.storeName }}</td>
            <td class="col-flyer-id">{{ flyer.flyerId }}</td>
            <td class="col-address">{{ flyer.address }}</td>
            <td class="col-period-from">{{ formatDate(flyer.periodFrom) }}</td>
            <td class="col-period-to">{{ formatDate(flyer.periodTo) }}</td>
            <td class="col-status">
              <span :class="['status-badge', `status-${flyer.status}`]">
                {{ getStatusLabel(flyer.status) }}
              </span>
            </td>
            <td class="col-actions">
              <button
                @click="$router.push(`/admin/flyers/edit/${flyer.id}`)"
                class="btn-edit"
                title="編集"
              >
                ✏️
              </button>
              <button
                @click="deleteFlyer(flyer.id)"
                class="btn-delete"
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
  name: 'FlyerManagement',
  setup() {
    const adminStore = useAdminStore()
    return { adminStore }
  },
  data() {
    return {
      filters: {
        companyId: '',
        companyName: '',
        storeId: '',
        storeName: '',
        flyerId: '',
        address: '',
        periodFrom: '',
        periodTo: '',
        status: ''
      },
      selectedIds: [],
      bulkStatusChange: '',
      flyers: [
        {
          id: 1,
          companyId: 'COMP001',
          companyName: '株式会社ABC商事',
          storeId: 'STORE001',
          storeName: 'スーパーマーケット ABC',
          flyerId: 'FLYER001',
          address: '東京都渋谷区渋谷1-1-1',
          periodFrom: '2024-01-15',
          periodTo: '2024-01-21',
          status: 'active',
          images: []
        },
        {
          id: 2,
          companyId: 'COMP002',
          companyName: '株式会社DEFホールディングス',
          storeId: 'STORE002',
          storeName: 'ドラッグストア DEF',
          flyerId: 'FLYER002',
          address: '東京都新宿区新宿2-2-2',
          periodFrom: '2024-01-10',
          periodTo: '2024-01-16',
          status: 'active',
          images: []
        },
        {
          id: 3,
          companyId: 'COMP003',
          companyName: '株式会社GHIチェーン',
          storeId: 'STORE003',
          storeName: 'ホームセンター GHI',
          flyerId: 'FLYER003',
          address: '神奈川県横浜市中区山下町3-3-3',
          periodFrom: '2024-01-01',
          periodTo: '2024-01-07',
          status: 'inactive',
          images: []
        },
        {
          id: 4,
          companyId: 'COMP004',
          companyName: '株式会社JKL電機',
          storeId: 'STORE004',
          storeName: '家電量販店 JKL',
          flyerId: 'FLYER004',
          address: '埼玉県さいたま市大宮区4-4-4',
          periodFrom: '2024-01-20',
          periodTo: '2024-01-26',
          status: 'scheduled',
          images: []
        },
        {
          id: 5,
          companyId: 'COMP001',
          companyName: '株式会社ABC商事',
          storeId: 'STORE005',
          storeName: 'スーパーマーケット MNO',
          flyerId: 'FLYER005',
          address: '千葉県千葉市中央区5-5-5',
          periodFrom: '2024-01-12',
          periodTo: '2024-01-18',
          status: 'active',
          images: []
        }
      ]
    }
  },
  computed: {
    filteredFlyers() {
      let results = [...this.flyers]

      // 企業IDフィルター
      if (this.filters.companyId.trim()) {
        const query = this.filters.companyId.toLowerCase()
        results = results.filter(f =>
          f.companyId.toLowerCase().includes(query)
        )
      }

      // 企業名フィルター
      if (this.filters.companyName.trim()) {
        const query = this.filters.companyName.toLowerCase()
        results = results.filter(f =>
          f.companyName.toLowerCase().includes(query)
        )
      }

      // 店舗IDフィルター
      if (this.filters.storeId.trim()) {
        const query = this.filters.storeId.toLowerCase()
        results = results.filter(f =>
          f.storeId.toLowerCase().includes(query)
        )
      }

      // 店舗名フィルター
      if (this.filters.storeName.trim()) {
        const query = this.filters.storeName.toLowerCase()
        results = results.filter(f =>
          f.storeName.toLowerCase().includes(query)
        )
      }

      // チラシIDフィルター
      if (this.filters.flyerId.trim()) {
        const query = this.filters.flyerId.toLowerCase()
        results = results.filter(f =>
          f.flyerId.toLowerCase().includes(query)
        )
      }

      // 住所フィルター
      if (this.filters.address.trim()) {
        const query = this.filters.address.toLowerCase()
        results = results.filter(f =>
          f.address.toLowerCase().includes(query)
        )
      }

      // 掲載期間Fromフィルター
      if (this.filters.periodFrom) {
        results = results.filter(f =>
          f.periodFrom >= this.filters.periodFrom
        )
      }

      // 掲載期間Toフィルター
      if (this.filters.periodTo) {
        results = results.filter(f =>
          f.periodTo <= this.filters.periodTo
        )
      }

      // ステータスフィルター
      if (this.filters.status) {
        results = results.filter(f => f.status === this.filters.status)
      }

      return results
    },
    isAllSelected() {
      return this.filteredFlyers.length > 0 &&
        this.selectedIds.length === this.filteredFlyers.length
    }
  },
  mounted() {
    // 認証チェック
    this.adminStore.checkAuth()
    if (!this.adminStore.isAuthenticated) {
      this.$router.push('/admin/login')
    }
  },
  methods: {
    search() {
      // フィルターは computed で自動適用されるため、特に処理不要
      // 必要に応じて API 呼び出しなどを追加
    },
    resetFilters() {
      this.filters = {
        companyId: '',
        companyName: '',
        storeId: '',
        storeName: '',
        flyerId: '',
        address: '',
        periodFrom: '',
        periodTo: '',
        status: ''
      }
      this.selectedIds = []
    },
    toggleSelect(id) {
      const index = this.selectedIds.indexOf(id)
      if (index === -1) {
        this.selectedIds.push(id)
      } else {
        this.selectedIds.splice(index, 1)
      }
    },
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedIds = []
      } else {
        this.selectedIds = this.filteredFlyers.map(f => f.id)
      }
    },
    bulkChangeStatus() {
      if (!this.bulkStatusChange) {
        alert('ステータスを選択してください')
        return
      }
      if (confirm(`選択した${this.selectedIds.length}件のチラシのステータスを「${this.getStatusLabel(this.bulkStatusChange)}」に変更しますか？`)) {
        this.selectedIds.forEach(id => {
          const flyer = this.flyers.find(f => f.id === id)
          if (flyer) flyer.status = this.bulkStatusChange
        })
        alert('ステータスを変更しました')
        this.selectedIds = []
        this.bulkStatusChange = ''
      }
    },
    bulkDelete() {
      if (confirm(`選択した${this.selectedIds.length}件のチラシを削除しますか？`)) {
        this.flyers = this.flyers.filter(f => !this.selectedIds.includes(f.id))
        alert('チラシを削除しました')
        this.selectedIds = []
      }
    },
    deleteFlyer(id) {
      if (confirm('このチラシを削除しますか？')) {
        this.flyers = this.flyers.filter(f => f.id !== id)
        alert('チラシを削除しました')
        // 選択リストからも削除
        const index = this.selectedIds.indexOf(id)
        if (index !== -1) {
          this.selectedIds.splice(index, 1)
        }
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}/${month}/${day}`
    },
    getStatusLabel(status) {
      const labels = {
        active: '掲載中',
        inactive: '掲載終了',
        scheduled: '掲載予定'
      }
      return labels[status] || status
    },
    handleLogout() {
      if (confirm('ログアウトしますか？')) {
        this.adminStore.logout()
        this.$router.push('/admin/login')
      }
    }
  }
}
</script>

<style scoped>
.admin-flyer-list {
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

.search-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
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

.filter-input:focus,
.filter-select:focus {
  border-color: var(--primary-color);
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

.bulk-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.bulk-status-select {
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.bulk-status-select:focus {
  outline: none;
  border-color: var(--primary-color);
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

/* チラシ一覧セクション */
.flyers-section {
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  text-decoration: none;
  display: inline-block;
}

.btn-create:hover {
  background-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 16px;
}

/* ボタン */
.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-danger {
  padding: 8px 16px;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
}

/* テーブル */
.table-container {
  overflow-x: auto;
}

.flyer-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 1600px;
}

.flyer-table thead {
  background-color: var(--bg-light);
}

.flyer-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.flyer-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.flyer-table tbody tr {
  transition: background-color 0.2s ease;
}

.flyer-table tbody tr:hover {
  background-color: var(--bg-light);
}

.flyer-table tbody tr.selected {
  background-color: #dbeafe;
}

.col-checkbox {
  width: 50px;
  text-align: center;
}

.col-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.col-company-id {
  min-width: 100px;
  font-weight: 500;
}

.col-company-name {
  min-width: 180px;
  font-weight: 500;
}

.col-store-id {
  min-width: 100px;
  font-weight: 500;
}

.col-store-name {
  min-width: 180px;
  font-weight: 500;
}

.col-flyer-id {
  min-width: 100px;
  font-weight: 500;
}

.col-address {
  min-width: 250px;
  color: var(--text-secondary);
}

.col-period-from {
  min-width: 120px;
}

.col-period-to {
  min-width: 120px;
}

.col-status {
  width: 120px;
}

.col-actions {
  width: 100px;
  text-align: center;
}

/* ステータスバッジ */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-scheduled {
  background-color: #dbeafe;
  color: #1e40af;
}

/* アクションボタン */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.btn-edit,
.btn-delete {
  padding: 6px 10px;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  color: var(--text-primary);
}

.btn-edit:hover,
.btn-delete:hover {
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

  .search-filters {
    grid-template-columns: 1fr;
  }

  .bulk-actions {
    flex-wrap: wrap;
  }

  .selected-count {
    width: 100%;
    margin-bottom: 8px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .btn-create {
    width: 100%;
  }

  .table-container {
    overflow-x: scroll;
  }
}
</style>
