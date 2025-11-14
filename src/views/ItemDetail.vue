<template>
  <div class="item-detail">
    <div v-if="loading" class="loading">
      <p>読み込み中...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="$router.push('/top')">
        トップページに戻る
      </button>
    </div>
    
    <div v-else class="detail-content">
      <!-- パンくずリスト -->
      <nav class="breadcrumb">
        <router-link to="/top">ホーム</router-link>
        <span class="separator">›</span>
        <span>{{ product.name }}</span>
      </nav>

      <!-- 商品情報 -->
      <div class="product-info-section">
        <div class="product-header">
          <div>
            <h1 class="product-title">{{ product.name }}</h1>
            <span class="product-category-badge">{{ product.category }}</span>
          </div>
          <button class="favorite-btn" @click="toggleFavorite">
            {{ isFavorite ? '★' : '☆' }}
          </button>
        </div>

        <div class="price-info-card">
          <div class="current-price-section">
            <span class="label">現在価格</span>
            <div class="price-display">
              <span class="current-price">¥{{ product.currentPrice }}</span>
              <span v-if="priceChange !== 0" :class="['price-badge', priceChangeClass]">
                {{ priceChangeText }}
              </span>
            </div>
          </div>
          <div class="shop-info">
            <span class="shop-label">販売店:</span>
            <span class="shop-name">{{ product.shop }}</span>
          </div>
        </div>
      </div>

      <!-- AI要約セクション -->
      <div class="ai-summary-section">
        <h2 class="section-heading">🤖 AI分析レポート</h2>
        <div class="ai-summary-card">
          <div class="summary-item">
            <div class="summary-icon">💰</div>
            <p class="summary-text">{{ product.aiSummary.lowestPrice }}</p>
          </div>
          <div class="summary-item">
            <div class="summary-icon">📈</div>
            <p class="summary-text">{{ product.aiSummary.trend }}</p>
          </div>
          <div class="summary-item">
            <div class="summary-icon">💡</div>
            <p class="summary-text">{{ product.aiSummary.recommendation }}</p>
          </div>
        </div>
      </div>

      <!-- 価格推移グラフ -->
      <div class="chart-section">
        <div class="chart-header">
          <h2 class="section-heading">📊 価格推移</h2>
          <div class="period-selector">
            <button 
              v-for="period in periods" 
              :key="period.value"
              :class="['period-btn', { active: selectedPeriod === period.value }]"
              @click="changePeriod(period.value)"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        <div class="chart-wrapper">
          <PriceChart :priceHistory="displayedPriceHistory" />
        </div>
      </div>

      <!-- 価格変動履歴 -->
      <div class="history-section">
        <h2 class="section-heading">📝 価格変動履歴</h2>
        <div class="history-table">
          <div class="history-header">
            <span>日付</span>
            <span>価格</span>
            <span>変動</span>
          </div>
          <div 
            v-for="(item, index) in recentPriceChanges" 
            :key="index"
            class="history-row"
          >
            <span class="history-date">{{ item.date }}</span>
            <span class="history-price">¥{{ item.price }}</span>
            <span :class="['history-change', item.changeClass]">
              {{ item.change }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PriceChart from '@/components/PriceChart.vue'
import api from '@/services/api'
import { useMainStore } from '@/store'

export default {
  name: 'ItemDetail',
  components: {
    PriceChart
  },
  data() {
    return {
      product: null,
      loading: true,
      error: null,
      selectedPeriod: 30,
      periods: [
        { label: '30日', value: 30 },
        { label: '60日', value: 60 },
        { label: '90日', value: 90 },
        { label: '180日', value: 180 }
      ]
    }
  },
  computed: {
    priceChange() {
      if (!this.product) return 0
      return this.product.currentPrice - this.product.previousPrice
    },
    priceChangePercent() {
      if (!this.product || this.product.previousPrice === 0) return 0
      return ((this.priceChange / this.product.previousPrice) * 100).toFixed(1)
    },
    priceChangeText() {
      const sign = this.priceChange > 0 ? '+' : ''
      return `${sign}${this.priceChange}円 (${sign}${this.priceChangePercent}%)`
    },
    priceChangeClass() {
      return this.priceChange > 0 ? 'price-up' : 'price-down'
    },
    displayedPriceHistory() {
      if (!this.product?.priceHistory) return []
      return this.product.priceHistory.slice(-this.selectedPeriod)
    },
    recentPriceChanges() {
      if (!this.product?.priceHistory || this.product.priceHistory.length < 2) return []
      
      const history = [...this.product.priceHistory].reverse().slice(0, 10)
      return history.map((item, index) => {
        if (index === history.length - 1) {
          return {
            date: item.date,
            price: item.price,
            change: '-',
            changeClass: ''
          }
        }
        
        const prevPrice = history[index + 1].price
        const change = item.price - prevPrice
        const changePercent = ((change / prevPrice) * 100).toFixed(1)
        const sign = change > 0 ? '+' : ''
        
        return {
          date: item.date,
          price: item.price,
          change: `${sign}${change}円 (${sign}${changePercent}%)`,
          changeClass: change > 0 ? 'price-up' : change < 0 ? 'price-down' : ''
        }
      })
    },
    isFavorite() {
      const store = useMainStore()
      return store.favoriteProducts.includes(this.$route.params.id)
    }
  },
  async mounted() {
    await this.loadProduct()
  },
  methods: {
    async loadProduct() {
      try {
        this.loading = true
        this.error = null
        const id = this.$route.params.id
        this.product = await api.getProductDetail(id)
      } catch (err) {
        this.error = '商品情報の取得に失敗しました'
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async changePeriod(period) {
      this.selectedPeriod = period
      try {
        const history = await api.getPriceHistory(this.$route.params.id, period)
        this.product.priceHistory = history
      } catch (err) {
        console.error('価格履歴の取得に失敗しました:', err)
      }
    },
    toggleFavorite() {
      const store = useMainStore()
      const id = this.$route.params.id
      
      if (this.isFavorite) {
        store.removeFavorite(id)
      } else {
        store.addFavorite(id)
      }
    }
  }
}
</script>

<style scoped>
.item-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.loading,
.error {
  text-align: center;
  padding: 60px 20px;
}

.error {
  color: var(--danger-color);
}

.breadcrumb {
  margin-bottom: 24px;
  font-size: 14px;
  color: var(--text-secondary);
}

.breadcrumb a {
  color: var(--primary-color);
}

.separator {
  margin: 0 8px;
}

/* 商品情報セクション */
.product-info-section {
  margin-bottom: 32px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 20px;
}

.product-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.product-category-badge {
  display: inline-block;
  padding: 4px 12px;
  background-color: var(--bg-light);
  border-radius: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

.favorite-btn {
  font-size: 32px;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.favorite-btn:hover {
  transform: scale(1.2);
}

.price-info-card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.current-price-section {
  margin-bottom: 16px;
}

.label {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.price-display {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.current-price {
  font-size: 40px;
  font-weight: bold;
  color: var(--text-primary);
}

.price-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.price-badge.price-up {
  background-color: #fee2e2;
  color: var(--danger-color);
}

.price-badge.price-down {
  background-color: #d1fae5;
  color: var(--secondary-color);
}

.shop-info {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  font-size: 16px;
}

.shop-label {
  color: var(--text-secondary);
  margin-right: 8px;
}

.shop-name {
  font-weight: 600;
  color: var(--text-primary);
}

/* AI要約セクション */
.ai-summary-section {
  margin-bottom: 32px;
}

.section-heading {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.ai-summary-card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-item {
  display: flex;
  align-items: start;
  gap: 16px;
  padding: 16px 0;
}

.summary-item:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.summary-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.summary-text {
  color: var(--text-primary);
  line-height: 1.6;
}

/* グラフセクション */
.chart-section {
  margin-bottom: 32px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.period-selector {
  display: flex;
  gap: 8px;
}

.period-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background-color: white;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.period-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.period-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.chart-wrapper {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 履歴セクション */
.history-section {
  margin-bottom: 32px;
}

.history-table {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.history-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 16px 24px;
  background-color: var(--bg-light);
  font-weight: 600;
  color: var(--text-secondary);
}

.history-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
}

.history-row:last-child {
  border-bottom: none;
}

.history-date {
  color: var(--text-secondary);
}

.history-price {
  font-weight: 600;
  color: var(--text-primary);
}

.history-change {
  font-weight: 600;
}

.history-change.price-up {
  color: var(--danger-color);
}

.history-change.price-down {
  color: var(--secondary-color);
}

@media (max-width: 768px) {
  .product-title {
    font-size: 24px;
  }
  
  .current-price {
    font-size: 32px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .period-selector {
    justify-content: stretch;
  }
  
  .period-btn {
    flex: 1;
  }
  
  .history-header,
  .history-row {
    grid-template-columns: 1.5fr 1fr 1fr;
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>