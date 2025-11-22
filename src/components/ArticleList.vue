<template>
  <section class="articles-section">
    <h2 class="section-title">家計・物価コラム</h2>
    <p class="section-description">
      物価高騰や家計に関する最新情報をお届けします
    </p>

    <!-- 検索フォーム -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="記事を検索（例: 値上げ、節約、特売など）"
          class="search-input"
          @keyup.enter="performSearch"
        />
        <button class="search-button" @click="performSearch">
          🔍 検索
        </button>
      </div>

      <button
        v-if="isSearching"
        class="clear-search"
        @click="clearSearch"
      >
        ✕ 検索をクリア
      </button>
    </div>

    <!-- 検索結果メッセージ -->
    <div v-if="isSearching" class="search-result-info">
      <p v-if="displayedArticles.length > 0">
        {{ displayedArticles.length }}件の記事が見つかりました
      </p>
      <p v-else class="no-results">
        該当する記事が見つかりませんでした
      </p>
    </div>

    <!-- 記事一覧 -->
    <div class="articles-grid">
      <ArticleCard
        v-for="article in displayedArticles"
        :key="article.id"
        :article="article"
      />
    </div>

    <!-- 記事が0件の場合 -->
    <div v-if="displayedArticles.length === 0 && !isSearching" class="no-articles">
      <p>記事がまだありません</p>
    </div>
  </section>
</template>

<script>
import ArticleCard from './ArticleCard.vue'
import api from '@/services/api'

export default {
  name: 'ArticleList',
  components: {
    ArticleCard
  },
  props: {
    limit: {
      type: Number,
      default: 6
    }
  },
  data() {
    return {
      searchQuery: '',
      isSearching: false,
      allArticles: [],
      searchResults: [],
      loading: false
    }
  },
  computed: {
    displayedArticles() {
      if (this.isSearching) {
        return this.searchResults
      }
      return this.allArticles
    }
  },
  mounted() {
    this.loadArticles()
  },
  methods: {
    async loadArticles() {
      try {
        this.loading = true
        const response = await api.getLatestArticles(this.limit)
        this.allArticles = response.items
      } catch (error) {
        console.error('記事の取得に失敗しました:', error)
        this.allArticles = []
      } finally {
        this.loading = false
      }
    },
    async performSearch() {
      if (this.searchQuery.trim()) {
        try {
          this.loading = true
          this.isSearching = true
          const response = await api.getArticles({
            search: this.searchQuery.trim()
          })
          this.searchResults = response.items
        } catch (error) {
          console.error('記事の検索に失敗しました:', error)
          this.searchResults = []
        } finally {
          this.loading = false
        }
      } else {
        this.clearSearch()
      }
    },
    clearSearch() {
      this.searchQuery = ''
      this.isSearching = false
      this.searchResults = []
    }
  }
}
</script>

<style scoped>
.articles-section {
  margin-bottom: 60px;
}

.section-title {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.section-description {
  text-align: center;
  color: var(--text-secondary);
  font-size: 16px;
  margin-bottom: 32px;
}

.search-container {
  max-width: 800px;
  margin: 0 auto 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input-wrapper {
  display: flex;
  gap: 12px;
}

.search-input {
  flex: 1;
  padding: 14px 20px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: var(--primary-color);
}

.search-button {
  padding: 14px 28px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.search-button:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.clear-search {
  align-self: center;
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

.search-result-info {
  text-align: center;
  margin-bottom: 24px;
  font-size: 16px;
  color: var(--text-primary);
}

.no-results {
  color: var(--text-secondary);
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.no-articles {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 18px;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 24px;
  }

  .section-description {
    font-size: 14px;
  }

  .search-input-wrapper {
    flex-direction: column;
  }

  .search-button {
    width: 100%;
  }

  .articles-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
