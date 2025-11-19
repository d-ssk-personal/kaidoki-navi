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
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <!-- ヘッダー -->
        <div class="modal-header">
          <div class="modal-header-left">
            <h2 class="modal-title">{{ selectedStore?.name }}</h2>
            <p class="modal-period">セール期間: {{ selectedStore?.salePeriod }}</p>
          </div>
          <div class="modal-header-right">
            <button class="recipe-suggest-button" @click="generateRecipes" :disabled="isLoadingRecipe">
              {{ isLoadingRecipe ? 'レシピ生成中...' : 'チラシからレシピを提案' }}
            </button>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>
        </div>

        <!-- タブ -->
        <div class="modal-tabs">
          <button
            :class="['tab-button', { active: activeTab === 'flyer' }]"
            @click="switchTab('flyer')"
          >
            チラシ
          </button>
          <button
            :class="['tab-button', { active: activeTab === 'recipe' }]"
            @click="switchTab('recipe')"
          >
            レシピ
          </button>
          <!-- SNS共有アイコン（レシピタブでレシピがある場合のみ表示） -->
          <div v-if="activeTab === 'recipe' && recipes.length > 0" class="sns-share-icons">
            <button class="sns-icon twitter-icon" @click="shareToSNS('twitter')" title="Xで共有">
              𝕏
            </button>
            <button class="sns-icon facebook-icon" @click="shareToSNS('facebook')" title="Facebookで共有">
              f
            </button>
            <button class="sns-icon instagram-icon" @click="shareToSNS('instagram')" title="Instagramで共有">
              📷
            </button>
          </div>
        </div>

        <!-- コンテンツ -->
        <div class="modal-body">
          <!-- チラシタブ -->
          <div v-if="activeTab === 'flyer'" class="flyer-tab-content">
            <div class="flyer-carousel-container">
              <button
                class="carousel-arrow left"
                @click="previousFlyerImage"
                :disabled="currentFlyerImageIndex === 0"
              >
                ◀
              </button>

              <div class="flyer-carousel">
                <div
                  v-for="(image, index) in selectedStore?.flyerImages"
                  :key="index"
                  class="flyer-slide"
                  :class="{ active: index === currentFlyerImageIndex }"
                >
                  <img :src="image" :alt="`${selectedStore?.name} チラシ ${index + 1}`" class="flyer-image" />
                </div>
              </div>

              <button
                class="carousel-arrow right"
                @click="nextFlyerImage"
                :disabled="currentFlyerImageIndex === selectedStore?.flyerImages.length - 1"
              >
                ▶
              </button>
            </div>

            <!-- カルーセルインジケーター -->
            <div class="carousel-indicators">
              <button
                v-for="(image, index) in selectedStore?.flyerImages"
                :key="index"
                class="indicator"
                :class="{ active: index === currentFlyerImageIndex }"
                @click="goToFlyerImage(index)"
              ></button>
            </div>
          </div>

          <!-- レシピタブ -->
          <div v-if="activeTab === 'recipe'" class="recipe-tab-content">
            <!-- レシピ未生成時 -->
            <div v-if="recipes.length === 0 && !isLoadingRecipe" class="recipe-empty">
              <p>レシピを提案してください</p>
            </div>

            <!-- ローディング中 -->
            <div v-if="isLoadingRecipe" class="recipe-loading">
              <p>レシピを生成中...</p>
            </div>

            <!-- レシピ表示 -->
            <div v-if="recipes.length > 0 && !isLoadingRecipe" class="recipe-carousel-container">
              <button
                class="carousel-arrow left"
                @click="previousRecipe"
                :disabled="currentRecipeIndex === 0"
              >
                ◀
              </button>

              <div class="recipe-carousel">
                <div
                  v-for="(recipe, index) in recipes"
                  :key="recipe.id"
                  class="recipe-slide"
                  :class="{ active: index === currentRecipeIndex }"
                >
                  <div class="recipe-card">
                    <img :src="recipe.image" :alt="recipe.title" class="recipe-image" />
                    <div class="recipe-details">
                      <h3 class="recipe-title">{{ recipe.title }}</h3>
                      <div class="recipe-section">
                        <h4>材料</h4>
                        <ul class="recipe-ingredients">
                          <li v-for="(ingredient, i) in recipe.ingredients" :key="i">
                            {{ ingredient }}
                          </li>
                        </ul>
                      </div>
                      <div class="recipe-section">
                        <h4>作り方</h4>
                        <p class="recipe-instructions">{{ recipe.instructions }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                class="carousel-arrow right"
                @click="nextRecipe"
                :disabled="currentRecipeIndex === recipes.length - 1"
              >
                ▶
              </button>
            </div>

            <!-- レシピカルーセルインジケーター -->
            <div v-if="recipes.length > 0 && !isLoadingRecipe" class="carousel-indicators">
              <button
                v-for="(recipe, index) in recipes"
                :key="index"
                class="indicator"
                :class="{ active: index === currentRecipeIndex }"
                @click="goToRecipe(index)"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StoreList',
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
    loadStores() {
      // ダミーデータ（実際はAPIから取得）
      this.stores = [
        {
          id: 1,
          name: 'イオン大宮店',
          logo: 'https://via.placeholder.com/150x100?text=AEON',
          region: '関東',
          prefecture: '埼玉県',
          salePeriod: '11/15 - 11/21',
          flyerImages: [
            'https://via.placeholder.com/800x1000?text=AEON+Flyer+1',
            'https://via.placeholder.com/800x1000?text=AEON+Flyer+2',
            'https://via.placeholder.com/800x1000?text=AEON+Flyer+3'
          ]
        },
        {
          id: 2,
          name: 'マルエツ浦和店',
          logo: 'https://via.placeholder.com/150x100?text=Maruetsu',
          region: '関東',
          prefecture: '埼玉県',
          salePeriod: '11/16 - 11/22',
          flyerImages: [
            'https://via.placeholder.com/800x1000?text=Maruetsu+Flyer+1',
            'https://via.placeholder.com/800x1000?text=Maruetsu+Flyer+2'
          ]
        },
        {
          id: 3,
          name: 'ライフ品川店',
          logo: 'https://via.placeholder.com/150x100?text=LIFE',
          region: '関東',
          prefecture: '東京都',
          salePeriod: '11/17 - 11/23',
          flyerImages: [
            'https://via.placeholder.com/800x1000?text=LIFE+Flyer+1',
            'https://via.placeholder.com/800x1000?text=LIFE+Flyer+2',
            'https://via.placeholder.com/800x1000?text=LIFE+Flyer+3',
            'https://via.placeholder.com/800x1000?text=LIFE+Flyer+4'
          ]
        },
        {
          id: 4,
          name: 'サミット渋谷店',
          logo: 'https://via.placeholder.com/150x100?text=Summit',
          region: '関東',
          prefecture: '東京都',
          salePeriod: '11/18 - 11/24',
          flyerImages: [
            'https://via.placeholder.com/800x1000?text=Summit+Flyer+1'
          ]
        },
        {
          id: 5,
          name: 'オーケー川崎店',
          logo: 'https://via.placeholder.com/150x100?text=OK',
          region: '関東',
          prefecture: '神奈川県',
          salePeriod: '11/19 - 11/25',
          flyerImages: [
            'https://via.placeholder.com/800x1000?text=OK+Flyer+1',
            'https://via.placeholder.com/800x1000?text=OK+Flyer+2',
            'https://via.placeholder.com/800x1000?text=OK+Flyer+3',
            'https://via.placeholder.com/800x1000?text=OK+Flyer+4',
            'https://via.placeholder.com/800x1000?text=OK+Flyer+5'
          ]
        },
        {
          id: 6,
          name: 'イトーヨーカドー新宿店',
          logo: 'https://via.placeholder.com/150x100?text=Ito+Yokado',
          region: '関東',
          prefecture: '東京都',
          salePeriod: '11/20 - 11/26',
          flyerImages: [
            'https://via.placeholder.com/800x1000?text=Ito+Yokado+Flyer+1',
            'https://via.placeholder.com/800x1000?text=Ito+Yokado+Flyer+2'
          ]
        }
      ]
      this.loading = false
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
      // モーダルが開いているときはスクロールを無効化
      document.body.style.overflow = 'hidden'
    },
    closeModal() {
      this.showModal = false
      this.selectedStore = null
      this.activeTab = 'flyer'
      this.recipes = []
      // モーダルを閉じたらスクロールを有効化
      document.body.style.overflow = ''
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
      // TODO: 後でOpenAI APIを実装
      this.isLoadingRecipe = true
      // ダミーデータで3つのレシピを生成
      await new Promise(resolve => setTimeout(resolve, 1500)) // ローディング演出
      this.recipes = [
        {
          id: 1,
          title: '豚肉と野菜の炒め物',
          ingredients: ['豚肉 200g', 'キャベツ 1/4個', 'にんじん 1本', '玉ねぎ 1個', '醤油 大さじ2', 'みりん 大さじ1'],
          instructions: '1. 野菜を食べやすい大きさに切る\n2. フライパンで豚肉を炒める\n3. 野菜を加えて炒める\n4. 調味料を加えて味を整える',
          image: 'https://via.placeholder.com/400x300?text=Recipe+1'
        },
        {
          id: 2,
          title: '鶏肉とブロッコリーのグラタン',
          ingredients: ['鶏もも肉 250g', 'ブロッコリー 1株', '牛乳 300ml', 'チーズ 100g', '小麦粉 大さじ2', 'バター 30g'],
          instructions: '1. 鶏肉とブロッコリーを茹でる\n2. ホワイトソースを作る\n3. 耐熱皿に材料を入れる\n4. チーズをのせてオーブンで焼く',
          image: 'https://via.placeholder.com/400x300?text=Recipe+2'
        },
        {
          id: 3,
          title: 'サーモンのムニエル',
          ingredients: ['サーモン 2切れ', 'バター 20g', 'レモン 1個', '塩 少々', 'こしょう 少々', '小麦粉 適量'],
          instructions: '1. サーモンに塩こしょうをふる\n2. 小麦粉をまぶす\n3. フライパンでバターを溶かす\n4. サーモンを両面焼く\n5. レモンを絞って完成',
          image: 'https://via.placeholder.com/400x300?text=Recipe+3'
        }
      ]
      this.isLoadingRecipe = false
      this.activeTab = 'recipe'
      this.currentRecipeIndex = 0
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

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* モーダルヘッダー */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 2px solid var(--border-color);
  gap: 16px;
  flex-wrap: wrap;
}

.modal-header-left {
  flex: 1;
  min-width: 200px;
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.modal-period {
  font-size: 14px;
  color: var(--text-secondary);
}

.modal-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recipe-suggest-button {
  padding: 10px 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.recipe-suggest-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}

.recipe-suggest-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-close {
  width: 36px;
  height: 36px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.modal-close:hover {
  background-color: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

/* タブ */
.modal-tabs {
  display: flex;
  align-items: center;
  padding: 0 32px;
  border-bottom: 1px solid var(--border-color);
  gap: 16px;
}

.tab-button {
  padding: 16px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  bottom: -1px;
}

.tab-button:hover {
  color: var(--text-primary);
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.sns-share-icons {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.sns-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.twitter-icon {
  background-color: #000000;
  color: white;
}

.facebook-icon {
  background-color: #1877f2;
  color: white;
}

.instagram-icon {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  color: white;
}

.sns-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* モーダルボディ */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}

/* チラシタブ */
.flyer-tab-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.flyer-carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
}

.flyer-carousel {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
  border-radius: 12px;
}

.flyer-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.flyer-slide.active {
  opacity: 1;
  pointer-events: auto;
}

.flyer-slide .flyer-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

/* レシピタブ */
.recipe-tab-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 400px;
}

.recipe-empty,
.recipe-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 18px;
  color: var(--text-secondary);
}

.recipe-carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
}

.recipe-carousel {
  position: relative;
  width: 100%;
  min-height: 500px;
  overflow: hidden;
}

.recipe-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.recipe-slide.active {
  opacity: 1;
  pointer-events: auto;
}

.recipe-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recipe-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.recipe-details {
  padding: 24px;
}

.recipe-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.recipe-section {
  margin-bottom: 20px;
}

.recipe-section h4 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary-color);
}

.recipe-ingredients {
  list-style: none;
  padding: 0;
}

.recipe-ingredients li {
  padding: 6px 0;
  color: var(--text-primary);
  font-size: 15px;
}

.recipe-ingredients li:before {
  content: "• ";
  color: var(--primary-color);
  font-weight: bold;
  margin-right: 8px;
}

.recipe-instructions {
  color: var(--text-primary);
  line-height: 1.8;
  white-space: pre-line;
  font-size: 15px;
}

/* カルーセルの矢印 */
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

/* カルーセルインジケーター */
.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 16px 0;
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

  /* モバイル用モーダルスタイル */
  .modal-header {
    padding: 16px;
    flex-direction: column;
    align-items: flex-start;
  }

  .modal-header-right {
    width: 100%;
    justify-content: space-between;
  }

  .recipe-suggest-button {
    font-size: 12px;
    padding: 8px 12px;
  }

  .modal-close {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .modal-tabs {
    padding: 0 16px;
  }

  .tab-button {
    padding: 12px 16px;
    font-size: 14px;
  }

  .sns-share-icons {
    gap: 6px;
  }

  .sns-icon {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-period {
    font-size: 13px;
  }

  .flyer-carousel {
    height: 400px;
  }

  .carousel-arrow {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .recipe-carousel {
    min-height: 450px;
  }

  .recipe-title {
    font-size: 20px;
  }

  .recipe-section h4 {
    font-size: 16px;
  }

  .recipe-ingredients li,
  .recipe-instructions {
    font-size: 14px;
  }
}
</style>
