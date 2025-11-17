<template>
  <div class="product-card" @click="goToDetail">
    <div class="product-header">
      <h3 class="product-name">{{ product.name }}</h3>
      <span class="product-category">{{ product.category }}</span>
    </div>

    <div class="product-price">
      <div class="price-label">最安値</div>
      <span class="current-price">¥{{ product.lowestPrice }}</span>
    </div>

    <div class="product-info">
      <div class="shop-info">
        <span class="shop-icon">🏪</span>
        <span class="shop-name">{{ product.lowestShop }}</span>
      </div>
      <span class="last-updated">{{ formattedDate }}</span>
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
  gap: 8px;
  margin-bottom: 12px;
}

.price-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  color: var(--primary-color);
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.shop-icon {
  font-size: 16px;
}

.shop-name {
  font-weight: 600;
  color: var(--text-primary);
}
</style>