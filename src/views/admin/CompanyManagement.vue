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
import api from '@/services/api'

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
      allCompanies: [],
      filteredCompanies: [],
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

      this.filteredCompanies = companies
    },
    loadAllCompanies() {
      // 初期表示時は全企業を表示
      this.filteredCompanies = [...this.companies]
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
    async bulkActivate() {
      if (confirm(`選択した${this.selectedIds.length}件の企業を有効化しますか？`)) {
        try {
          await api.admin.bulkUpdateCompanyStatus(this.selectedIds, 'active')
          this.selectedIds.forEach(id => {
            const company = this.companies.find(c => c.id === id)
            if (company) company.contractStatus = 'active'
          })
          alert('企業を有効化しました')
          this.selectedIds = []
        } catch (error) {
          console.error('Bulk activate error:', error)
          alert('企業の有効化に失敗しました')
        }
      }
    },
    async bulkSuspend() {
      if (confirm(`選択した${this.selectedIds.length}件の企業を停止しますか？`)) {
        try {
          await api.admin.bulkUpdateCompanyStatus(this.selectedIds, 'suspended')
          this.selectedIds.forEach(id => {
            const company = this.companies.find(c => c.id === id)
            if (company) company.contractStatus = 'suspended'
          })
          alert('企業を停止しました')
          this.selectedIds = []
        } catch (error) {
          console.error('Bulk suspend error:', error)
          alert('企業の停止に失敗しました')
        }
      }
    },
    handleLogout() {
      if (confirm('ログアウトしますか？')) {
        this.adminStore.logout()
        this.$router.push('/admin/login')
      }
    },
    async loadCompanies() {
      this.loading = true
      try {
        const params = {}
        const response = await api.admin.getCompanies(params)
        this.companies = response.companies || []
        this.allCompanies = [...this.companies]
        this.loadAllCompanies()
      } catch (error) {
        console.error('Load companies error:', error)
        alert('企業一覧の取得に失敗しました')
        this.companies = []
        this.allCompanies = []
      } finally {
        this.loading = false
      }
    },
    loadCompaniesDummy() {
      // 削除: ダミーデータ
      this.companies = [
        {
          id: 1,
          companyId: 'COMP001',
          name: '株式会社マルエツ',
          address: '東京都千代田区丸の内1-1-1',
          contactName: '山田太郎',
          phone: '03-1234-5678',
          email: 'yamada@maruetsu.co.jp',
          contractStatus: 'active',
          contractPlan: 'premium',
          contractStartDate: '2024-01-01',
          contractEndDate: '2025-12-31'
        },
        {
          id: 2,
          companyId: 'COMP002',
          name: '株式会社ライフコーポレーション',
          address: '大阪府大阪市北区梅田2-2-2',
          contactName: '佐藤花子',
          phone: '06-9876-5432',
          email: 'sato@lifecorp.co.jp',
          contractStatus: 'active',
          contractPlan: 'standard',
          contractStartDate: '2024-03-01',
          contractEndDate: '2025-02-28'
        },
        {
          id: 3,
          companyId: 'COMP003',
          name: '株式会社イオンリテール',
          address: '千葉県千葉市美浜区中瀬1-5-1',
          contactName: '鈴木一郎',
          phone: '043-212-6000',
          email: 'suzuki@aeon.co.jp',
          contractStatus: 'active',
          contractPlan: 'premium',
          contractStartDate: '2023-04-01',
          contractEndDate: '2025-03-31'
        },
        {
          id: 4,
          companyId: 'COMP004',
          name: '株式会社サミットストア',
          address: '東京都杉並区永福2-54-7',
          contactName: '田中次郎',
          phone: '03-3328-1111',
          email: 'tanaka@summitstore.co.jp',
          contractStatus: 'active',
          contractPlan: 'standard',
          contractStartDate: '2024-02-01',
          contractEndDate: '2025-01-31'
        },
        {
          id: 5,
          companyId: 'COMP005',
          name: '株式会社ヨークベニマル',
          address: '福島県郡山市中町17-1',
          contactName: '高橋美咲',
          phone: '024-923-1111',
          email: 'takahashi@yorkbenimaru.co.jp',
          contractStatus: 'active',
          contractPlan: 'basic',
          contractStartDate: '2024-05-01',
          contractEndDate: '2025-04-30'
        },
        {
          id: 6,
          companyId: 'COMP006',
          name: '株式会社西友',
          address: '東京都北区赤羽2-1-1',
          contactName: '渡辺健太',
          phone: '03-3903-5111',
          email: 'watanabe@seiyu.co.jp',
          contractStatus: 'active',
          contractPlan: 'premium',
          contractStartDate: '2023-10-01',
          contractEndDate: '2025-09-30'
        },
        {
          id: 7,
          companyId: 'COMP007',
          name: '株式会社イトーヨーカ堂',
          address: '東京都千代田区二番町8-8',
          contactName: '伊藤真理子',
          phone: '03-6238-3000',
          email: 'ito@itoyokado.co.jp',
          contractStatus: 'active',
          contractPlan: 'premium',
          contractStartDate: '2024-01-15',
          contractEndDate: '2026-01-14'
        },
        {
          id: 8,
          companyId: 'COMP008',
          name: '株式会社ベルク',
          address: '埼玉県鶴ヶ島市脚折1513',
          contactName: '小林誠',
          phone: '049-286-0001',
          email: 'kobayashi@belc.co.jp',
          contractStatus: 'active',
          contractPlan: 'standard',
          contractStartDate: '2024-06-01',
          contractEndDate: '2025-05-31'
        },
        {
          id: 9,
          companyId: 'COMP009',
          name: '株式会社オーケー',
          address: '神奈川県横浜市西区みなとみらい3-3-3',
          contactName: '加藤由美',
          phone: '045-680-0123',
          email: 'kato@ok-corporation.co.jp',
          contractStatus: 'inactive',
          contractPlan: 'basic',
          contractStartDate: '2023-08-01',
          contractEndDate: '2024-07-31'
        },
        {
          id: 10,
          companyId: 'COMP010',
          name: '株式会社バロー',
          address: '岐阜県多治見市大針町661-1',
          contactName: '中村修',
          phone: '0572-20-1100',
          email: 'nakamura@valor.co.jp',
          contractStatus: 'active',
          contractPlan: 'standard',
          contractStartDate: '2024-04-01',
          contractEndDate: '2025-03-31'
        },
        {
          id: 11,
          companyId: 'COMP011',
          name: '株式会社アークス',
          address: '北海道札幌市中央区南13条西11-2-32',
          contactName: '木村恵子',
          phone: '011-530-6100',
          email: 'kimura@arcs-group.co.jp',
          contractStatus: 'active',
          contractPlan: 'premium',
          contractStartDate: '2023-11-01',
          contractEndDate: '2025-10-31'
        },
        {
          id: 12,
          companyId: 'COMP012',
          name: '株式会社万代',
          address: '大阪府大阪市住之江区泉1-1-82',
          contactName: '林大輔',
          phone: '06-6681-3000',
          email: 'hayashi@mandai.co.jp',
          contractStatus: 'active',
          contractPlan: 'basic',
          contractStartDate: '2024-07-01',
          contractEndDate: '2025-06-30'
        },
        {
          id: 13,
          companyId: 'COMP013',
          name: '株式会社平和堂',
          address: '滋賀県彦根市西今町1',
          contactName: '森下智子',
          phone: '0749-23-3111',
          email: 'morishita@heiwado.jp',
          contractStatus: 'active',
          contractPlan: 'standard',
          contractStartDate: '2024-02-15',
          contractEndDate: '2025-02-14'
        },
        {
          id: 14,
          companyId: 'COMP014',
          name: '株式会社フジ',
          address: '愛媛県松山市宮西1-2-1',
          contactName: '藤田浩二',
          phone: '089-933-2600',
          email: 'fujita@the-fuji.com',
          contractStatus: 'suspended',
          contractPlan: 'standard',
          contractStartDate: '2023-12-01',
          contractEndDate: '2024-11-30'
        },
        {
          id: 15,
          companyId: 'COMP015',
          name: '株式会社マックスバリュ東海',
          address: '静岡県浜松市中区砂山町1-1',
          contactName: '松本香織',
          phone: '053-451-5000',
          email: 'matsumoto@mv-tokai.co.jp',
          contractStatus: 'active',
          contractPlan: 'premium',
          contractStartDate: '2024-03-15',
          contractEndDate: '2026-03-14'
        },
        {
          id: 16,
          companyId: 'COMP016',
          name: '株式会社ヤオコー',
          address: '埼玉県川越市新富町1-22',
          contactName: '井上勇',
          phone: '049-227-6211',
          email: 'inoue@yaoko.co.jp',
          contractStatus: 'active',
          contractPlan: 'standard',
          contractStartDate: '2024-08-01',
          contractEndDate: '2025-07-31'
        },
        {
          id: 17,
          companyId: 'COMP017',
          name: '株式会社ダイエー',
          address: '兵庫県神戸市中央区港島中町6-2-1',
          contactName: '清水明美',
          phone: '078-302-5000',
          email: 'shimizu@daiei.co.jp',
          contractStatus: 'expired',
          contractPlan: 'basic',
          contractStartDate: '2022-09-01',
          contractEndDate: '2023-08-31'
        },
        {
          id: 18,
          companyId: 'COMP018',
          name: '株式会社コープさっぽろ',
          address: '北海道札幌市西区発寒11条5-10-1',
          contactName: '石川直樹',
          phone: '011-668-8000',
          email: 'ishikawa@sapporo.coop',
          contractStatus: 'active',
          contractPlan: 'standard',
          contractStartDate: '2024-09-01',
          contractEndDate: '2025-08-31'
        },
        {
          id: 19,
          companyId: 'COMP019',
          name: '株式会社マルナカ',
          address: '香川県高松市丸亀町13-3',
          contactName: '岡田聡子',
          phone: '087-851-1515',
          email: 'okada@marunaka.co.jp',
          contractStatus: 'active',
          contractPlan: 'basic',
          contractStartDate: '2024-10-01',
          contractEndDate: '2025-09-30'
        },
        {
          id: 20,
          companyId: 'COMP020',
          name: '株式会社サンリブ',
          address: '福岡県北九州市小倉南区上葛原2-14-1',
          contactName: '前田和彦',
          phone: '093-932-1700',
          email: 'maeda@sunlive.co.jp',
          contractStatus: 'active',
          contractPlan: 'premium',
          contractStartDate: '2023-06-01',
          contractEndDate: '2025-05-31'
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

    // 権限チェック（システム管理者のみ）
    if (!this.adminStore.isSystemAdmin) {
      alert('この機能はシステム管理者のみ利用可能です')
      this.$router.push('/admin')
      return
    }

    this.loadCompanies()
    this.loadAllCompanies()
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
