<template>
  <div class="product-list">
    <!-- パンくずリスト -->
    <nav class="breadcrumb">
      <router-link to="/top" class="breadcrumb-item">トップ</router-link>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item active">商品検索結果</span>
    </nav>

    <div class="page-header">
      <h1 class="page-title">商品検索結果</h1>
      <div class="search-info">
        <p v-if="searchQuery" class="search-query">
          キーワード: <strong>{{ searchQuery }}</strong>
        </p>
        <p v-if="selectedCategory" class="search-category">
          カテゴリ: <strong>{{ selectedCategory }}</strong>
        </p>
      </div>
    </div>

    <!-- 検索結果 -->
    <section class="search-results">
      <div class="results-header">
        <h2 class="section-title">
          検索結果
          <span class="result-count">（{{ filteredProducts.length }}件）</span>
        </h2>
        <button class="clear-search" @click="clearSearch">
          ✕ 検索をクリア
        </button>
      </div>

      <div v-if="loading" class="loading">
        <p>検索中...</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="no-results">
        <p>該当する商品が見つかりませんでした</p>
        <p class="no-results-hint">別のキーワードやカテゴリで検索してみてください</p>
        <router-link to="/top" class="back-link">トップに戻る</router-link>
      </div>

      <div v-else class="products-grid grid grid-2">
        <ProductCard
          v-for="product in paginatedProducts"
          :key="product.id"
          :product="product"
        />
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
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import { useMainStore } from '@/store'
import api from '@/services/api'

export default {
  name: 'ProductList',
  components: {
    ProductCard
  },
  data() {
    return {
      products: [],
      loading: true,
      error: null,
      searchQuery: '',
      selectedCategory: '',
      currentPage: 1,
      itemsPerPage: 12
    }
  },
  computed: {
    filteredProducts() {
      let results = [...this.products]

      // カテゴリフィルター
      if (this.selectedCategory) {
        results = results.filter(p => p.category === this.selectedCategory)
      }

      // キーワード検索
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        results = results.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        )
      }

      return results
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredProducts.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage)
    }
  },
  async mounted() {
    // クエリパラメータから検索条件を取得
    this.searchQuery = this.$route.query.q || ''
    this.selectedCategory = this.$route.query.category || ''

    await this.loadProducts()
  },
  methods: {
    async loadProducts() {
      try {
        this.loading = true
        this.error = null
        const data = await api.getProducts()
        this.products = data

        const store = useMainStore()
        store.setProducts(data)
      } catch (err) {
        this.error = '商品情報の取得に失敗しました'
        console.error(err)
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
    }
  }
}
</script>

<style scoped>
.product-list {
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
.search-category {
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

.products-grid {
  margin-top: 30px;
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
  .product-list {
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
}
</style>
