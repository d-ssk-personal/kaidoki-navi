<template>
  <div class="top-page">
    <!-- 買いどきナビとは?セクション -->
    <section class="about-section">
      <button class="about-link" @click="showAboutModal = true">
        ❓ 買いどきナビとは?
      </button>
    </section>

    <!-- CTAボタン -->
    <section class="cta-buttons">
      <button class="btn btn-primary" @click="scrollToProducts">
        📊 商品を見る
      </button>
      <button class="btn btn-secondary">
        💚 LINE通知を受け取る
      </button>
    </section>

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
          v-for="product in filteredProducts" 
          :key="product.id" 
          :product="product" 
        />
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
        <button class="btn btn-primary btn-large">
          LINE通知を受け取る
        </button>
      </div>
    </section>

    <!-- 買いどきナビとは?モーダル -->
    <div v-if="showAboutModal" class="modal-overlay" @click="showAboutModal = false">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="showAboutModal = false">✕</button>
        
        <h2 class="modal-title">買いどきナビとは?</h2>
        
        <div class="modal-body">
          <div class="modal-hero">
            <p class="modal-description">
              価格変動を見逃さない<br>
              賢い買い物で家計を守る
            </p>
            <p class="modal-subdescription">
              2025年問題で物価高騰が続く今、買いどきナビが<br>
              商品の値上げ・値下げをリアルタイムでお知らせします
            </p>
          </div>

          <h3 class="modal-section-title">3つの特徴</h3>
          
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">📊</div>
              <div class="feature-content">
                <h4 class="feature-title">価格推移の可視化</h4>
                <p class="feature-description">
                  過去30日〜180日の価格変動をグラフで確認。買い時を逃しません。
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">🤖</div>
              <div class="feature-content">
                <h4 class="feature-title">AI要約</h4>
                <p class="feature-description">
                  最安値情報や値下げ傾向をAIが分析。節約のヒントをお届けします。
                </p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon">🔔</div>
              <div class="feature-content">
                <h4 class="feature-title">リアルタイム通知</h4>
                <p class="feature-description">
                  値上げ・値下げを即座にお知らせ。LINEやWebプッシュで受け取れます。
                </p>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-primary" @click="showAboutModal = false">
              閉じる
            </button>
          </div>
        </div>
      </div>
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
      showAboutModal: false,
      searchQuery: '',
      selectedCategory: '',
      hasSearched: false,
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
      this.performSearch()
    },
    clearSearch() {
      this.searchQuery = ''
      this.selectedCategory = ''
      this.hasSearched = false
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

/* 買いどきナビとは?セクション */
.about-section {
  text-align: center;
  margin-bottom: 24px;
}

.about-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: white;
  border: 2px solid var(--primary-color);
  border-radius: 24px;
  color: var(--primary-color);
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.about-link:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 28px;
  color: var(--text-secondary);
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background-color: var(--bg-light);
  color: var(--text-primary);
}

.modal-title {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  padding: 32px 32px 16px;
  color: var(--text-primary);
}

.modal-body {
  padding: 0 32px 32px;
}

.modal-hero {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 32px;
}

.modal-description {
  font-size: 24px;
  font-weight: bold;
  line-height: 1.4;
  margin-bottom: 16px;
}

.modal-subdescription {
  font-size: 16px;
  opacity: 0.95;
  line-height: 1.6;
}

.modal-section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
  color: var(--text-primary);
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.feature-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background-color: var(--bg-light);
  border-radius: 12px;
}

.feature-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.feature-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.modal-actions {
  text-align: center;
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
  
  .modal-content {
    max-height: 95vh;
  }
  
  .modal-title {
    font-size: 24px;
    padding: 24px 16px 12px;
  }
  
  .modal-body {
    padding: 0 16px 24px;
  }
  
  .modal-description {
    font-size: 20px;
  }
  
  .modal-subdescription {
    font-size: 14px;
  }
}
</style>