<template>
  <div class="article-detail">
    <div v-if="loading" class="loading">
      <p>読み込み中...</p>
    </div>

    <div v-else-if="!article" class="not-found">
      <h2>記事が見つかりません</h2>
      <p>指定された記事は存在しないか、削除された可能性があります。</p>
      <button class="btn btn-primary" @click="goBack">
        トップに戻る
      </button>
    </div>

    <article v-else class="article-content">
      <!-- パンくずリスト -->
      <nav class="breadcrumb">
        <router-link to="/top">トップ</router-link>
        <span class="separator">›</span>
        <span class="current">{{ article.category }}</span>
      </nav>

      <!-- 記事ヘッダー -->
      <header class="article-header">
        <div class="article-meta">
          <span class="article-category">{{ article.category }}</span>
          <span class="article-date">{{ formattedDate }}</span>
        </div>
        <h1 class="article-title">{{ article.title }}</h1>
      </header>

      <!-- 記事画像 -->
      <div v-if="article.images && article.images.length > 0" class="article-images">
        <div
          v-for="(image, index) in article.images"
          :key="index"
          class="image-wrapper"
        >
          <img :src="image" :alt="`${article.title} - 画像${index + 1}`" />
        </div>
      </div>

      <!-- 記事本文 -->
      <div class="article-body">
        <p v-for="(paragraph, index) in paragraphs" :key="index" class="paragraph">
          {{ paragraph }}
        </p>
      </div>

      <!-- 記事フッター -->
      <footer class="article-footer">
        <button class="btn btn-secondary" @click="goBack">
          ← 一覧に戻る
        </button>

        <div class="share-buttons">
          <span class="share-label">シェア:</span>
          <button class="share-btn facebook" @click="shareToFacebook" title="Facebookでシェア">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button class="share-btn twitter" @click="shareToTwitter" title="Xでシェア">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>
          <button class="share-btn instagram" @click="copyUrlForInstagram" title="URLをコピー">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </button>
        </div>
      </footer>

      <!-- 関連記事（オプション） -->
      <section class="related-articles">
        <h2 class="section-title">関連記事</h2>
        <p class="coming-soon">関連記事機能は近日公開予定です</p>
      </section>
    </article>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'ArticleDetail',
  data() {
    return {
      article: null,
      loading: true
    }
  },
  computed: {
    formattedDate() {
      if (!this.article) return ''
      const date = new Date(this.article.publishedAt)
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    paragraphs() {
      if (!this.article) return []
      // 本文を段落ごとに分割
      return this.article.content.split('\n\n').filter(p => p.trim())
    }
  },
  mounted() {
    this.loadArticle()
    // ページトップにスクロール
    window.scrollTo(0, 0)
  },
  methods: {
    async loadArticle() {
      try {
        this.loading = true
        const articleId = this.$route.params.id
        this.article = await api.getArticleById(articleId)
      } catch (error) {
        console.error('記事の取得に失敗しました:', error)
        this.article = null
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.push('/top')
    },
    shareToFacebook() {
      const url = encodeURIComponent(window.location.href)
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400')
    },
    shareToTwitter() {
      const url = encodeURIComponent(window.location.href)
      const text = encodeURIComponent(this.article.title)
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400')
    },
    copyUrlForInstagram() {
      // Instagramはウェブからの直接シェアができないため、URLをコピー
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('URLをクリップボードにコピーしました\nInstagramアプリで投稿してください')
        })
        .catch(err => {
          console.error('コピーに失敗しました', err)
          alert('URLのコピーに失敗しました')
        })
    }
  },
  watch: {
    '$route.params.id': 'loadArticle'
  }
}
</script>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

.loading,
.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found h2 {
  font-size: 28px;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.not-found p {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

/* パンくずリスト */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  padding-top: 20px;
}

.breadcrumb a {
  color: var(--primary-color);
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.breadcrumb a:hover {
  opacity: 0.7;
}

.breadcrumb .separator {
  color: var(--text-secondary);
}

.breadcrumb .current {
  color: var(--text-primary);
}

/* 記事ヘッダー */
.article-header {
  margin-bottom: 32px;
}

.article-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.article-category {
  display: inline-block;
  padding: 6px 16px;
  background-color: var(--primary-color);
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 20px;
}

.article-date {
  font-size: 14px;
  color: var(--text-secondary);
}

.article-title {
  font-size: 36px;
  font-weight: bold;
  line-height: 1.4;
  color: var(--text-primary);
}

/* 記事画像 */
.article-images {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.image-wrapper {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-wrapper img {
  width: 100%;
  height: auto;
  display: block;
}

/* 記事本文 */
.article-body {
  font-size: 18px;
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 48px;
}

.paragraph {
  margin-bottom: 24px;
}

/* 記事フッター */
.article-footer {
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 32px 0;
  border-top: 2px solid var(--border-color);
  border-bottom: 2px solid var(--border-color);
  margin-bottom: 48px;
}

/* シェアボタン */
.share-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.share-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.share-btn.facebook {
  background-color: #1877f2;
  color: white;
}

.share-btn.facebook:hover {
  background-color: #0d65d9;
}

.share-btn.twitter {
  background-color: #000000;
  color: white;
}

.share-btn.twitter:hover {
  background-color: #1a1a1a;
}

.share-btn.instagram {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  color: white;
}

.share-btn.instagram:hover {
  background: linear-gradient(45deg, #d67d2b 0%, #c95a34 25%, #b9213a 50%, #aa1f5a 75%, #9b1478 100%);
}

/* 関連記事 */
.related-articles {
  padding-top: 32px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
  color: var(--text-primary);
}

.coming-soon {
  text-align: center;
  color: var(--text-secondary);
  font-size: 16px;
  padding: 40px 20px;
}

@media (max-width: 768px) {
  .article-detail {
    padding: 0 16px 40px;
  }

  .breadcrumb {
    padding-top: 16px;
    font-size: 12px;
  }

  .article-title {
    font-size: 24px;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .article-body {
    font-size: 16px;
  }

  .article-footer {
    flex-direction: column;
    gap: 16px;
  }

  .article-footer .btn {
    width: 100%;
  }

  .share-buttons {
    width: 100%;
    justify-content: center;
  }

  .share-label {
    font-size: 14px;
  }

  .share-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
