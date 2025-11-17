<template>
  <div class="top-page">
    <!-- CTAボタン -->
    <section class="cta-buttons">
      <button class="btn btn-primary" @click="scrollToProducts">
        📊 商品を見る
      </button>
    </section>

    <!-- メインコンテンツエリア -->
    <div class="main-container">
      <!-- メインコンテンツ -->
      <main class="main-content">
        <!-- 検索フォーム -->
        <section class="search-section">
      <div class="search-container">
        <h2 class="search-title">商品を検索</h2>
        
        <div class="search-form">
          <!-- フリーワード検索 -->
          <div class="search-input-wrapper">
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="商品名で検索（例: 牛乳、卵、パンなど）"
              class="search-input"
              @keyup.enter="performSearch"
            />
            <button class="search-button" @click="performSearch">
              🔍 検索
            </button>
          </div>

          <!-- カテゴリ検索 -->
          <div class="category-filter">
            <label class="filter-label">カテゴリで絞り込み:</label>
            <div class="category-chips">
              <button 
                v-for="category in categories" 
                :key="category"
                :class="['category-chip', { active: selectedCategory === category }]"
                @click="selectCategory(category)"
              >
                {{ category }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 検索結果 -->
    <section v-if="hasSearched" class="search-results">
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

      <!-- 人気商品の価格推移 -->
      <section class="products" ref="productsSection">
      <h2 class="section-title">人気商品の価格推移</h2>

      <div v-if="loading && !hasSearched" class="loading">
        <p>読み込み中...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>

      <div v-else class="products-grid grid grid-2">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          />
        </div>
      </section>

      <!-- 家計・物価コラム -->
      <ArticleList :limit="8" />

      <!-- CTAセクション -->
      <section class="cta">
      <div class="cta-content">
        <h2 class="cta-title">今すぐ始めよう</h2>
        <p class="cta-description">
          無料で価格変動をチェック。賢い買い物で家計を守りましょう。
        </p>
        </div>
      </section>
      </main>

      <!-- サイドバー -->
      <aside class="sidebar">
        <h2 class="sidebar-title">人気商品</h2>

        <div v-for="categoryData in popularProductsByCategory" :key="categoryData.category" class="popular-category">
          <h3 class="popular-category-title">{{ categoryData.category }}</h3>
          <div class="popular-products-list">
            <router-link
              v-for="product in categoryData.products"
              :key="product.id"
              :to="`/item/${product.id}`"
              class="popular-product-item"
            >
              <span class="popular-product-name">{{ product.name }}</span>
              <span class="popular-product-price">¥{{ product.lowestPrice }}</span>
            </router-link>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import ArticleList from '@/components/ArticleList.vue'
import api from '@/services/api'
import { useMainStore } from '@/store'

export default {
  name: 'TopPage',
  components: {
    ProductCard,
    ArticleList
  },
  data() {
    return {
      products: [],
      loading: true,
      error: null,
      searchQuery: '',
      selectedCategory: '',
      hasSearched: false,
      currentPage: 1,
      itemsPerPage: 10,
      categories: [
        '飲料',
        'お菓子・おつまみ',
        '生鮮食品',
        '冷蔵・冷凍',
        '調味料',
        'パン・シリアル',
        '日用品',
        'その他'
      ]
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
    },
    popularProductsByCategory() {
      // 表示するカテゴリ（3つ）
      const targetCategories = ['飲料', '生鮮食品', 'お菓子・おつまみ']

      return targetCategories.map(category => {
        // カテゴリごとに商品を取得（最大3件）
        const categoryProducts = this.products
          .filter(p => p.category === category)
          .slice(0, 3)

        return {
          category,
          products: categoryProducts
        }
      }).filter(cat => cat.products.length > 0) // 商品が存在するカテゴリのみ返す
    }
  },
  async mounted() {
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
    performSearch() {
      this.hasSearched = true
      this.currentPage = 1
      // スクロールして検索結果を表示
      this.$nextTick(() => {
        const resultsSection = document.querySelector('.search-results')
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },
    selectCategory(category) {
      if (this.selectedCategory === category) {
        this.selectedCategory = ''
      } else {
        this.selectedCategory = category
      }
    },
    goToPage(page) {
      this.currentPage = page
      // スクロールして検索結果の先頭を表示
      this.$nextTick(() => {
        const resultsSection = document.querySelector('.search-results')
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },
    clearSearch() {
      this.searchQuery = ''
      this.selectedCategory = ''
      this.hasSearched = false
      this.currentPage = 1
    },
    scrollToProducts() {
      this.$refs.productsSection?.scrollIntoView({ behavior: 'smooth' })
    }
  }
}
</script>

<style scoped>
.top-page {
  padding-bottom: 60px;
}

/* メインコンテナ */
.main-container {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* サイドバー */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
}

.sidebar-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--primary-color);
}

.popular-category {
  margin-bottom: 32px;
}

.popular-category-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 4px solid var(--primary-color);
}

.popular-products-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.popular-product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.popular-product-item:hover {
  background-color: var(--bg-light);
  transform: translateX(4px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.popular-product-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popular-product-price {
  font-size: 14px;
  font-weight: bold;
  color: var(--primary-color);
  margin-left: 8px;
}

/* メインコンテンツ */
.main-content {
  flex: 1;
  min-width: 0;
}

/* CTAボタン */
.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

/* 検索セクション */
.search-section {
  margin-bottom: 48px;
}

.search-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 40px;
  color: white;
}

.search-title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.search-input-wrapper {
  display: flex;
  gap: 12px;
}

.search-input {
  flex: 1;
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
}

.search-button {
  padding: 16px 32px;
  background-color: white;
  color: var(--primary-color);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.category-filter {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-label {
  font-size: 16px;
  font-weight: 600;
}

.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-chip {
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-chip:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.category-chip.active {
  background-color: white;
  color: var(--primary-color);
  border-color: white;
}

/* 検索結果 */
.search-results {
  margin-bottom: 48px;
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

/* 商品セクション */
.products {
  margin-bottom: 60px;
}

.section-title {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40px;
  color: var(--text-primary);
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

/* CTAセクション */
.cta {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  color: white;
}

.cta-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 16px;
}

.cta-description {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.95;
}

.btn-large {
  padding: 16px 32px;
  font-size: 18px;
}

@media (max-width: 1024px) {
  .main-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    position: static;
  }

  .popular-category {
    margin-bottom: 24px;
  }
}

@media (max-width: 768px) {
  .search-container {
    padding: 24px;
  }

  .search-title {
    font-size: 24px;
  }

  .search-input-wrapper {
    flex-direction: column;
  }

  .search-button {
    width: 100%;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .cta {
    padding: 40px 20px;
  }

  .cta-title {
    font-size: 28px;
  }

  .cta-description {
    font-size: 16px;
  }

  .section-title {
    font-size: 24px;
  }

  .sidebar-title {
    font-size: 18px;
  }

  .popular-products-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
  }
}
</style>