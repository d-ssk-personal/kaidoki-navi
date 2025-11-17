<template>
  <div class="article-list-page">
    <!-- パンくずリスト -->
    <nav class="breadcrumb">
      <router-link to="/admin" class="breadcrumb-item">管理者トップ</router-link>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item active">コラム管理</span>
    </nav>

    <div class="page-header">
      <h1 class="page-title">コラム管理</h1>
      <router-link to="/admin/articles/new" class="btn btn-primary">
        ＋ 新規作成
      </router-link>
    </div>

    <!-- 検索フォーム -->
    <div class="search-section">
      <div class="search-form">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">タイトル</label>
            <input
              v-model="searchTitle"
              type="text"
              class="form-input"
              placeholder="タイトルで検索"
            />
          </div>

          <div class="form-group">
            <label class="form-label">日付</label>
            <input
              v-model="searchDate"
              type="date"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">タグ</label>
            <input
              v-model="searchTag"
              type="text"
              class="form-input"
              placeholder="タグで検索"
            />
          </div>
        </div>

        <div class="search-actions">
          <button class="btn btn-primary" @click="performSearch">
            検索
          </button>
          <button class="btn btn-secondary" @click="clearSearch">
            クリア
          </button>
        </div>
      </div>
    </div>

    <!-- 一括操作ボタンエリア -->
    <div class="bulk-actions">
      <button
        class="btn btn-danger"
        @click="bulkDelete"
        :disabled="selectedArticles.length === 0"
      >
        選択したコラムを削除 ({{ selectedArticles.length }})
      </button>
    </div>

    <!-- コラム一覧 -->
    <div v-if="loading" class="loading">
      読み込み中...
    </div>

    <div v-else-if="filteredArticles.length === 0" class="no-results">
      <p>コラムが見つかりませんでした</p>
    </div>

    <div v-else class="articles-table">
      <table>
        <thead>
          <tr>
            <th class="col-checkbox">
              <input
                type="checkbox"
                @change="toggleAllSelection"
                :checked="isAllSelected"
              />
            </th>
            <th class="col-title">タイトル</th>
            <th class="col-content">本文</th>
            <th class="col-tags">タグ</th>
            <th class="col-date">作成日</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in paginatedArticles" :key="article.id">
            <td class="col-checkbox">
              <input
                type="checkbox"
                :value="article.id"
                v-model="selectedArticles"
              />
            </td>
            <td class="col-title">{{ article.title }}</td>
            <td class="col-content">{{ truncateText(article.content, 50) }}</td>
            <td class="col-tags">
              <span
                v-for="tag in article.tags"
                :key="tag"
                class="tag-badge"
              >
                {{ tag }}
              </span>
            </td>
            <td class="col-date">{{ formatDate(article.createdAt) }}</td>
            <td class="col-actions">
              <div class="action-buttons">
                <router-link
                  :to="`/admin/articles/edit/${article.id}`"
                  class="btn btn-small btn-primary"
                >
                  編集
                </router-link>
                <button
                  class="btn btn-small btn-danger"
                  @click="deleteArticle(article.id)"
                >
                  削除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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

    <!-- 削除確認モーダル -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">削除確認</h2>
        <p class="modal-message">本当にこのコラムを削除しますか？</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">
            キャンセル
          </button>
          <button class="btn btn-danger" @click="confirmDelete">
            削除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { articles } from '@/data/articles'

export default {
  name: 'ArticleList',
  data() {
    return {
      articles: [],
      loading: true,
      searchTitle: '',
      searchDate: '',
      searchTag: '',
      currentPage: 1,
      itemsPerPage: 10,
      selectedArticles: [],
      showDeleteModal: false,
      articleToDelete: null
    }
  },
  computed: {
    filteredArticles() {
      let results = [...this.articles]

      if (this.searchTitle) {
        results = results.filter(a =>
          a.title.toLowerCase().includes(this.searchTitle.toLowerCase())
        )
      }

      if (this.searchDate) {
        results = results.filter(a =>
          a.createdAt.startsWith(this.searchDate)
        )
      }

      if (this.searchTag) {
        results = results.filter(a =>
          a.tags.some(tag =>
            tag.toLowerCase().includes(this.searchTag.toLowerCase())
          )
        )
      }

      return results
    },
    paginatedArticles() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredArticles.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredArticles.length / this.itemsPerPage)
    },
    isAllSelected() {
      return this.paginatedArticles.length > 0 &&
             this.selectedArticles.length === this.paginatedArticles.length
    }
  },
  mounted() {
    // ログインチェック
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn')
    if (!isLoggedIn) {
      this.$router.push('/admin/login')
      return
    }

    this.loadArticles()
  },
  methods: {
    async loadArticles() {
      try {
        this.loading = true
        // TODO: 本番環境ではAPIから取得
        await new Promise(resolve => setTimeout(resolve, 500))
        this.articles = articles.map(article => ({
          ...article,
          createdAt: article.date
        }))
      } catch (error) {
        console.error('コラム取得エラー:', error)
      } finally {
        this.loading = false
      }
    },
    performSearch() {
      this.currentPage = 1
    },
    clearSearch() {
      this.searchTitle = ''
      this.searchDate = ''
      this.searchTag = ''
      this.currentPage = 1
    },
    goToPage(page) {
      this.currentPage = page
    },
    toggleAllSelection(event) {
      if (event.target.checked) {
        this.selectedArticles = this.paginatedArticles.map(a => a.id)
      } else {
        this.selectedArticles = []
      }
    },
    deleteArticle(id) {
      this.articleToDelete = id
      this.showDeleteModal = true
    },
    confirmDelete() {
      if (this.articleToDelete) {
        this.articles = this.articles.filter(a => a.id !== this.articleToDelete)
        this.showDeleteModal = false
        this.articleToDelete = null
      }
    },
    bulkDelete() {
      if (this.selectedArticles.length === 0) return

      if (confirm(`選択した${this.selectedArticles.length}件のコラムを削除しますか？`)) {
        this.articles = this.articles.filter(a => !this.selectedArticles.includes(a.id))
        this.selectedArticles = []
      }
    },
    truncateText(text, length) {
      if (text.length <= length) return text
      return text.substring(0, length) + '...'
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('ja-JP')
    }
  }
}
</script>

<style scoped>
.article-list-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
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
  color: var(--text-secondary);
  text-decoration: none;
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  color: var(--text-primary);
}

.search-section {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input {
  padding: 10px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.search-actions {
  display: flex;
  gap: 12px;
}

.bulk-actions {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.loading,
.no-results {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 12px;
  color: var(--text-secondary);
}

.articles-table {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: var(--bg-light);
}

th {
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

td {
  padding: 16px 12px;
  border-top: 1px solid var(--border-color);
  font-size: 14px;
}

.col-checkbox {
  width: 50px;
  text-align: center;
}

.col-title {
  min-width: 200px;
  font-weight: 500;
}

.col-content {
  min-width: 300px;
  color: var(--text-secondary);
}

.col-tags {
  min-width: 150px;
}

.col-date {
  width: 120px;
  color: var(--text-secondary);
}

.col-actions {
  width: 180px;
}

.tag-badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 4px;
  margin-bottom: 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: var(--bg-light);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-danger {
  background-color: var(--danger-color);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

/* ページネーション */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
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
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
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
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.modal-message {
  margin-bottom: 24px;
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .article-list-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .articles-table {
    overflow-x: auto;
  }

  table {
    min-width: 800px;
  }

  .search-actions,
  .bulk-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
