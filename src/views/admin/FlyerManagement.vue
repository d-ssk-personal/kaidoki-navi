<template>
  <div class="flyer-management">
    <!-- パンくずリスト -->
    <nav class="breadcrumb">
      <router-link to="/admin" class="breadcrumb-item">管理者トップ</router-link>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item active">チラシ管理</span>
    </nav>

    <div class="page-header">
      <h1 class="page-title">チラシ管理</h1>
      <p class="page-description">チラシの追加・編集・削除を行います</p>
    </div>

    <!-- 検索フィルター -->
    <div class="search-section">
      <div class="search-filters">
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
        <button class="btn-danger" @click="bulkDelete">
          一括削除
        </button>
      </div>
    </div>

    <!-- アクションバー -->
    <div class="actions-bar">
      <div class="results-info">
        検索結果: {{ filteredFlyers.length }}件
      </div>
      <router-link to="/admin/flyers/new" class="btn-primary">
        + 新規チラシ追加
      </router-link>
    </div>

    <!-- チラシ一覧テーブル -->
    <div class="table-container">
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
            <th class="col-store">店舗名</th>
            <th class="col-period">掲載期間</th>
            <th class="col-status">掲載ステータス</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredFlyers.length === 0">
            <td colspan="5" class="empty-message">
              チラシが見つかりませんでした
            </td>
          </tr>
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
            <td class="col-store">{{ flyer.storeName }}</td>
            <td class="col-period">
              {{ formatDate(flyer.periodFrom) }} 〜 {{ formatDate(flyer.periodTo) }}
            </td>
            <td class="col-status">
              <span :class="['status-badge', `status-${flyer.status}`]">
                {{ getStatusLabel(flyer.status) }}
              </span>
            </td>
            <td class="col-actions">
              <div class="action-buttons">
                <router-link
                  :to="`/admin/flyers/edit/${flyer.id}`"
                  class="btn-edit"
                >
                  編集
                </router-link>
                <button class="btn-delete" @click="deleteFlyer(flyer.id)">
                  削除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
        storeName: '',
        periodFrom: '',
        periodTo: '',
        status: ''
      },
      selectedIds: [],
      flyers: [
        {
          id: 1,
          storeName: 'スーパーマーケット ABC',
          periodFrom: '2024-01-15',
          periodTo: '2024-01-21',
          status: 'active',
          images: []
        },
        {
          id: 2,
          storeName: 'ドラッグストア DEF',
          periodFrom: '2024-01-10',
          periodTo: '2024-01-16',
          status: 'active',
          images: []
        },
        {
          id: 3,
          storeName: 'ホームセンター GHI',
          periodFrom: '2024-01-01',
          periodTo: '2024-01-07',
          status: 'inactive',
          images: []
        },
        {
          id: 4,
          storeName: '家電量販店 JKL',
          periodFrom: '2024-01-20',
          periodTo: '2024-01-26',
          status: 'scheduled',
          images: []
        },
        {
          id: 5,
          storeName: 'スーパーマーケット MNO',
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

      // 店舗名フィルター
      if (this.filters.storeName.trim()) {
        const query = this.filters.storeName.toLowerCase()
        results = results.filter(f =>
          f.storeName.toLowerCase().includes(query)
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
        storeName: '',
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
    }
  }
}
</script>

<style scoped>
.flyer-management {
  max-width: 1400px;
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

/* 検索セクション */
.search-section {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
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
}

.filter-input,
.filter-select {
  padding: 10px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 一括操作バー */
.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f7fafc;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  padding: 16px 24px;
  margin-bottom: 16px;
}

.bulk-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bulk-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.bulk-count {
  font-weight: 600;
  color: var(--text-primary);
}

.bulk-buttons {
  display: flex;
  gap: 12px;
}

/* アクションバー */
.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.results-info {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* ボタン */
.btn-primary,
.btn-secondary,
.btn-danger,
.btn-edit,
.btn-delete {
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

.btn-primary:hover {
  background-color: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
  background-color: var(--danger-color);
  color: white;
}

.btn-danger:hover {
  background-color: #c53030;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

/* テーブル */
.table-container {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.flyer-table {
  width: 100%;
  border-collapse: collapse;
}

.flyer-table thead {
  background-color: var(--bg-light);
}

.flyer-table th {
  padding: 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
}

.flyer-table td {
  padding: 16px;
  font-size: 14px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

.flyer-table tbody tr:hover {
  background-color: var(--bg-light);
}

.flyer-table tbody tr.selected {
  background-color: #ebf4ff;
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

.col-store {
  min-width: 200px;
  font-weight: 500;
}

.col-period {
  min-width: 220px;
}

.col-status {
  width: 120px;
}

.col-actions {
  width: 180px;
}

.empty-message {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 16px;
}

/* ステータスバッジ */
.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background-color: #c6f6d5;
  color: #22543d;
}

.status-inactive {
  background-color: #fed7d7;
  color: #742a2a;
}

.status-scheduled {
  background-color: #bee3f8;
  color: #2c5282;
}

/* アクションボタン */
.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-edit {
  padding: 6px 12px;
  background-color: var(--primary-color);
  color: white;
  font-size: 13px;
}

.btn-edit:hover {
  background-color: #5a67d8;
}

.btn-delete {
  padding: 6px 12px;
  background-color: white;
  color: var(--danger-color);
  border: 2px solid var(--danger-color);
  font-size: 13px;
}

.btn-delete:hover {
  background-color: var(--danger-color);
  color: white;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .flyer-management {
    padding: 16px;
  }

  .page-header {
    padding: 24px;
  }

  .page-title {
    font-size: 24px;
  }

  .search-section {
    padding: 16px;
  }

  .search-filters {
    grid-template-columns: 1fr;
  }

  .bulk-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .actions-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .table-container {
    overflow-x: auto;
  }

  .flyer-table {
    min-width: 800px;
  }
}
</style>
