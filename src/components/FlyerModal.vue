<template>
  <!-- チラシモーダル -->
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <!-- ヘッダー -->
      <div class="modal-header">
        <div class="modal-header-left">
          <h2 class="modal-title">{{ store?.name }}</h2>
          <p class="modal-period">セール期間: {{ store?.salePeriod }}</p>
        </div>
        <div class="modal-header-right">
          <button class="recipe-suggest-button" @click="$emit('generate-recipes')" :disabled="isLoadingRecipe">
            {{ isLoadingRecipe ? 'レシピ生成中...' : 'チラシからレシピを提案' }}
          </button>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </div>
      </div>

      <!-- タブ -->
      <div class="modal-tabs">
        <button
          :class="['tab-button', { active: activeTab === 'flyer' }]"
          @click="$emit('switch-tab', 'flyer')"
        >
          チラシ
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'recipe' }]"
          @click="$emit('switch-tab', 'recipe')"
        >
          レシピ
        </button>
        <!-- SNS共有アイコン（レシピタブでレシピがある場合のみ表示） -->
        <div v-if="activeTab === 'recipe' && recipes.length > 0" class="sns-share-icons">
          <button class="sns-icon twitter-icon" @click="$emit('share-sns', 'twitter')" title="Xで共有">
            𝕏
          </button>
          <button class="sns-icon facebook-icon" @click="$emit('share-sns', 'facebook')" title="Facebookで共有">
            f
          </button>
          <button class="sns-icon instagram-icon" @click="$emit('share-sns', 'instagram')" title="Instagramで共有">
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
              @click="$emit('previous-flyer-image')"
              :disabled="currentFlyerImageIndex === 0"
            >
              ◀
            </button>

            <div class="flyer-carousel">
              <div
                v-for="(image, index) in store?.flyerImages"
                :key="index"
                class="flyer-slide"
                :class="{ active: index === currentFlyerImageIndex }"
              >
                <img :src="image" :alt="`${store?.name} チラシ ${index + 1}`" class="flyer-image" />
              </div>
            </div>

            <button
              class="carousel-arrow right"
              @click="$emit('next-flyer-image')"
              :disabled="currentFlyerImageIndex === store?.flyerImages.length - 1"
            >
              ▶
            </button>
          </div>

          <!-- カルーセルインジケーター -->
          <div class="carousel-indicators">
            <button
              v-for="(image, index) in store?.flyerImages"
              :key="index"
              class="indicator"
              :class="{ active: index === currentFlyerImageIndex }"
              @click="$emit('go-to-flyer-image', index)"
            ></button>
          </div>

          <!-- 店舗情報 -->
          <div class="store-info-section">
            <h3 class="store-info-title">店舗情報</h3>
            <div class="store-info-grid">
              <div class="store-info-item">
                <span class="store-info-label">郵便番号</span>
                <span class="store-info-value">{{ store?.postalCode || '未登録' }}</span>
              </div>
              <div class="store-info-item">
                <span class="store-info-label">住所</span>
                <span class="store-info-value">{{ store?.address || '未登録' }}</span>
              </div>
              <div class="store-info-item">
                <span class="store-info-label">電話番号</span>
                <span class="store-info-value">{{ store?.phone || '未登録' }}</span>
              </div>
            </div>
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
              @click="$emit('previous-recipe')"
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
              @click="$emit('next-recipe')"
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
              @click="$emit('go-to-recipe', index)"
            ></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FlyerModal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    store: {
      type: Object,
      default: null
    },
    activeTab: {
      type: String,
      default: 'flyer'
    },
    currentFlyerImageIndex: {
      type: Number,
      default: 0
    },
    currentRecipeIndex: {
      type: Number,
      default: 0
    },
    recipes: {
      type: Array,
      default: () => []
    },
    isLoadingRecipe: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'close',
    'generate-recipes',
    'switch-tab',
    'previous-flyer-image',
    'next-flyer-image',
    'go-to-flyer-image',
    'previous-recipe',
    'next-recipe',
    'go-to-recipe',
    'share-sns'
  ],
  watch: {
    show(newVal) {
      // モーダルが開いているときはスクロールを無効化
      if (newVal) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  beforeUnmount() {
    // コンポーネント破棄時にスクロールを有効化
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
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

/* 店舗情報セクション */
.store-info-section {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-top: 8px;
}

.store-info-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--primary-color);
}

.store-info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.store-info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.store-info-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.store-info-value {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
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

  .store-info-section {
    padding: 16px;
  }

  .store-info-title {
    font-size: 18px;
  }

  .store-info-label {
    font-size: 12px;
  }

  .store-info-value {
    font-size: 14px;
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
