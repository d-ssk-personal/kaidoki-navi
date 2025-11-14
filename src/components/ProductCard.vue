<template>
  <div class="product-card" @click="goToDetail">
    <div class="product-header">
      <h3 class="product-name">{{ product.name }}</h3>
      <span class="product-category">{{ product.category }}</span>
    </div>
    
    <div class="product-price">
      <span class="current-price">¥{{ product.currentPrice }}</span>
      <span v-if="priceChange !== 0" :class="['price-change', priceChangeClass]">
        {{ priceChangeText }}
      </span>
    </div>
    
    <div class="product-info">
      <span class="shop-name">{{ product.shop }}</span>
      <span class="last-updated">{{ formattedDate }}</span>
    </div>
    
    <div v-if="showBadge" class="product-badge">
      <span :class="['badge', badgeClass]">{{ badgeText }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  computed: {
    priceChange() {
      return this.product.currentPrice - this.product.previousPrice
    },
    priceChangePercent() {
      if (this.product.previousPrice === 0) return 0
      return ((this.priceChange / this.product.previousPrice) * 100).toFixed(1)
    },
    priceChangeText() {
      const sign = this.priceChange > 0 ? '+' : ''
      return `${sign}${this.priceChange}円 (${sign}${this.priceChangePercent}%)`
    },
    priceChangeClass() {
      return this.priceChange > 0 ? 'price-up' : 'price-down'
    },
    showBadge() {
      return Math.abs(this.priceChangePercent) >= 5
    },
    badgeText() {
      if (this.priceChange > 0) return '値上げ'
      return '値下げ'
    },
    badgeClass() {
      if (this.priceChange > 0) return 'badge-up'
      return 'badge-down'
    },
    formattedDate() {
      const date = new Date(this.product.lastUpdated)
      return date.toLocaleDateString('ja-JP')
    }
  },
  methods: {
    goToDetail() {
      this.$router.push(`/item/${this.product.id}`)
    }
  }
}
</script>

<style scoped>
.product-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.product-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;
}

.product-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.product-category {
  font-size: 12px;
  padding: 4px 8px;
  background-color: var(--bg-light);
  border-radius: 4px;
  color: var(--text-secondary);
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
}

.price-change {
  font-size: 14px;
  font-weight: 600;
}

.price-up {
  color: var(--danger-color);
}

.price-down {
  color: var(--secondary-color);
}

.product-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-secondary);
}

.product-badge {
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>