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
    <FlyerModal
      :show="showModal"
      :store="selectedStore"
      :active-tab="activeTab"
      :current-flyer-image-index="currentFlyerImageIndex"
      :current-recipe-index="currentRecipeIndex"
      :recipes="recipes"
      :is-loading-recipe="isLoadingRecipe"
      @close="closeModal"
      @generate-recipes="generateRecipes"
      @switch-tab="switchTab"
      @previous-flyer-image="previousFlyerImage"
      @next-flyer-image="nextFlyerImage"
      @go-to-flyer-image="goToFlyerImage"
      @previous-recipe="previousRecipe"
      @next-recipe="nextRecipe"
      @go-to-recipe="goToRecipe"
      @share-sns="shareToSNS"
    />
  </div>
</template>

<script>
import FlyerModal from '@/components/FlyerModal.vue'
import api from '@/services/api'

export default {
  name: 'StoreList',
  components: {
    FlyerModal
  },
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
      selectedStore: null,
      // モーダルの新機能用
      activeTab: 'flyer', // 'flyer' or 'recipe'
      currentFlyerImageIndex: 0,
      currentRecipeIndex: 0,
      recipes: [], // 生成されたレシピ
      isLoadingRecipe: false
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
    async loadStores() {
      try {
        this.loading = true
        this.error = null

        const params = {}
        if (this.searchQuery) params.q = this.searchQuery
        if (this.selectedRegion) params.region = this.selectedRegion
        if (this.selectedPrefecture) params.prefecture = this.selectedPrefecture
        if (this.$route.query.address) params.address = this.$route.query.address

        const data = await api.getStores(params)
        this.stores = data
      } catch (err) {
        this.error = '店舗情報の取得に失敗しました'
        console.error('店舗情報の取得に失敗しました:', err)
        this.stores = []
      } finally {
        this.loading = false
      }
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
      this.activeTab = 'flyer'
      this.currentFlyerImageIndex = 0
      this.currentRecipeIndex = 0
      this.recipes = []
    },
    closeModal() {
      this.showModal = false
      this.selectedStore = null
      this.activeTab = 'flyer'
      this.recipes = []
    },
    switchTab(tab) {
      this.activeTab = tab
    },
    nextFlyerImage() {
      if (this.selectedStore && this.currentFlyerImageIndex < this.selectedStore.flyerImages.length - 1) {
        this.currentFlyerImageIndex++
      }
    },
    previousFlyerImage() {
      if (this.currentFlyerImageIndex > 0) {
        this.currentFlyerImageIndex--
      }
    },
    goToFlyerImage(index) {
      this.currentFlyerImageIndex = index
    },
    nextRecipe() {
      if (this.currentRecipeIndex < this.recipes.length - 1) {
        this.currentRecipeIndex++
      }
    },
    previousRecipe() {
      if (this.currentRecipeIndex > 0) {
        this.currentRecipeIndex--
      }
    },
    goToRecipe(index) {
      this.currentRecipeIndex = index
    },
    async generateRecipes() {
      if (!this.selectedStore?.id) return

      try {
        this.isLoadingRecipe = true
        const data = await api.generateRecipe(this.selectedStore.id)
        this.recipes = data.recipes || []
        this.activeTab = 'recipe'
        this.currentRecipeIndex = 0
      } catch (err) {
        console.error('レシピ生成に失敗しました:', err)
        this.recipes = []
      } finally {
        this.isLoadingRecipe = false
      }
    },
    shareToSNS(platform) {
      if (this.recipes.length === 0) return
      const recipe = this.recipes[this.currentRecipeIndex]
      const text = `${recipe.title} - ${this.selectedStore?.name}のチラシからレシピ提案！`
      const url = window.location.href

      let shareUrl = ''
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
          break
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
          break
        case 'instagram':
          // Instagramは直接共有できないため、コピー機能を実装
          alert('Instagram用のテキストをコピーしました！アプリから投稿してください。')
          navigator.clipboard.writeText(text)
          return
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400')
      }
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
}
</style>
