<template>
  <div class="article-form-page">
    <!-- パンくずリスト -->
    <nav class="breadcrumb">
      <router-link to="/admin" class="breadcrumb-item">管理者トップ</router-link>
      <span class="breadcrumb-separator">›</span>
      <router-link to="/admin/articles" class="breadcrumb-item">コラム管理</router-link>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item active">{{ isEditMode ? '編集' : '新規作成' }}</span>
    </nav>

    <div class="page-header">
      <h1 class="page-title">{{ isEditMode ? 'コラム編集' : 'コラム新規作成' }}</h1>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <!-- タイトル -->
        <div class="form-group">
          <label class="form-label required">タイトル</label>
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="タイトルを入力"
            required
          />
        </div>

        <!-- 本文 -->
        <div class="form-group">
          <label class="form-label required">本文</label>
          <textarea
            v-model="form.content"
            class="form-textarea"
            rows="12"
            placeholder="本文を入力"
            required
          ></textarea>
        </div>

        <!-- 画像添付 -->
        <div class="form-group">
          <label class="form-label">画像添付（最大3枚）</label>
          <div class="image-upload-area">
            <div
              v-for="(image, index) in form.images"
              :key="index"
              class="image-preview"
            >
              <img v-if="image" :src="image" alt="プレビュー" />
              <div v-else class="image-placeholder">
                画像{{ index + 1 }}
              </div>
              <button
                type="button"
                class="remove-image-btn"
                @click="removeImage(index)"
                v-if="image"
              >
                ✕
              </button>
              <input
                type="file"
                @change="handleImageUpload($event, index)"
                accept="image/*"
                class="file-input"
              />
            </div>
          </div>
          <p class="form-hint">JPG, PNG形式のみ対応</p>
        </div>

        <!-- タグ -->
        <div class="form-group">
          <label class="form-label">タグ（最大3つ）</label>
          <div class="tags-input-area">
            <div
              v-for="(tag, index) in form.tags"
              :key="index"
              class="tag-input-row"
            >
              <input
                v-model="form.tags[index]"
                type="text"
                class="form-input"
                :placeholder="`タグ${index + 1}`"
              />
              <button
                v-if="tag"
                type="button"
                class="remove-tag-btn"
                @click="removeTag(index)"
              >
                削除
              </button>
            </div>
          </div>
        </div>

        <!-- ボタンエリア -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="goBack">
            キャンセル
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? '保存中...' : '登録' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 確認モーダル -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="showConfirmModal = false">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">確認</h2>
        <div class="modal-body">
          <p class="modal-message">{{ isEditMode ? 'コラムを更新' : 'コラムを登録' }}しますか？</p>

          <div class="confirm-details">
            <div class="detail-item">
              <span class="detail-label">タイトル:</span>
              <span class="detail-value">{{ form.title }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">本文:</span>
              <span class="detail-value">{{ truncateText(form.content, 100) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">タグ:</span>
              <span class="detail-value">{{ form.tags.filter(t => t).join(', ') || 'なし' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">画像:</span>
              <span class="detail-value">{{ form.images.filter(i => i).length }}枚</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showConfirmModal = false">
            キャンセル
          </button>
          <button class="btn btn-primary" @click="confirmSave">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { articles } from '@/data/articles'

export default {
  name: 'ArticleForm',
  data() {
    return {
      form: {
        title: '',
        content: '',
        images: ['', '', ''],
        tags: ['', '', '']
      },
      saving: false,
      showConfirmModal: false,
      isEditMode: false,
      articleId: null
    }
  },
  mounted() {
    // ログインチェック
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn')
    if (!isLoggedIn) {
      this.$router.push('/admin/login')
      return
    }

    // 編集モードの場合、記事データを取得
    const id = this.$route.params.id
    if (id && id !== 'new') {
      this.isEditMode = true
      this.articleId = id
      this.loadArticle(id)
    }
  },
  methods: {
    loadArticle(id) {
      // TODO: 本番環境ではAPIから取得
      const article = articles.find(a => a.id === parseInt(id))
      if (article) {
        this.form.title = article.title
        this.form.content = article.content
        this.form.tags = [...article.tags, '', ''].slice(0, 3)
        // 画像は後で実装
        this.form.images = ['', '', '']
      }
    },
    handleImageUpload(event, index) {
      const file = event.target.files[0]
      if (!file) return

      // 画像プレビュー
      const reader = new FileReader()
      reader.onload = (e) => {
        this.form.images[index] = e.target.result
        this.form.images = [...this.form.images] // リアクティブ更新
      }
      reader.readAsDataURL(file)
    },
    removeImage(index) {
      this.form.images[index] = ''
      this.form.images = [...this.form.images]
    },
    removeTag(index) {
      this.form.tags[index] = ''
    },
    handleSubmit() {
      this.showConfirmModal = true
    },
    async confirmSave() {
      this.saving = true
      this.showConfirmModal = false

      try {
        // TODO: 本番環境ではAPIに送信
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 登録・更新成功
        alert(this.isEditMode ? 'コラムを更新しました' : 'コラムを登録しました')
        this.$router.push('/admin/articles')
      } catch (error) {
        console.error('保存エラー:', error)
        alert('保存に失敗しました')
      } finally {
        this.saving = false
      }
    },
    goBack() {
      if (confirm('編集内容が破棄されますが、よろしいですか？')) {
        this.$router.push('/admin/articles')
      }
    },
    truncateText(text, length) {
      if (text.length <= length) return text
      return text.substring(0, length) + '...'
    }
  }
}
</script>

<style scoped>
.article-form-page {
  max-width: 900px;
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
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  color: var(--text-primary);
}

.form-container {
  background-color: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 28px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-label.required::after {
  content: '*';
  color: var(--danger-color);
  margin-left: 4px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  line-height: 1.6;
}

.form-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
}

/* 画像アップロード */
.image-upload-area {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.image-preview {
  position: relative;
  aspect-ratio: 16 / 9;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-preview:hover {
  border-color: var(--primary-color);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: 14px;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-image-btn:hover {
  background-color: #dc2626;
}

/* タグ入力 */
.tags-input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tag-input-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.tag-input-row .form-input {
  flex: 1;
}

.remove-tag-btn {
  padding: 8px 16px;
  background-color: var(--danger-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-tag-btn:hover {
  background-color: #dc2626;
}

/* フォームアクション */
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.modal-body {
  margin-bottom: 24px;
}

.modal-message {
  font-size: 16px;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.confirm-details {
  background-color: var(--bg-light);
  border-radius: 8px;
  padding: 16px;
}

.detail-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 80px;
}

.detail-value {
  color: var(--text-secondary);
  flex: 1;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .article-form-page {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .form-container {
    padding: 24px 16px;
  }

  .image-upload-area {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
