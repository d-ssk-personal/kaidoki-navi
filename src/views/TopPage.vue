<template>
  <div class="top-page">
    <!-- メインコンテンツエリア -->
    <div class="main-container">
      <!-- メインコンテンツ -->
      <main class="main-content">
    <!-- チラシ検索セクション -->
    <section class="flyer-section">
      <!-- チラシ検索フォーム -->
      <div class="flyer-search-container">
        <h2 class="flyer-search-title">チラシを検索</h2>

        <div class="flyer-search-form">
          <!-- 地域で検索 -->
          <div class="search-field">
            <label class="search-label">地域で検索</label>
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

          <!-- 店舗名で検索 -->
          <div class="search-field">
            <label class="search-label">店舗名で検索</label>
            <div class="flyer-search-input-wrapper">
              <input
                type="text"
                v-model="flyerSearchQuery"
                placeholder="例: イオン、マルエツなど"
                class="flyer-search-input"
                @keyup.enter="performFlyerSearch"
              />
            </div>
          </div>

          <!-- 住所で検索 -->
          <div class="search-field">
            <label class="search-label">住所で検索</label>
            <div class="flyer-search-input-wrapper">
              <input
                type="text"
                v-model="addressSearchQuery"
                placeholder="例: さいたま市、渋谷区など"
                class="flyer-search-input"
                @keyup.enter="performFlyerSearch"
              />
            </div>
          </div>

          <button class="flyer-search-button" @click="performFlyerSearch">
            🔍 チラシを検索
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
      </main>

      <!-- サイドバー -->
      <aside class="sidebar">
        <h2 class="sidebar-title">コラム検索</h2>

        <div class="article-search-box">
          <input
            type="text"
            v-model="articleSearchQuery"
            placeholder="キーワードで検索"
            class="article-search-input"
            @keyup.enter="performArticleSearch"
          />
          <button class="article-search-button" @click="performArticleSearch">
            🔍
          </button>
        </div>

        <p class="latest-articles-label">最新の記事</p>

        <div class="article-categories">
          <h3 class="article-category-title">カテゴリ</h3>
          <div class="article-category-list">
            <button
              v-for="category in articleCategories"
              :key="category"
              class="article-category-chip"
              @click="searchByCategory(category)"
            >
              {{ category }}
            </button>
          </div>
        </div>
      </aside>
    </div>

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
import ArticleList from '@/components/ArticleList.vue'
import FlyerModal from '@/components/FlyerModal.vue'
import api from '@/services/api'
import { useMainStore } from '@/store'

export default {
  name: 'TopPage',
  components: {
    ArticleList,
    FlyerModal
  },
  data() {
    return {
      products: [],
      loading: true,
      error: null,
      // コラム検索関連
      articleSearchQuery: '',
      articleCategories: [
        '値上げ情報',
        '特売情報',
        '値下げ速報',
        '節約術',
        '市場分析',
        '活用術',
        '買い物術'
      ],
      // チラシ検索関連
      flyerSearchQuery: '',
      addressSearchQuery: '',
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
      recommendedFlyers: [],
      currentFlyerIndex: 0,
      // モーダル関連
      showModal: false,
      selectedStore: null,
      activeTab: 'flyer',
      currentFlyerImageIndex: 0,
      currentRecipeIndex: 0,
      recipes: [],
      isLoadingRecipe: false
    }
  },
  computed: {
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
    await this.loadRecommendedFlyers()
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
    async loadRecommendedFlyers() {
      try {
        const data = await api.getRecommendedFlyers(5)
        this.recommendedFlyers = data
      } catch (err) {
        console.error('おすすめチラシの取得に失敗しました:', err)
      }
    },
    performFlyerSearch() {
      // 店舗検索結果一覧画面に遷移
      const query = {
        q: this.flyerSearchQuery,
        address: this.addressSearchQuery,
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
      this.selectedStore = flyer
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
    },
    performArticleSearch() {
      // ArticleListコンポーネントで検索を実行するために、ルーターでクエリパラメータを渡す
      // 実装は後で ArticleList.vue で処理する
      console.log('Article search:', this.articleSearchQuery)
    },
    searchByCategory(category) {
      // カテゴリで検索
      this.articleSearchQuery = category
      this.performArticleSearch()
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

/* コラム検索ボックス */
.article-search-box {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.article-search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.article-search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.article-search-button {
  width: 48px;
  height: 48px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.article-search-button:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

/* 最新の記事ラベル */
.latest-articles-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 24px;
  padding-left: 8px;
  text-align: center;
}

/* コラムカテゴリ */
.article-categories {
  margin-bottom: 24px;
}

.article-category-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 4px solid var(--primary-color);
}

.article-category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.article-category-chip {
  padding: 10px 16px;
  background-color: white;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.article-category-chip:hover {
  background-color: var(--bg-light);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateX(4px);
}

/* メインコンテンツ */
.main-content {
  flex: 1;
  min-width: 0;
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
  margin-bottom: 32px;
}

.flyer-search-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-label {
  font-size: 16px;
  font-weight: 600;
  color: white;
  padding-left: 4px;
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
