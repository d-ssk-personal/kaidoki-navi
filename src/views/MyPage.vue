<template>
  <div class="mypage">
    <div class="container">
      <!-- ヘッダー -->
      <div class="page-header">
        <h1 class="page-title">マイページ</h1>
        <p class="page-subtitle">{{ authStore.currentUser?.name }}さん、こんにちは</p>
      </div>

      <!-- お気に入り店舗セクション -->
      <section class="favorites-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">⭐</span>
            お気に入りの店舗
          </h2>
          <p class="section-count">{{ favoriteStoresList.length }}件</p>
        </div>

        <!-- お気に入りがない場合 -->
        <div v-if="favoriteStoresList.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p class="empty-text">お気に入りの店舗がまだありません</p>
          <p class="empty-subtext">
            チラシモーダルから店舗をお気に入りに追加してください
          </p>
          <router-link to="/top" class="btn-primary">
            トップページへ
          </router-link>
        </div>

        <!-- お気に入り店舗リスト -->
        <div v-else class="favorites-grid">
          <div
            v-for="store in favoriteStoresList"
            :key="store.id"
            class="store-card"
            @click="openStoreFlyer(store)"
          >
            <div class="store-card-header">
              <h3 class="store-name">{{ store.name }}</h3>
              <button
                class="favorite-btn active"
                @click.stop="removeFavorite(store.id)"
                title="お気に入りから削除"
              >
                ⭐
              </button>
            </div>

            <div class="store-info">
              <div class="info-item">
                <span class="info-icon">📍</span>
                <span class="info-text">{{ store.address }}</span>
              </div>
              <div class="info-item">
                <span class="info-icon">📞</span>
                <span class="info-text">{{ store.phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-icon">🗓️</span>
                <span class="info-text">{{ store.salePeriod }}</span>
              </div>
            </div>

            <div class="store-card-footer">
              <span class="view-flyer-text">チラシを見る →</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- チラシモーダル -->
    <FlyerModal
      :show="showModal"
      :store="selectedStore"
      :activeTab="activeTab"
      :currentFlyerImageIndex="currentFlyerImageIndex"
      :currentRecipeIndex="currentRecipeIndex"
      :recipes="recipes"
      :isLoadingRecipe="isLoadingRecipe"
      @close="closeModal"
      @generate-recipes="generateRecipes"
      @switch-tab="switchTab"
      @previous-flyer-image="previousFlyerImage"
      @next-flyer-image="nextFlyerImage"
      @go-to-flyer-image="goToFlyerImage"
      @previous-recipe="previousRecipe"
      @next-recipe="nextRecipe"
      @go-to-recipe="goToRecipe"
      @share-sns="shareSNS"
    />
  </div>
</template>

<script>
import { useAuthStore } from '@/store/auth'
import FlyerModal from '@/components/FlyerModal.vue'

export default {
  name: 'MyPage',
  components: {
    FlyerModal
  },
  data() {
    return {
      // モーダル関連
      showModal: false,
      selectedStore: null,
      activeTab: 'flyer',
      currentFlyerImageIndex: 0,
      currentRecipeIndex: 0,
      recipes: [],
      isLoadingRecipe: false,

      // ダミー店舗データ（本来はAPIから取得）
      allStores: [
        {
          id: 1,
          name: 'イオン大宮店',
          storeName: 'イオン大宮店',
          postalCode: '〒330-0846',
          address: '埼玉県さいたま市大宮区大門町2-90',
          phone: '048-645-7700',
          salePeriod: '2025/11/19 - 2025/11/25',
          flyerImages: [
            'https://placehold.jp/400x600.png?text=Flyer+1',
            'https://placehold.jp/400x600.png?text=Flyer+2'
          ]
        },
        {
          id: 2,
          name: '西友浦和店',
          storeName: '西友浦和店',
          postalCode: '〒330-0062',
          address: '埼玉県さいたま市浦和区仲町1-7-1',
          phone: '048-822-1111',
          salePeriod: '2025/11/20 - 2025/11/26',
          flyerImages: [
            'https://placehold.jp/400x600.png?text=Seiyu+1'
          ]
        },
        {
          id: 3,
          name: 'ヨークマート川口店',
          storeName: 'ヨークマート川口店',
          postalCode: '〒332-0012',
          address: '埼玉県川口市本町4-4-16',
          phone: '048-224-5678',
          salePeriod: '2025/11/18 - 2025/11/24',
          flyerImages: [
            'https://placehold.jp/400x600.png?text=York+1',
            'https://placehold.jp/400x600.png?text=York+2',
            'https://placehold.jp/400x600.png?text=York+3'
          ]
        }
      ]
    }
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  computed: {
    favoriteStoresList() {
      // お気に入り店舗IDリストに基づいて店舗情報を取得
      return this.allStores.filter(store =>
        this.authStore.isFavorite(store.id)
      )
    }
  },
  mounted() {
    // 未ログインの場合はログインページにリダイレクト
    if (!this.authStore.isLoggedIn) {
      this.$router.push('/login')
    }
  },
  methods: {
    openStoreFlyer(store) {
      this.selectedStore = store
      this.activeTab = 'flyer'
      this.currentFlyerImageIndex = 0
      this.currentRecipeIndex = 0
      this.recipes = []
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.selectedStore = null
    },

    removeFavorite(storeId) {
      this.authStore.removeFavorite(storeId)
    },

    switchTab(tab) {
      this.activeTab = tab
    },

    previousFlyerImage() {
      if (this.currentFlyerImageIndex > 0) {
        this.currentFlyerImageIndex--
      }
    },

    nextFlyerImage() {
      if (this.currentFlyerImageIndex < this.selectedStore.flyerImages.length - 1) {
        this.currentFlyerImageIndex++
      }
    },

    goToFlyerImage(index) {
      this.currentFlyerImageIndex = index
    },

    previousRecipe() {
      if (this.currentRecipeIndex > 0) {
        this.currentRecipeIndex--
      }
    },

    nextRecipe() {
      if (this.currentRecipeIndex < this.recipes.length - 1) {
        this.currentRecipeIndex++
      }
    },

    goToRecipe(index) {
      this.currentRecipeIndex = index
    },

    generateRecipes() {
      this.isLoadingRecipe = true
      this.activeTab = 'recipe'

      // ダミーレシピ生成（2秒後）
      setTimeout(() => {
        this.recipes = [
          {
            id: 1,
            title: '鶏肉の照り焼き',
            image: 'https://placehold.jp/600x400.png?text=Recipe+1',
            ingredients: [
              '鶏もも肉 300g',
              '醤油 大さじ2',
              'みりん 大さじ2',
              '砂糖 大さじ1',
              '生姜 1片'
            ],
            instructions: '1. 鶏肉を一口大に切ります。\n2. フライパンで鶏肉を焼きます。\n3. 調味料を加えて煮詰めます。\n4. 照りが出たら完成です。'
          },
          {
            id: 2,
            title: '野菜炒め',
            image: 'https://placehold.jp/600x400.png?text=Recipe+2',
            ingredients: [
              'キャベツ 1/4個',
              '人参 1/2本',
              'ピーマン 2個',
              '豚肉 150g',
              '塩コショウ 適量'
            ],
            instructions: '1. 野菜を食べやすい大きさに切ります。\n2. 豚肉を炒めます。\n3. 野菜を加えて炒めます。\n4. 塩コショウで味を整えたら完成です。'
          },
          {
            id: 3,
            title: '味噌汁',
            image: 'https://placehold.jp/600x400.png?text=Recipe+3',
            ingredients: [
              '豆腐 1/2丁',
              'わかめ 適量',
              '味噌 大さじ2',
              '出汁 400ml',
              'ネギ 適量'
            ],
            instructions: '1. 出汁を温めます。\n2. 豆腐とわかめを加えます。\n3. 味噌を溶かし入れます。\n4. ネギを散らして完成です。'
          }
        ]
        this.isLoadingRecipe = false
        this.currentRecipeIndex = 0
      }, 2000)
    },

    shareSNS(platform) {
      const recipe = this.recipes[this.currentRecipeIndex]
      if (!recipe) return

      const text = `${this.selectedStore.name}のチラシから「${recipe.title}」のレシピを提案してもらいました！ #チラシキッチン`
      const url = window.location.origin

      switch (platform) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            '_blank'
          )
          break
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
            '_blank'
          )
          break
        case 'instagram':
          // InstagramはWebからの直接共有が制限されているため、クリップボードにコピー
          navigator.clipboard.writeText(text + '\n' + url)
          alert('投稿内容をクリップボードにコピーしました。Instagramアプリで貼り付けてください。')
          break
      }
    }
  }
}
</script>

<style scoped>
.mypage {
  min-height: calc(100vh - 70px);
  background-color: var(--bg-light);
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ページヘッダー */
.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

/* セクション */
.favorites-section {
  background-color: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-color);
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 28px;
}

.section-count {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
  background-color: rgba(102, 126, 234, 0.1);
  padding: 6px 16px;
  border-radius: 20px;
}

/* 空の状態 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-text {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.empty-subtext {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.btn-primary {
  display: inline-block;
  padding: 12px 32px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 店舗カードグリッド */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.store-card {
  background-color: white;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.store-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.store-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.store-name {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary);
  flex: 1;
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px;
  flex-shrink: 0;
}

.favorite-btn.active {
  filter: grayscale(0);
}

.favorite-btn:hover {
  transform: scale(1.2);
}

.store-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.info-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.info-text {
  flex: 1;
  line-height: 1.5;
}

.store-card-footer {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  text-align: right;
}

.view-flyer-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .mypage {
    padding: 24px 16px;
  }

  .page-header {
    margin-bottom: 32px;
  }

  .page-title {
    font-size: 28px;
  }

  .favorites-section {
    padding: 20px 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .section-title {
    font-size: 20px;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .store-card {
    padding: 16px;
  }

  .store-name {
    font-size: 18px;
  }
}
</style>
