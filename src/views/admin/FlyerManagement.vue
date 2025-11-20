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

        <div v-if="adminStore.isSystemAdmin || adminStore.isCompanyAdmin" class="filter-group">
          <label class="filter-label">店舗ID</label>
          <input
            v-model="filters.storeId"
            type="text"
            class="filter-input"
            placeholder="店舗IDで検索"
          />
        </div>

        <div v-if="adminStore.isSystemAdmin || adminStore.isCompanyAdmin" class="filter-group">
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

        <div v-if="adminStore.isSystemAdmin || adminStore.isCompanyAdmin" class="filter-group">
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

      <div v-else
        class="table-container"
        ref="tableContainer"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
      >
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
            v-for="flyer in paginatedFlyers"
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
      currentPage: 1,
      itemsPerPage: 2,
      isDragging: false,
      startX: 0,
      scrollLeft: 0,
      searchTriggered: false,
      filteredFlyers: [],
      allFlyers: [],
      flyers: [
        {
          id: 1,
          companyId: 'COMP001',
          companyName: '株式会社マルエツ',
          storeId: 'STORE001',
          storeName: 'マルエツ赤坂店',
          flyerId: 'FLYER001',
          address: '東京都港区赤坂3-10-15',
          periodFrom: '2024-11-18',
          periodTo: '2024-11-24',
          status: 'active',
          images: []
        },
        {
          id: 2,
          companyId: 'COMP001',
          companyName: '株式会社マルエツ',
          storeId: 'STORE002',
          storeName: 'マルエツ浦和店',
          flyerId: 'FLYER002',
          address: '埼玉県さいたま市浦和区高砂1-2-1',
          periodFrom: '2024-11-15',
          periodTo: '2024-11-21',
          status: 'active',
          images: []
        },
        {
          id: 3,
          companyId: 'COMP002',
          companyName: '株式会社ライフコーポレーション',
          storeId: 'STORE003',
          storeName: 'ライフ品川店',
          flyerId: 'FLYER003',
          address: '東京都品川区北品川5-5-15',
          periodFrom: '2024-11-20',
          periodTo: '2024-11-26',
          status: 'active',
          images: []
        },
        {
          id: 4,
          companyId: 'COMP002',
          companyName: '株式会社ライフコーポレーション',
          storeId: 'STORE004',
          storeName: 'ライフ梅田店',
          flyerId: 'FLYER004',
          address: '大阪府大阪市北区梅田1-11-4',
          periodFrom: '2024-11-01',
          periodTo: '2024-11-07',
          status: 'inactive',
          images: []
        },
        {
          id: 5,
          companyId: 'COMP003',
          companyName: '株式会社イオンリテール',
          storeId: 'STORE005',
          storeName: 'イオン幕張新都心店',
          flyerId: 'FLYER005',
          address: '千葉県千葉市美浜区豊砂1-1',
          periodFrom: '2024-11-22',
          periodTo: '2024-11-28',
          status: 'scheduled',
          images: []
        },
        {
          id: 6,
          companyId: 'COMP003',
          companyName: '株式会社イオンリテール',
          storeId: 'STORE006',
          storeName: 'イオンレイクタウン店',
          flyerId: 'FLYER006',
          address: '埼玉県越谷市レイクタウン3-1-1',
          periodFrom: '2024-11-16',
          periodTo: '2024-11-22',
          status: 'active',
          images: []
        },
        {
          id: 7,
          companyId: 'COMP004',
          companyName: '株式会社サミットストア',
          storeId: 'STORE007',
          storeName: 'サミット高田馬場店',
          flyerId: 'FLYER007',
          address: '東京都新宿区高田馬場3-35-1',
          periodFrom: '2024-11-18',
          periodTo: '2024-11-24',
          status: 'active',
          images: []
        },
        {
          id: 8,
          companyId: 'COMP004',
          companyName: '株式会社サミットストア',
          storeId: 'STORE008',
          storeName: 'サミット中野店',
          flyerId: 'FLYER008',
          address: '東京都中野区中野2-30-9',
          periodFrom: '2024-10-25',
          periodTo: '2024-10-31',
          status: 'inactive',
          images: []
        },
        {
          id: 9,
          companyId: 'COMP005',
          companyName: '株式会社ヨークベニマル',
          storeId: 'STORE009',
          storeName: 'ヨークベニマル郡山店',
          flyerId: 'FLYER009',
          address: '福島県郡山市中町12-2',
          periodFrom: '2024-11-19',
          periodTo: '2024-11-25',
          status: 'active',
          images: []
        },
        {
          id: 10,
          companyId: 'COMP005',
          companyName: '株式会社ヨークベニマル',
          storeId: 'STORE010',
          storeName: 'ヨークベニマル仙台店',
          flyerId: 'FLYER010',
          address: '宮城県仙台市青葉区中央3-6-1',
          periodFrom: '2024-11-25',
          periodTo: '2024-12-01',
          status: 'scheduled',
          images: []
        },
        {
          id: 11,
          companyId: 'COMP006',
          companyName: '株式会社西友',
          storeId: 'STORE011',
          storeName: '西友池袋店',
          flyerId: 'FLYER011',
          address: '東京都豊島区南池袋1-28-1',
          periodFrom: '2024-11-15',
          periodTo: '2024-11-21',
          status: 'active',
          images: []
        },
        {
          id: 12,
          companyId: 'COMP006',
          companyName: '株式会社西友',
          storeId: 'STORE012',
          storeName: '西友西新井店',
          flyerId: 'FLYER012',
          address: '東京都足立区西新井栄町1-17-1',
          periodFrom: '2024-11-20',
          periodTo: '2024-11-26',
          status: 'active',
          images: []
        },
        {
          id: 13,
          companyId: 'COMP007',
          companyName: '株式会社イトーヨーカ堂',
          storeId: 'STORE013',
          storeName: 'イトーヨーカ堂木場店',
          flyerId: 'FLYER013',
          address: '東京都江東区木場2-18-11',
          periodFrom: '2024-11-08',
          periodTo: '2024-11-14',
          status: 'inactive',
          images: []
        },
        {
          id: 14,
          companyId: 'COMP008',
          companyName: '株式会社ベルク',
          storeId: 'STORE014',
          storeName: 'ベルク所沢店',
          flyerId: 'FLYER014',
          address: '埼玉県所沢市日吉町11-16',
          periodFrom: '2024-11-21',
          periodTo: '2024-11-27',
          status: 'active',
          images: []
        },
        {
          id: 15,
          companyId: 'COMP009',
          companyName: '株式会社オーケー',
          storeId: 'STORE015',
          storeName: 'オーケー横浜西口店',
          flyerId: 'FLYER015',
          address: '神奈川県横浜市西区南幸2-1-22',
          periodFrom: '2024-10-28',
          periodTo: '2024-11-03',
          status: 'inactive',
          images: []
        },
        {
          id: 16,
          companyId: 'COMP010',
          companyName: '株式会社バロー',
          storeId: 'STORE016',
          storeName: 'バロー多治見店',
          flyerId: 'FLYER016',
          address: '岐阜県多治見市住吉町2-50',
          periodFrom: '2024-11-23',
          periodTo: '2024-11-29',
          status: 'scheduled',
          images: []
        },
        {
          id: 17,
          companyId: 'COMP011',
          companyName: '株式会社アークス',
          storeId: 'STORE017',
          storeName: 'アークス札幌駅前店',
          flyerId: 'FLYER017',
          address: '北海道札幌市中央区北4条西4-1',
          periodFrom: '2024-11-17',
          periodTo: '2024-11-23',
          status: 'active',
          images: []
        },
        {
          id: 18,
          companyId: 'COMP012',
          companyName: '株式会社万代',
          storeId: 'STORE018',
          storeName: '万代天王寺店',
          flyerId: 'FLYER018',
          address: '大阪府大阪市天王寺区堀越町17-1',
          periodFrom: '2024-11-14',
          periodTo: '2024-11-20',
          status: 'active',
          images: []
        },
        {
          id: 19,
          companyId: 'COMP013',
          companyName: '株式会社平和堂',
          storeId: 'STORE019',
          storeName: '平和堂彦根店',
          flyerId: 'FLYER019',
          address: '滋賀県彦根市古沢町255-1',
          periodFrom: '2024-11-24',
          periodTo: '2024-11-30',
          status: 'scheduled',
          images: []
        },
        {
          id: 20,
          companyId: 'COMP014',
          companyName: '株式会社フジ',
          storeId: 'STORE020',
          storeName: 'フジグラン松山店',
          flyerId: 'FLYER020',
          address: '愛媛県松山市宮西1-2-1',
          periodFrom: '2024-11-19',
          periodTo: '2024-11-25',
          status: 'active',
          images: []
        }
      ]
    }
  },
  computed: {
    paginatedFlyers() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredFlyers.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredFlyers.length / this.itemsPerPage)
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
      return this.paginatedFlyers.length > 0 &&
        this.selectedIds.length === this.filteredFlyers.length
    }
  },
  mounted() {
    // 認証チェック
    this.adminStore.checkAuth()
    if (!this.adminStore.isAuthenticated) {
      this.$router.push('/admin/login')
      return
    }

    // 全チラシを読み込み
    this.loadAllFlyers()
  },
  methods: {
    loadAllFlyers() {
      // 全チラシを読み込んで初期表示
      this.allFlyers = [...this.flyers]
      this.filteredFlyers = [...this.flyers]
    },
    search() {
      // ベースとなるデータセット
      let results = [...this.flyers]

      // 非システム管理者の場合、自動的にcompanyIdでフィルタリング
      if (!this.adminStore.isSystemAdmin && this.adminStore.user?.companyId) {
        results = results.filter(f => f.companyId === this.adminStore.user.companyId)
      }

      // 店舗ユーザーの場合、自動的にstoreIdでフィルタリング
      if (this.adminStore.isStoreUser && this.adminStore.user?.storeId) {
        results = results.filter(f => f.storeId === this.adminStore.user.storeId)
      }

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

      // フィルタリング結果を設定
      this.filteredFlyers = results
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
  cursor: grab;
  user-select: none;
}

.table-container:active {
  cursor: grabbing;
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
