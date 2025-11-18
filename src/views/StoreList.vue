<template>
  <div class="store-list">
    <!-- パンくずリスト -->
    <nav class="breadcrumb">
      <router-link to="/top" class="breadcrumb-item">トップ</router-link>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item active">店舗検索結果</span>
    </nav>

    <div class="page-header">
      <h1 class="page-title">店舗検索結果</h1>
      <div class="search-info">
        <p v-if="searchQuery" class="search-query">
          キーワード: <strong>{{ searchQuery }}</strong>
        </p>
        <p v-if="selectedRegion" class="search-region">
          地域: <strong>{{ selectedRegion }}</strong>
        </p>
        <p v-if="selectedPrefecture" class="search-prefecture">
          都道府県: <strong>{{ selectedPrefecture }}</strong>
        </p>
      </div>
    </div>

    <!-- 検索結果 -->
    <section class="search-results">
      <div class="results-header">
        <h2 class="section-title">
          検索結果
          <span class="result-count">（{{ filteredStores.length }}件）</span>
        </h2>
        <button class="clear-search" @click="clearSearch">
          ✕ 検索をクリア
        </button>
      </div>

      <div v-if="loading" class="loading">
        <p>検索中...</p>
      </div>

      <div v-else-if="filteredStores.length === 0" class="no-results">
        <p>該当する店舗が見つかりませんでした</p>
        <p class="no-results-hint">別のキーワードや地域で検索してみてください</p>
        <router-link to="/top" class="back-link">トップに戻る</router-link>
      </div>

      <div v-else class="stores-grid">
        <div
          v-for="store in paginatedStores"
          :key="store.id"
          class="store-card"
          @click="openFlyerModal(store)"
        >
          <img :src="store.logo" :alt="store.name" class="store-logo" />
          <div class="store-info">
            <h3 class="store-name">{{ store.name }}</h3>
            <p class="store-period">セール期間: {{ store.salePeriod }}</p>
          </div>
        </div>
      </div>

      <!-- ページネーション -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          ← 前へ
        </button>

        <div class="page-numbers">
          <button
            v-for="page in totalPages"
            :key="page"
            :class="['page-number', { active: currentPage === page }]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          次へ →
        </button>
      </div>
    </section>

    <!-- チラシモーダル -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">✕</button>
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedStore?.name }}</h2>
          <p class="modal-period">セール期間: {{ selectedStore?.salePeriod }}</p>
        </div>
        <div class="modal-body">
          <img
            :src="selectedStore?.flyerImage"
            :alt="selectedStore?.name"
            class="flyer-image"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StoreList',
  data() {
    return {
      stores: [],
      loading: true,
      error: null,
      searchQuery: '',
      selectedRegion: '',
      selectedPrefecture: '',
      currentPage: 1,
      itemsPerPage: 12,
      showModal: false,
      selectedStore: null
    }
  },
  computed: {
    filteredStores() {
      let results = [...this.stores]

      // 地域フィルター
      if (this.selectedRegion) {
        results = results.filter(s => s.region === this.selectedRegion)
      }

      // 都道府県フィルター
      if (this.selectedPrefecture) {
        results = results.filter(s => s.prefecture === this.selectedPrefecture)
      }

      // キーワード検索
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        results = results.filter(s =>
          s.name.toLowerCase().includes(query)
        )
      }

      return results
    },
    paginatedStores() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredStores.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredStores.length / this.itemsPerPage)
    }
  },
  mounted() {
    // クエリパラメータから検索条件を取得
    this.searchQuery = this.$route.query.q || ''
    this.selectedRegion = this.$route.query.region || ''
    this.selectedPrefecture = this.$route.query.prefecture || ''

    this.loadStores()
  },
  methods: {
    loadStores() {
      // ダミーデータ（実際はAPIから取得）
      this.stores = [
        {
          id: 1,
          name: 'イオン大宮店',
          logo: 'https://via.placeholder.com/150x100?text=AEON',
          region: '関東',
          prefecture: '埼玉県',
          salePeriod: '11/15 - 11/21',
          flyerImage: 'https://via.placeholder.com/800x1000?text=AEON+Flyer'
        },
        {
          id: 2,
          name: 'マルエツ浦和店',
          logo: 'https://via.placeholder.com/150x100?text=Maruetsu',
          region: '関東',
          prefecture: '埼玉県',
          salePeriod: '11/16 - 11/22',
          flyerImage: 'https://via.placeholder.com/800x1000?text=Maruetsu+Flyer'
        },
        {
          id: 3,
          name: 'ライフ品川店',
          logo: 'https://via.placeholder.com/150x100?text=LIFE',
          region: '関東',
          prefecture: '東京都',
          salePeriod: '11/17 - 11/23',
          flyerImage: 'https://via.placeholder.com/800x1000?text=LIFE+Flyer'
        },
        {
          id: 4,
          name: 'サミット渋谷店',
          logo: 'https://via.placeholder.com/150x100?text=Summit',
          region: '関東',
          prefecture: '東京都',
          salePeriod: '11/18 - 11/24',
          flyerImage: 'https://via.placeholder.com/800x1000?text=Summit+Flyer'
        },
        {
          id: 5,
          name: 'オーケー川崎店',
          logo: 'https://via.placeholder.com/150x100?text=OK',
          region: '関東',
          prefecture: '神奈川県',
          salePeriod: '11/19 - 11/25',
          flyerImage: 'https://via.placeholder.com/800x1000?text=OK+Flyer'
        },
        {
          id: 6,
          name: 'イトーヨーカドー新宿店',
          logo: 'https://via.placeholder.com/150x100?text=Ito+Yokado',
          region: '関東',
          prefecture: '東京都',
          salePeriod: '11/20 - 11/26',
          flyerImage: 'https://via.placeholder.com/800x1000?text=Ito+Yokado+Flyer'
        }
      ]
      this.loading = false
    },
    goToPage(page) {
      this.currentPage = page
      // スクロールして検索結果の先頭を表示
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    clearSearch() {
      this.$router.push('/top')
    },
    openFlyerModal(store) {
      this.selectedStore = store
      this.showModal = true
      // モーダルが開いているときはスクロールを無効化
      document.body.style.overflow = 'hidden'
    },
    closeModal() {
      this.showModal = false
      this.selectedStore = null
      // モーダルを閉じたらスクロールを有効化
      document.body.style.overflow = ''
    }
  }
}
</script>

<style scoped>
.store-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  padding-bottom: 60px;
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16px;
  padding: 40px;
  color: white;
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 16px;
}

.search-info {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.search-query,
.search-region,
.search-prefecture {
  font-size: 16px;
  opacity: 0.95;
}

/* 検索結果 */
.search-results {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
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

.clear-search {
  padding: 8px 16px;
  background-color: transparent;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-search:hover {
  border-color: var(--danger-color);
  color: var(--danger-color);
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 12px;
}

.no-results p {
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.no-results-hint {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.back-link {
  display: inline-block;
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-link:hover {
  background-color: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.stores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 30px;
}

.store-card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.store-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.store-logo {
  width: 100%;
  height: 80px;
  object-fit: contain;
  margin-bottom: 16px;
}

.store-info {
  text-align: center;
}

.store-name {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.store-period {
  font-size: 14px;
  color: var(--text-secondary);
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: var(--text-secondary);
}

.error {
  color: var(--danger-color);
}

/* ページネーション */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 10px 20px;
  background-color: white;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background-color: var(--bg-light);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.page-number {
  min-width: 40px;
  height: 40px;
  padding: 8px;
  background-color: white;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background-color: var(--bg-light);
}

.page-number.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.modal-close:hover {
  background-color: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.modal-header {
  padding: 32px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.modal-period {
  font-size: 16px;
  color: var(--text-secondary);
}

.modal-body {
  padding: 32px;
}

.modal-body .flyer-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .store-list {
    padding: 16px;
  }

  .page-header {
    padding: 24px;
  }

  .page-title {
    font-size: 24px;
  }

  .search-info {
    flex-direction: column;
    gap: 8px;
  }

  .section-title {
    font-size: 20px;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .stores-grid {
    grid-template-columns: 1fr;
  }

  .modal-header {
    padding: 24px;
  }

  .modal-body {
    padding: 24px;
  }

  .modal-title {
    font-size: 22px;
  }
}
</style>
