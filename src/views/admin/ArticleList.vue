<template>
  <div class="admin-article-list">
    <div class="admin-header">
      <div class="header-left">
        <router-link to="/admin" class="back-link">
          ← 管理画面に戻る
        </router-link>
        <h1 class="page-title">コラム管理</h1>
      </div>
      <button @click="handleLogout" class="logout-button">
        ログアウト
      </button>
    </div>

    <div class="page-content">
      <!-- 検索・フィルターセクション -->
      <div class="search-section">
        <div class="search-row">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="タイトルまたは本文で検索"
            class="search-input"
            @input="performSearch"
          />
          <button @click="goToCreatePage" class="btn-create">
            ➕ 新規作成
          </button>
        </div>

        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">日付:</label>
            <input
              v-model="filterDate"
              type="date"
              class="filter-input"
              @change="performSearch"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">タグ:</label>
            <input
              v-model="filterTag"
              type="text"
              placeholder="タグで検索"
              class="filter-input"
              @input="performSearch"
            />
          </div>
        </div>
      </div>

      <!-- 記事一覧 -->
      <div class="articles-section">
        <div class="section-header">
          <h2 class="section-title">
            コラム一覧
            <span class="result-count">（{{ filteredArticles.length }}件）</span>
          </h2>
        </div>

        <div v-if="loading" class="loading">
          <p>読み込み中...</p>
        </div>

        <div v-else-if="filteredArticles.length === 0" class="no-results">
          <p>記事が見つかりませんでした</p>
        </div>

        <div v-else class="article-cards">
          <div
            v-for="article in filteredArticles"
            :key="article.id"
            class="article-card"
          >
            <div class="card-header">
              <h3 class="article-title-preview">
                {{ truncateText(article.title, 40) }}
              </h3>
              <span class="article-date">
                {{ formatDate(article.publishedAt) }}
              </span>
            </div>

            <div class="card-body">
              <p class="article-content-preview">
                {{ truncateText(article.content, 100) }}
              </p>
              <div v-if="article.tags && article.tags.length > 0" class="article-tags">
                <span
                  v-for="(tag, index) in article.tags"
                  :key="index"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="card-footer">
              <button
                @click="goToEditPage(article.id)"
                class="btn btn-edit"
              >
                ✏️ 編集
              </button>
              <button
                @click="confirmDelete(article)"
                class="btn btn-delete"
              >
                🗑️ 削除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAdminStore } from '@/store/admin'
import { useArticlesStore } from '@/store/articles'

export default {
  name: 'AdminArticleList',
  data() {
    return {
      searchQuery: '',
      filterDate: '',
      filterTag: '',
      loading: false
    }
  },
  setup() {
    const adminStore = useAdminStore()
    const articlesStore = useArticlesStore()
    return { adminStore, articlesStore }
  },
  computed: {
    filteredArticles() {
      let articles = this.articlesStore.searchArticles(
        this.searchQuery,
        '',
        this.filterTag
      )

      // 日付フィルター
      if (this.filterDate) {
        const filterDateObj = new Date(this.filterDate)
        articles = articles.filter(article => {
          const articleDate = new Date(article.publishedAt)
          return (
            articleDate.getFullYear() === filterDateObj.getFullYear() &&
            articleDate.getMonth() === filterDateObj.getMonth() &&
            articleDate.getDate() === filterDateObj.getDate()
          )
        })
      }

      return articles
    }
  },
  methods: {
    performSearch() {
      // リアルタイム検索のためのメソッド（computedで処理）
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },
    goToCreatePage() {
      this.$router.push('/admin/articles/new')
    },
    goToEditPage(id) {
      this.$router.push(`/admin/articles/edit/${id}`)
    },
    confirmDelete(article) {
      if (confirm(`「${article.title}」を削除しますか？\nこの操作は取り消せません。`)) {
        this.deleteArticle(article.id)
      }
    },
    deleteArticle(id) {
      const success = this.articlesStore.deleteArticle(id)
      if (success) {
        alert('記事を削除しました')
      } else {
        alert('記事の削除に失敗しました')
      }
    },
    handleLogout() {
      if (confirm('ログアウトしますか？')) {
        this.adminStore.logout()
        this.$router.push('/admin/login')
      }
    }
  },
  mounted() {
    // 認証チェック
    this.adminStore.checkAuth()
    if (!this.adminStore.isAuthenticated) {
      this.$router.push('/admin/login')
    }
  }
}
</script>

<style scoped>
.admin-article-list {
  min-height: 100vh;
  background-color: var(--bg-light);
}

.admin-header {
  background-color: white;
  padding: 24px 32px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.back-link {
  color: var(--primary-color);
  font-size: 14px;
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.back-link:hover {
  opacity: 0.7;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
}

.logout-button {
  padding: 10px 20px;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 32px;
}

/* 検索セクション */
.search-section {
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.search-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: var(--primary-color);
}

.btn-create {
  padding: 12px 24px;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-create:hover {
  background-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.filter-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.filter-input {
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.filter-input:focus {
  border-color: var(--primary-color);
}

/* 記事一覧セクション */
.articles-section {
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 24px;
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

.loading,
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  font-size: 16px;
}

.article-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-card {
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.article-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.article-title-preview {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
  flex: 1;
}

.article-date {
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.card-body {
  margin-bottom: 16px;
}

.article-content-preview {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 4px 12px;
  background-color: var(--bg-light);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
}

.card-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit {
  background-color: var(--primary-color);
  color: white;
}

.btn-edit:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-delete {
  background-color: var(--danger-color);
  color: white;
}

.btn-delete:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

@media (max-width: 768px) {
  .admin-header {
    padding: 16px 20px;
  }

  .page-title {
    font-size: 22px;
  }

  .page-content {
    padding: 24px 20px;
  }

  .search-row {
    flex-direction: column;
  }

  .btn-create {
    width: 100%;
  }

  .filter-row {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .filter-input {
    flex: 1;
  }

  .card-header {
    flex-direction: column;
    gap: 8px;
  }

  .card-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
