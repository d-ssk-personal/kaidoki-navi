<template>
  <div class="top-page">
    <!-- メインコンテンツエリア -->
    <div class="main-container">
      <!-- メインコンテンツ -->
      <main class="main-content">
        <!-- 検索フォーム -->
        <section class="search-section">
      <div class="search-container">
        <h2 class="search-title">商品を検索</h2>

        <div class="search-form">
          <!-- カテゴリ検索 -->
          <div class="category-filter">
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
        </div>
      </div>
    </section>

    <!-- チラシ検索セクション -->
    <section class="flyer-section">
      <div class="flyer-search-container">
        <h2 class="flyer-search-title">チラシを検索</h2>

        <div class="flyer-search-form">
          <!-- 地域・都道府県選択 -->
          <div class="region-filter">
            <div class="region-select-wrapper">
              <select v-model="selectedRegion" @change="onRegionChange" class="region-select">
                <option value="">地域を選択</option>
                <option v-for="region in regions" :key="region.name" :value="region.name">
                  {{ region.name }}
                </option>
              </select>

              <select
                v-model="selectedPrefecture"
                class="prefecture-select"
              >
                <option value="">都道府県を選択</option>
                <option
                  v-for="prefecture in currentPrefectures"
                  :key="prefecture"
                  :value="prefecture"
                >
                  {{ prefecture }}
                </option>
              </select>
            </div>
          </div>

          <!-- フリーワード検索 -->
          <div class="flyer-search-input-wrapper">
            <input
              type="text"
              v-model="flyerSearchQuery"
              placeholder="店舗名で検索（例: イオン、マルエツなど）"
              class="flyer-search-input"
              @keyup.enter="performFlyerSearch"
            />
          </div>

          <button class="flyer-search-button" @click="performFlyerSearch">
            🔍 店舗を検索
          </button>
        </div>
      </div>

      <!-- おすすめのチラシ -->
      <div class="recommended-flyers">
        <h2 class="section-title">おすすめのチラシ</h2>
        <div class="carousel-container">
          <button
            class="carousel-arrow carousel-arrow-left"
            @click="previousFlyer"
            :disabled="currentFlyerIndex === 0"
          >
            ◀
          </button>

          <div class="flyer-carousel">
            <div
              v-for="(flyer, index) in recommendedFlyers"
              :key="flyer.id"
              class="flyer-card"
              :class="{ active: index === currentFlyerIndex }"
              :style="{ transform: `translateX(-${currentFlyerIndex * 100}%)` }"
              @click="openFlyerModal(flyer)"
            >
              <img :src="flyer.image" :alt="flyer.storeName" class="flyer-image" />
              <div class="flyer-info">
                <h3 class="flyer-store-name">{{ flyer.storeName }}</h3>
                <p class="flyer-period">{{ flyer.period }}</p>
              </div>
            </div>
          </div>

          <button
            class="carousel-arrow carousel-arrow-right"
            @click="nextFlyer"
            :disabled="currentFlyerIndex === recommendedFlyers.length - 1"
          >
            ▶
          </button>
        </div>

        <!-- カルーセルインジケーター -->
        <div class="carousel-indicators">
          <button
            v-for="(flyer, index) in recommendedFlyers"
            :key="index"
            class="indicator"
            :class="{ active: index === currentFlyerIndex }"
            @click="goToFlyer(index)"
          ></button>
        </div>
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
              <div class="popular-product-details">
                <span class="popular-product-name">{{ product.name }}</span>
                <span class="popular-product-store">{{ product.storeName || '－' }}</span>
              </div>
              <span class="popular-product-price">¥{{ product.lowestPrice }}</span>
            </router-link>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import ArticleList from '@/components/ArticleList.vue'
import api from '@/services/api'
import { useMainStore } from '@/store'

export default {
  name: 'TopPage',
  components: {
    ArticleList
  },
  data() {
    return {
      products: [],
      loading: true,
      error: null,
      searchQuery: '',
      selectedCategory: '',
      categories: [
        '飲料',
        'お菓子・おつまみ',
        '生鮮食品',
        '冷蔵・冷凍',
        '調味料',
        'パン・シリアル',
        '日用品',
        'その他'
      ],
      // チラシ検索関連
      flyerSearchQuery: '',
      selectedRegion: '',
      selectedPrefecture: '',
      regions: [
        {
          name: '北海道',
          prefectures: ['北海道']
        },
        {
          name: '東北',
          prefectures: ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県']
        },
        {
          name: '関東',
          prefectures: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県']
        },
        {
          name: '中部',
          prefectures: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県']
        },
        {
          name: '近畿',
          prefectures: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県']
        },
        {
          name: '中国',
          prefectures: ['鳥取県', '島根県', '岡山県', '広島県', '山口県']
        },
        {
          name: '四国',
          prefectures: ['徳島県', '香川県', '愛媛県', '高知県']
        },
        {
          name: '九州・沖縄',
          prefectures: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
        }
      ],
      recommendedFlyers: [
        {
          id: 1,
          storeName: 'イオン大宮店',
          image: 'https://via.placeholder.com/300x400?text=Flyer+1',
          period: '11/15 - 11/21'
        },
        {
          id: 2,
          storeName: 'マルエツ浦和店',
          image: 'https://via.placeholder.com/300x400?text=Flyer+2',
          period: '11/16 - 11/22'
        },
        {
          id: 3,
          storeName: 'ライフ品川店',
          image: 'https://via.placeholder.com/300x400?text=Flyer+3',
          period: '11/17 - 11/23'
        },
        {
          id: 4,
          storeName: 'サミット渋谷店',
          image: 'https://via.placeholder.com/300x400?text=Flyer+4',
          period: '11/18 - 11/24'
        },
        {
          id: 5,
          storeName: 'オーケー川崎店',
          image: 'https://via.placeholder.com/300x400?text=Flyer+5',
          period: '11/19 - 11/25'
        }
      ],
      currentFlyerIndex: 0
    }
  },
  computed: {
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
    },
    currentPrefectures() {
      if (!this.selectedRegion) {
        return []
      }
      const region = this.regions.find(r => r.name === this.selectedRegion)
      return region ? region.prefectures : []
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
      // 商品一覧画面に遷移
      const query = {
        q: this.searchQuery,
        category: this.selectedCategory
      }
      this.$router.push({
        path: '/products',
        query: query
      })
    },
    selectCategory(category) {
      if (this.selectedCategory === category) {
        this.selectedCategory = ''
      } else {
        this.selectedCategory = category
      }
      // カテゴリ選択時は検索を実行しない
    },
    performFlyerSearch() {
      // 店舗検索結果一覧画面に遷移
      const query = {
        q: this.flyerSearchQuery,
        region: this.selectedRegion,
        prefecture: this.selectedPrefecture
      }
      this.$router.push({
        path: '/stores',
        query: query
      })
    },
    onRegionChange() {
      // 地域が変更されたら都道府県をリセット
      this.selectedPrefecture = ''
    },
    openFlyerModal(flyer) {
      // チラシモーダルを開く（後で実装）
      console.log('Open flyer modal:', flyer)
      alert(`${flyer.storeName}のチラシを表示します（実装予定）`)
    },
    nextFlyer() {
      if (this.currentFlyerIndex < this.recommendedFlyers.length - 1) {
        this.currentFlyerIndex++
      }
    },
    previousFlyer() {
      if (this.currentFlyerIndex > 0) {
        this.currentFlyerIndex--
      }
    },
    goToFlyer(index) {
      this.currentFlyerIndex = index
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

.popular-product-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow: hidden;
}

.popular-product-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popular-product-store {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popular-product-price {
  font-size: 14px;
  font-weight: bold;
  color: var(--primary-color);
  margin-left: 8px;
  white-space: nowrap;
}

/* メインコンテンツ */
.main-content {
  flex: 1;
  min-width: 0;
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

.category-filter {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

/* チラシ検索セクション */
.flyer-section {
  margin-bottom: 60px;
}

.flyer-search-container {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16px;
  padding: 40px;
  color: white;
  margin-bottom: 48px;
}

.flyer-search-title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
}

.flyer-search-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.region-filter {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.region-select-wrapper {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.region-select,
.prefecture-select {
  flex: 1;
  min-width: 200px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  background-color: white;
  cursor: pointer;
}

.flyer-search-input-wrapper {
  display: flex;
  gap: 12px;
}

.flyer-search-input {
  flex: 1;
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
}

.flyer-search-button {
  padding: 16px 32px;
  background-color: white;
  color: #f5576c;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  align-self: center;
}

.flyer-search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* おすすめのチラシ（カルーセル） */
.recommended-flyers {
  margin-bottom: 48px;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.carousel-arrow {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background-color: white;
  border: 2px solid var(--primary-color);
  border-radius: 50%;
  color: var(--primary-color);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.carousel-arrow:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: white;
  transform: scale(1.1);
}

.carousel-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: var(--text-secondary);
  color: var(--text-secondary);
}

.flyer-carousel {
  position: relative;
  width: 100%;
  height: 450px;
  overflow: hidden;
  border-radius: 12px;
}

.flyer-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.5s ease, opacity 0.5s ease;
  opacity: 0;
  pointer-events: none;
}

.flyer-card.active {
  opacity: 1;
  pointer-events: auto;
}

.flyer-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.flyer-image {
  width: 100%;
  height: 370px;
  object-fit: cover;
}

.flyer-info {
  padding: 16px 20px;
  background-color: white;
}

.flyer-store-name {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.flyer-period {
  font-size: 14px;
  color: var(--text-secondary);
}

/* カルーセルインジケーター */
.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #e0e0e0;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.indicator:hover {
  background-color: #bdbdbd;
}

.indicator.active {
  background-color: var(--primary-color);
  width: 32px;
  border-radius: 6px;
}

.section-title {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40px;
  color: var(--text-primary);
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

  .flyer-search-container {
    padding: 24px;
  }

  .flyer-search-title {
    font-size: 24px;
  }

  .flyer-search-input-wrapper {
    flex-direction: column;
  }

  .region-select-wrapper {
    flex-direction: column;
  }

  .region-select,
  .prefecture-select {
    min-width: 100%;
  }

  .flyer-search-button {
    width: 100%;
  }

  .carousel-arrow {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .flyer-carousel {
    height: 400px;
  }

  .flyer-image {
    height: 320px;
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
