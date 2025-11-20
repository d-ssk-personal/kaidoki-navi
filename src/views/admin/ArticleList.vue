<template>
  <div class="admin-article-list">
    <div class="admin-header">
      <div class="header-left">
        <h1 class="page-title">コラム管理</h1>
        <!-- パンくずリスト -->
        <nav class="breadcrumb">
          <router-link to="/admin">管理画面</router-link>
          <span class="separator">›</span>
          <span class="current">コラム管理</span>
        </nav>
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
          />
          <button @click="performSearch" class="btn-search">
            🔍 検索
          </button>
          <button @click="goToCreatePage" class="btn-create">
            ➕ 新規作成
          </button>
        </div>

        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">ステータス:</label>
            <select
              v-model="filterStatus"
              class="filter-select"
            >
              <option value="">すべて</option>
              <option value="published">公開</option>
              <option value="draft">非公開</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">日付:</label>
            <input
              v-model="filterDate"
              type="date"
              class="filter-input"
            />
          </div>

          <div class="filter-group">
            <label class="filter-label">タグ:</label>
            <input
              v-model="filterTag"
              type="text"
              placeholder="タグで検索"
              class="filter-input"
            />
          </div>
        </div>

        <!-- 一括操作 -->
        <div v-if="selectedIds.length > 0" class="bulk-actions">
          <span class="selected-count">{{ selectedIds.length }}件選択中</span>
          <button @click="bulkPublish" class="btn-bulk btn-publish">
            一括公開
          </button>
          <button @click="bulkUnpublish" class="btn-bulk btn-unpublish">
            一括非公開
          </button>
          <button @click="confirmBulkDelete" class="btn-bulk btn-delete">
            一括削除
          </button>
        </div>
      </div>

      <!-- 記事一覧（マトリックス） -->
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

        <div v-else
          class="table-container"
          ref="tableContainer"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
        >
          <table class="articles-table">
            <thead>
              <tr>
                <th class="col-checkbox">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th class="col-status">ステータス</th>
                <th class="col-title">タイトル</th>
                <th class="col-content">本文</th>
                <th class="col-tags">タグ</th>
                <th class="col-date">日付</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="article in paginatedArticles"
                :key="article.id"
                :class="{ selected: selectedIds.includes(article.id) }"
              >
                <td class="col-checkbox">
                  <input
                    type="checkbox"
                    :checked="selectedIds.includes(article.id)"
                    @change="toggleSelect(article.id)"
                  />
                </td>
                <td class="col-status">
                  <span :class="['status-badge', article.status]">
                    {{ article.status === 'published' ? '公開' : '非公開' }}
                  </span>
                </td>
                <td class="col-title">
                  {{ truncateText(article.title, 40) }}
                </td>
                <td class="col-content">
                  {{ truncateText(article.content, 60) }}
                </td>
                <td class="col-tags">
                  <div v-if="article.tags && article.tags.length > 0" class="tags">
                    <span
                      v-for="(tag, index) in article.tags.slice(0, 2)"
                      :key="index"
                      class="tag"
                    >
                      {{ tag }}
                    </span>
                    <span v-if="article.tags.length > 2" class="tag-more">
                      +{{ article.tags.length - 2 }}
                    </span>
                  </div>
                  <span v-else class="no-tags">-</span>
                </td>
                <td class="col-date">
                  {{ formatDate(article.publishedAt) }}
                </td>
                <td class="col-actions">
                  <button
                    @click="goToEditPage(article.id)"
                    class="btn-icon btn-edit"
                    title="編集"
                  >
                    ✏️
                  </button>
                  <button
                    @click="confirmDelete(article)"
                    class="btn-icon btn-delete"
                    title="削除"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ページネーション -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="goToFirstPage"
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            ≪
          </button>
          <button
            @click="goToPrevPage"
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            ‹
          </button>
          <button
            v-for="page in displayedPages"
            :key="page"
            @click="goToPage(page)"
            :class="['pagination-btn', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
          <button
            @click="goToNextPage"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            ›
          </button>
          <button
            @click="goToLastPage"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            ≫
          </button>
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
      filterStatus: '',
      loading: false,
      selectedIds: [],
      currentPage: 1,
      itemsPerPage: 50,
      isDragging: false,
      startX: 0,
      scrollLeft: 0,
      searchTriggered: false
    }
  },
  setup() {
    const adminStore = useAdminStore()
    const articlesStore = useArticlesStore()
    return { adminStore, articlesStore }
  },
  computed: {
    filteredArticles() {
      // 検索ボタンが押されていない場合は全件表示
      if (!this.searchTriggered) {
        return this.articlesStore.searchArticles('', '', '', '')
      }

      let articles = this.articlesStore.searchArticles(
        this.searchQuery,
        '',
        this.filterTag,
        this.filterStatus
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
    },
    paginatedArticles() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredArticles.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredArticles.length / this.itemsPerPage)
    },
    displayedPages() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage

      // 現在のページの前後2ページを表示（最大5ページ）
      let start = Math.max(1, current - 2)
      let end = Math.min(total, current + 2)

      // 5ページ表示できるように調整
      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(total, start + 4)
        } else if (end === total) {
          start = Math.max(1, end - 4)
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    },
    isAllSelected() {
      return this.paginatedArticles.length > 0 &&
        this.selectedIds.length === this.filteredArticles.length
    }
  },
  methods: {
    performSearch() {
      this.searchTriggered = true
      this.currentPage = 1
    },
    // ページネーション関連
    goToPage(page) {
      this.currentPage = page
    },
    goToFirstPage() {
      this.currentPage = 1
    },
    goToLastPage() {
      this.currentPage = this.totalPages
    },
    goToPrevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    goToNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },
    // ドラッグスクロール関連
    onMouseDown(e) {
      this.isDragging = true
      this.startX = e.pageX - this.$refs.tableContainer.offsetLeft
      this.scrollLeft = this.$refs.tableContainer.scrollLeft
      this.$refs.tableContainer.style.cursor = 'grabbing'
    },
    onMouseMove(e) {
      if (!this.isDragging) return
      e.preventDefault()
      const x = e.pageX - this.$refs.tableContainer.offsetLeft
      const walk = (x - this.startX) * 2
      this.$refs.tableContainer.scrollLeft = this.scrollLeft - walk
    },
    onMouseUp() {
      this.isDragging = false
      if (this.$refs.tableContainer) {
        this.$refs.tableContainer.style.cursor = 'grab'
      }
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
        this.selectedIds = this.selectedIds.filter(selectedId => selectedId !== id)
      } else {
        alert('記事の削除に失敗しました')
      }
    },
    toggleSelect(id) {
      const index = this.selectedIds.indexOf(id)
      if (index > -1) {
        this.selectedIds.splice(index, 1)
      } else {
        this.selectedIds.push(id)
      }
    },
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedIds = []
      } else {
        this.selectedIds = this.filteredArticles.map(article => article.id)
      }
    },
    bulkPublish() {
      if (confirm(`選択した${this.selectedIds.length}件の記事を公開しますか？`)) {
        this.articlesStore.bulkUpdateStatus(this.selectedIds, 'published')
        alert('記事を公開しました')
        this.selectedIds = []
      }
    },
    bulkUnpublish() {
      if (confirm(`選択した${this.selectedIds.length}件の記事を非公開にしますか？`)) {
        this.articlesStore.bulkUpdateStatus(this.selectedIds, 'draft')
        alert('記事を非公開にしました')
        this.selectedIds = []
      }
    },
    confirmBulkDelete() {
      if (confirm(`選択した${this.selectedIds.length}件の記事を削除しますか？\nこの操作は取り消せません。`)) {
        this.articlesStore.bulkDeleteArticles(this.selectedIds)
        alert('記事を削除しました')
        this.selectedIds = []
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

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
}

/* パンくずリスト */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.breadcrumb a {
  color: var(--primary-color);
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.breadcrumb a:hover {
  opacity: 0.7;
  text-decoration: underline;
}

.breadcrumb .separator {
  color: var(--text-secondary);
}

.breadcrumb .current {
  color: var(--text-primary);
  font-weight: 500;
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
  max-width: 1400px;
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

.btn-search {
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-search:hover {
  background-color: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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

.filter-input,
.filter-select {
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.filter-input:focus,
.filter-select:focus {
  border-color: var(--primary-color);
}

.filter-select {
  min-width: 120px;
}

/* 一括操作 */
.bulk-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid var(--border-color);
}

.selected-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-right: auto;
}

.btn-bulk {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-bulk.btn-publish {
  background-color: var(--secondary-color);
  color: white;
}

.btn-bulk.btn-publish:hover {
  background-color: #059669;
  transform: translateY(-2px);
}

.btn-bulk.btn-unpublish {
  background-color: #6b7280;
  color: white;
}

.btn-bulk.btn-unpublish:hover {
  background-color: #4b5563;
  transform: translateY(-2px);
}

.btn-bulk.btn-delete {
  background-color: var(--danger-color);
  color: white;
}

.btn-bulk.btn-delete:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
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

/* テーブル */
.table-container {
  overflow-x: auto;
  cursor: grab;
  user-select: none;
}

.table-container:active {
  cursor: grabbing;
}

.articles-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.articles-table thead {
  background-color: var(--bg-light);
}

.articles-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
}

.articles-table td {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.articles-table tbody tr {
  transition: background-color 0.2s ease;
}

.articles-table tbody tr:hover {
  background-color: var(--bg-light);
}

.articles-table tbody tr.selected {
  background-color: #dbeafe;
}

.col-checkbox {
  width: 40px;
  text-align: center;
}

.col-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.col-status {
  width: 100px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.published {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.draft {
  background-color: #f3f4f6;
  color: #374151;
}

.col-title {
  max-width: 300px;
  font-weight: 500;
}

.col-content {
  max-width: 350px;
  color: var(--text-secondary);
}

.col-tags {
  max-width: 200px;
}

.tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  background-color: var(--bg-light);
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 500;
  border-radius: 8px;
}

.tag-more {
  font-size: 11px;
  color: var(--text-secondary);
}

.no-tags {
  color: var(--text-secondary);
}

.col-date {
  width: 110px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.col-actions {
  width: 100px;
  text-align: center;
}

.btn-icon {
  padding: 6px 10px;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background-color: var(--bg-light);
  transform: scale(1.1);
}

/* ページネーション */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid var(--border-color);
}

.pagination-btn {
  min-width: 40px;
  height: 40px;
  padding: 8px 12px;
  background-color: white;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.pagination-btn.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
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

  .filter-input,
  .filter-select {
    flex: 1;
  }

  .bulk-actions {
    flex-wrap: wrap;
  }

  .selected-count {
    width: 100%;
    margin-bottom: 8px;
  }

  .table-container {
    overflow-x: scroll;
  }

  .articles-table {
    min-width: 800px;
  }
}
</style>
