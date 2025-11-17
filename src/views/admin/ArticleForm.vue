<template>
  <div class="admin-article-form">
    <div class="admin-header">
      <div class="header-left">
        <h1 class="page-title">{{ isEditMode ? 'コラム編集' : 'コラム追加' }}</h1>
        <!-- パンくずリスト -->
        <nav class="breadcrumb">
          <router-link to="/admin">管理画面</router-link>
          <span class="separator">›</span>
          <router-link to="/admin/articles">コラム管理</router-link>
          <span class="separator">›</span>
          <span class="current">{{ isEditMode ? 'コラム編集' : 'コラム追加' }}</span>
        </nav>
      </div>
      <button @click="handleLogout" class="logout-button">
        ログアウト
      </button>
    </div>

    <div class="page-content">
      <form @submit.prevent="handleSubmit" class="article-form">
        <!-- タイトル -->
        <div class="form-group">
          <label for="title" class="form-label required">タイトル</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="記事のタイトルを入力"
            required
          />
        </div>

        <!-- 本文 -->
        <div class="form-group">
          <label for="content" class="form-label required">本文</label>
          <textarea
            id="content"
            v-model="form.content"
            class="form-textarea"
            placeholder="記事の本文を入力"
            rows="15"
            required
          ></textarea>
        </div>

        <!-- カテゴリ -->
        <div class="form-group">
          <label for="category" class="form-label required">カテゴリ</label>
          <select
            id="category"
            v-model="form.category"
            class="form-select"
            required
          >
            <option value="">カテゴリを選択</option>
            <option value="値上げ情報">値上げ情報</option>
            <option value="値下げ速報">値下げ速報</option>
            <option value="特売情報">特売情報</option>
            <option value="節約術">節約術</option>
            <option value="活用術">活用術</option>
            <option value="市場分析">市場分析</option>
            <option value="買い物術">買い物術</option>
            <option value="アプリ更新">アプリ更新</option>
          </select>
        </div>

        <!-- 公開ステータス -->
        <div class="form-group">
          <label for="status" class="form-label required">公開ステータス</label>
          <select
            id="status"
            v-model="form.status"
            class="form-select"
            required
          >
            <option value="published">公開</option>
            <option value="draft">非公開</option>
          </select>
        </div>

        <!-- 画像URL（最大3枚） -->
        <div class="form-group">
          <label class="form-label">画像URL（最大3枚）</label>
          <div class="image-inputs">
            <div v-for="i in 3" :key="i" class="image-input-group">
              <input
                v-model="form.images[i - 1]"
                type="url"
                class="form-input"
                :placeholder="`画像${i}のURL（オプション）`"
              />
              <div v-if="form.images[i - 1]" class="image-preview">
                <img :src="form.images[i - 1]" :alt="`画像${i}`" />
              </div>
            </div>
          </div>
        </div>

        <!-- タグ（最大3つ） -->
        <div class="form-group">
          <label class="form-label">タグ（最大3つ）</label>
          <div class="tag-inputs">
            <input
              v-for="i in 3"
              :key="i"
              v-model="form.tags[i - 1]"
              type="text"
              class="form-input tag-input"
              :placeholder="`タグ${i}（オプション）`"
            />
          </div>
        </div>

        <!-- エラーメッセージ -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- フォームアクション -->
        <div class="form-actions">
          <button
            type="button"
            @click="goBack"
            class="btn btn-cancel"
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="btn btn-submit"
            :disabled="loading"
          >
            {{ loading ? '処理中...' : '登録内容を確認' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 確認モーダル -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">登録内容の確認</h2>
        </div>

        <div class="modal-body">
          <div class="confirm-item">
            <span class="confirm-label">タイトル:</span>
            <span class="confirm-value">{{ form.title }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">カテゴリ:</span>
            <span class="confirm-value">{{ form.category }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">ステータス:</span>
            <span class="confirm-value">{{ form.status === 'published' ? '公開' : '非公開' }}</span>
          </div>

          <div class="confirm-item">
            <span class="confirm-label">本文:</span>
            <span class="confirm-value text-preview">{{ form.content }}</span>
          </div>

          <div v-if="filteredImages.length > 0" class="confirm-item">
            <span class="confirm-label">画像:</span>
            <span class="confirm-value">{{ filteredImages.length }}枚</span>
          </div>

          <div v-if="filteredTags.length > 0" class="confirm-item">
            <span class="confirm-label">タグ:</span>
            <div class="confirm-tags">
              <span
                v-for="(tag, index) in filteredTags"
                :key="index"
                class="confirm-tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-cancel">
            キャンセル
          </button>
          <button @click="confirmSave" class="btn btn-submit">
            {{ isEditMode ? '更新する' : '登録する' }}
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
  name: 'ArticleForm',
  data() {
    return {
      form: {
        title: '',
        content: '',
        category: '',
        status: 'draft',
        images: ['', '', ''],
        tags: ['', '', '']
      },
      showConfirmModal: false,
      errorMessage: '',
      loading: false
    }
  },
  setup() {
    const adminStore = useAdminStore()
    const articlesStore = useArticlesStore()
    return { adminStore, articlesStore }
  },
  computed: {
    isEditMode() {
      return !!this.$route.params.id
    },
    filteredImages() {
      return this.form.images.filter(img => img.trim() !== '')
    },
    filteredTags() {
      return this.form.tags.filter(tag => tag.trim() !== '')
    }
  },
  methods: {
    handleSubmit() {
      this.errorMessage = ''
      this.showConfirmModal = true
    },
    closeModal() {
      this.showConfirmModal = false
    },
    async confirmSave() {
      this.loading = true
      this.errorMessage = ''

      try {
        const articleData = {
          title: this.form.title,
          content: this.form.content,
          category: this.form.category,
          status: this.form.status,
          images: this.filteredImages,
          tags: this.filteredTags
        }

        if (this.isEditMode) {
          // 編集
          const updated = this.articlesStore.updateArticle(
            this.$route.params.id,
            articleData
          )
          if (updated) {
            alert('記事を更新しました')
            this.$router.push('/admin/articles')
          } else {
            this.errorMessage = '記事の更新に失敗しました'
          }
        } else {
          // 新規作成
          this.articlesStore.addArticle(articleData)
          alert('記事を登録しました')
          this.$router.push('/admin/articles')
        }
      } catch (error) {
        this.errorMessage = '処理中にエラーが発生しました'
        console.error('Save error:', error)
      } finally {
        this.loading = false
        this.showConfirmModal = false
      }
    },
    loadArticle() {
      if (this.isEditMode) {
        const article = this.articlesStore.getArticleById(this.$route.params.id)
        if (article) {
          this.form.title = article.title
          this.form.content = article.content
          this.form.category = article.category
          this.form.status = article.status || 'draft'
          this.form.images = [
            article.images?.[0] || '',
            article.images?.[1] || '',
            article.images?.[2] || ''
          ]
          this.form.tags = [
            article.tags?.[0] || '',
            article.tags?.[1] || '',
            article.tags?.[2] || ''
          ]
        } else {
          alert('記事が見つかりませんでした')
          this.$router.push('/admin/articles')
        }
      }
    },
    goBack() {
      if (confirm('入力内容は破棄されます。よろしいですか？')) {
        this.$router.push('/admin/articles')
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
      return
    }

    // 編集モードの場合、記事データをロード
    this.loadArticle()
  }
}
</script>

<style scoped>
.admin-article-form {
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
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 32px;
}

.article-form {
  background-color: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-label.required::after {
  content: ' *';
  color: var(--danger-color);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: var(--primary-color);
}

.form-textarea {
  resize: vertical;
  min-height: 200px;
}

.image-inputs {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-preview {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--border-color);
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.tag-inputs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tag-input {
  flex: 1;
  min-width: 150px;
}

.error-message {
  padding: 12px 16px;
  background-color: #fee;
  border: 1px solid var(--danger-color);
  border-radius: 8px;
  color: var(--danger-color);
  font-size: 14px;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid var(--border-color);
}

.btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background-color: var(--bg-light);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.btn-cancel:hover {
  background-color: #e5e7eb;
}

.btn-submit {
  background-color: var(--primary-color);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px;
  border-bottom: 2px solid var(--border-color);
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
}

.confirm-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.confirm-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.confirm-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.confirm-value {
  display: block;
  font-size: 16px;
  color: var(--text-primary);
}

.text-preview {
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  line-height: 1.6;
}

.confirm-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.confirm-tag {
  display: inline-block;
  padding: 6px 12px;
  background-color: var(--primary-color);
  color: white;
  font-size: 14px;
  border-radius: 16px;
}

.modal-footer {
  padding: 24px;
  border-top: 2px solid var(--border-color);
  display: flex;
  gap: 16px;
  justify-content: flex-end;
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

  .article-form {
    padding: 20px;
  }

  .tag-inputs {
    flex-direction: column;
  }

  .tag-input {
    width: 100%;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }
}
</style>
