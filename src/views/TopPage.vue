<template>
  <div class="top-page">
    <!-- ヒーローセクション -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          価格変動を見逃さない<br>
          賢い買い物で家計を守る
        </h1>
        <p class="hero-description">
          2025年問題で物価高騰が続く今、買い時ナビが<br>
          商品の値上げ・値下げをリアルタイムでお知らせします
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="scrollToProducts">
            商品を見る
          </button>
          <button class="btn btn-secondary">
            LINE通知を受け取る
          </button>
        </div>
      </div>
    </section>

    <!-- 特徴セクション -->
    <section class="features">
      <h2 class="section-title">3つの特徴</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3 class="feature-title">価格推移の可視化</h3>
          <p class="feature-description">
            過去30日〜180日の価格変動をグラフで確認。買い時を逃しません。
          </p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🤖</div>
          <h3 class="feature-title">AI要約</h3>
          <p class="feature-description">
            最安値情報や値下げ傾向をAIが分析。節約のヒントをお届けします。
          </p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔔</div>
          <h3 class="feature-title">リアルタイム通知</h3>
          <p class="feature-description">
            値上げ・値下げを即座にお知らせ。LINEやWebプッシュで受け取れます。
          </p>
        </div>
      </div>
    </section>

    <!-- 商品一覧セクション -->
    <section class="products" ref="productsSection">
      <h2 class="section-title">人気商品の価格推移</h2>
      
      <div v-if="loading" class="loading">
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
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import api from '@/services/api'
import { useMainStore } from '@/store'

export default {
  name: 'TopPage',
  components: {
    ProductCard
  },
  data() {
    return {
      products: [],
      loading: true,
      error: null
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

/* ヒーローセクション */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 80px 40px;
  text-align: center;
  color: white;
  margin-bottom: 60px;
}

.hero-title {
  font-size: 42px;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.3;
}

.hero-description {
  font-size: 18px;
  margin-bottom: 40px;
  opacity: 0.95;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-large {
  padding: 16px 32px;
  font-size: 18px;
}

/* 特徴セクション */
.features {
  margin-bottom: 60px;
}

.section-title {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40px;
  color: var(--text-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.feature-card {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 商品セクション */
.products {
  margin-bottom: 60px;
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

@media (max-width: 768px) {
  .hero {
    padding: 60px 20px;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-description {
    font-size: 16px;
  }
  
  .hero-actions {
    flex-direction: column;
  }
  
  .section-title {
    font-size: 28px;
  }
}
</style>