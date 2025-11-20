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
          />
          <button @click="performSearch" class="btn-search">
            🔍 検索
          </button>
          <button @click="goToCreatePage" class="btn-create">
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

          <div class="filter-group">
            <label class="filter-label">店舗ID:</label>
            <input
              v-model="filterStoreId"
              type="text"
              placeholder="店舗IDで検索"
              class="filter-input"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">ステータス:</label>
            <select
              v-model="filterStatus"
              class="filter-select"
            >
              <option value="">すべて</option>
              <option value="active">有効</option>
              <option value="inactive">無効</option>
            </select>
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

          <div class="filter-group">
            <label class="filter-label">店舗名:</label>
            <input
              v-model="filterStoreName"
              type="text"
              placeholder="店舗名で検索"
              class="filter-input"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">住所:</label>
            <input
              v-model="filterAddress"
              type="text"
              placeholder="住所で検索"
              class="filter-input"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">電話番号:</label>
            <input
              v-model="filterPhone"
              type="text"
              placeholder="電話番号で検索"
              class="filter-input"
            />
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

        <div v-else
          class="table-container"
          ref="tableContainer"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
        >
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
                v-for="store in paginatedStores"
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
  name: 'StoreManagement',
  data() {
    return {
      searchQuery: '',
      filterCompanyId: '',
      filterStoreId: '',
      filterStatus: '',
      filterCompanyName: '',
      filterStoreName: '',
      filterAddress: '',
      filterPhone: '',
      loading: false,
      selectedIds: [],
      stores: [],
      allStores: [],
      filteredStores: [],
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
    paginatedStores() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredStores.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredStores.length / this.itemsPerPage)
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
      return this.paginatedStores.length > 0 &&
        this.selectedIds.length === this.filteredStores.length
    }
  },
  methods: {
    performSearch() {
      let stores = [...this.allStores]

      // 企業管理者は自社の店舗のみ表示
      if (this.adminStore.isCompanyAdmin) {
        stores = stores.filter(s => s.companyId === this.adminStore.userCompanyId)
      }

      // 店舗名、住所、電話番号で検索
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        stores = stores.filter(s =>
          s.name.toLowerCase().includes(query) ||
          s.address.toLowerCase().includes(query) ||
          s.phone.toLowerCase().includes(query)
        )
      }

      // 企業名フィルター
      if (this.filterCompanyName.trim()) {
        const query = this.filterCompanyName.toLowerCase()
        stores = stores.filter(s => s.companyId.toLowerCase().includes(query))
      }

      // 店舗名フィルター
      if (this.filterStoreName.trim()) {
        const query = this.filterStoreName.toLowerCase()
        stores = stores.filter(s => s.name.toLowerCase().includes(query))
      }

      // 住所フィルター
      if (this.filterAddress.trim()) {
        const query = this.filterAddress.toLowerCase()
        stores = stores.filter(s => s.address.toLowerCase().includes(query))
      }

      // 電話番号フィルター
      if (this.filterPhone.trim()) {
        const query = this.filterPhone.toLowerCase()
        stores = stores.filter(s => s.phone.toLowerCase().includes(query))
      }

      // 企業IDフィルター（システム管理者のみ）
      if (this.filterCompanyId.trim()) {
        const query = this.filterCompanyId.toLowerCase()
        stores = stores.filter(s => s.companyId.toLowerCase().includes(query))
      }

      // 店舗IDフィルター（システム管理者のみ）
      if (this.filterStoreId.trim()) {
        const query = this.filterStoreId.toLowerCase()
        stores = stores.filter(s => s.storeId.toLowerCase().includes(query))
      }

      // ステータスフィルター（システム管理者のみ）
      if (this.filterStatus) {
        stores = stores.filter(s => s.status === this.filterStatus)
      }

      this.filteredStores = stores
      this.searchTriggered = true
      this.currentPage = 1
    },
    loadAllStores() {
      let stores = [...this.allStores]

      // 企業管理者は自社の店舗のみ表示
      if (this.adminStore.isCompanyAdmin) {
        stores = stores.filter(s => s.companyId === this.adminStore.userCompanyId)
      }

      this.filteredStores = stores
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
          name: 'マルエツ赤坂店',
          address: '東京都港区赤坂3-10-15',
          phone: '03-3583-1234',
          status: 'active'
        },
        {
          id: 2,
          companyId: 'COMP001',
          storeId: 'STORE002',
          name: 'マルエツ浦和店',
          address: '埼玉県さいたま市浦和区高砂1-2-1',
          phone: '048-825-5678',
          status: 'active'
        },
        {
          id: 3,
          companyId: 'COMP002',
          storeId: 'STORE003',
          name: 'ライフ品川店',
          address: '東京都品川区北品川5-5-15',
          phone: '03-5479-1234',
          status: 'active'
        },
        {
          id: 4,
          companyId: 'COMP002',
          storeId: 'STORE004',
          name: 'ライフ梅田店',
          address: '大阪府大阪市北区梅田1-11-4',
          phone: '06-6343-5678',
          status: 'active'
        },
        {
          id: 5,
          companyId: 'COMP003',
          storeId: 'STORE005',
          name: 'イオン幕張新都心店',
          address: '千葉県千葉市美浜区豊砂1-1',
          phone: '043-351-8000',
          status: 'active'
        },
        {
          id: 6,
          companyId: 'COMP003',
          storeId: 'STORE006',
          name: 'イオンレイクタウン店',
          address: '埼玉県越谷市レイクタウン3-1-1',
          phone: '048-990-3100',
          status: 'active'
        },
        {
          id: 7,
          companyId: 'COMP004',
          storeId: 'STORE007',
          name: 'サミット高田馬場店',
          address: '東京都新宿区高田馬場3-35-1',
          phone: '03-3360-4545',
          status: 'active'
        },
        {
          id: 8,
          companyId: 'COMP004',
          storeId: 'STORE008',
          name: 'サミット中野店',
          address: '東京都中野区中野2-30-9',
          phone: '03-3389-0123',
          status: 'inactive'
        },
        {
          id: 9,
          companyId: 'COMP005',
          storeId: 'STORE009',
          name: 'ヨークベニマル郡山店',
          address: '福島県郡山市中町12-2',
          phone: '024-932-0111',
          status: 'active'
        },
        {
          id: 10,
          companyId: 'COMP005',
          storeId: 'STORE010',
          name: 'ヨークベニマル仙台店',
          address: '宮城県仙台市青葉区中央3-6-1',
          phone: '022-268-3456',
          status: 'active'
        },
        {
          id: 11,
          companyId: 'COMP006',
          storeId: 'STORE011',
          name: '西友池袋店',
          address: '東京都豊島区南池袋1-28-1',
          phone: '03-5949-0111',
          status: 'active'
        },
        {
          id: 12,
          companyId: 'COMP006',
          storeId: 'STORE012',
          name: '西友西新井店',
          address: '東京都足立区西新井栄町1-17-1',
          phone: '03-3854-8888',
          status: 'active'
        },
        {
          id: 13,
          companyId: 'COMP007',
          storeId: 'STORE013',
          name: 'イトーヨーカ堂木場店',
          address: '東京都江東区木場2-18-11',
          phone: '03-5665-1111',
          status: 'active'
        },
        {
          id: 14,
          companyId: 'COMP008',
          storeId: 'STORE014',
          name: 'ベルク所沢店',
          address: '埼玉県所沢市日吉町11-16',
          phone: '04-2923-5151',
          status: 'active'
        },
        {
          id: 15,
          companyId: 'COMP009',
          storeId: 'STORE015',
          name: 'オーケー横浜西口店',
          address: '神奈川県横浜市西区南幸2-1-22',
          phone: '045-314-0123',
          status: 'inactive'
        },
        {
          id: 16,
          companyId: 'COMP010',
          storeId: 'STORE016',
          name: 'バロー多治見店',
          address: '岐阜県多治見市住吉町2-50',
          phone: '0572-24-3333',
          status: 'active'
        },
        {
          id: 17,
          companyId: 'COMP011',
          storeId: 'STORE017',
          name: 'アークス札幌駅前店',
          address: '北海道札幌市中央区北4条西4-1',
          phone: '011-209-5100',
          status: 'active'
        },
        {
          id: 18,
          companyId: 'COMP012',
          storeId: 'STORE018',
          name: '万代天王寺店',
          address: '大阪府大阪市天王寺区堀越町17-1',
          phone: '06-6772-8888',
          status: 'active'
        },
        {
          id: 19,
          companyId: 'COMP013',
          storeId: 'STORE019',
          name: '平和堂彦根店',
          address: '滋賀県彦根市古沢町255-1',
          phone: '0749-26-1111',
          status: 'active'
        },
        {
          id: 20,
          companyId: 'COMP014',
          storeId: 'STORE020',
          name: 'フジグラン松山店',
          address: '愛媛県松山市宮西1-2-1',
          phone: '089-943-9111',
          status: 'active'
        }
      ]
      this.allStores = [...this.stores]
    }
  },
  mounted() {
    // 認証チェック
    this.adminStore.checkAuth()
    if (!this.adminStore.isAuthenticated) {
      this.$router.push('/admin/login')
      return
    }

    // 権限チェック（システム管理者または企業管理者のみ）
    if (!this.adminStore.isSystemAdmin && !this.adminStore.isCompanyAdmin) {
      alert('この機能はシステム管理者または企業管理者のみ利用可能です')
      this.$router.push('/admin')
      return
    }

    this.loadStores()
    this.loadAllStores()
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
  cursor: grab;
  user-select: none;
}

.table-container:active {
  cursor: grabbing;
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
