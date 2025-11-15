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
        <button class="btn btn-primary" @click="shareArticle">
          この記事をシェア
        </button>
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
import { getArticleById } from '@/data/articles'

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
  },
  methods: {
    loadArticle() {
      this.loading = true
      const articleId = this.$route.params.id

      // モックデータから記事を取得
      setTimeout(() => {
        this.article = getArticleById(articleId)
        this.loading = false
      }, 300) // ローディングをシミュレート
    },
    goBack() {
      this.$router.push('/top')
    },
    shareArticle() {
      // シェア機能（将来的にWeb Share APIを使用）
      if (navigator.share) {
        navigator.share({
          title: this.article.title,
          text: this.article.title,
          url: window.location.href
        }).catch(err => console.log('シェアがキャンセルされました', err))
      } else {
        // フォールバック: URLをクリップボードにコピー
        navigator.clipboard.writeText(window.location.href)
          .then(() => alert('URLをクリップボードにコピーしました'))
          .catch(err => console.error('コピーに失敗しました', err))
      }
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
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 32px 0;
  border-top: 2px solid var(--border-color);
  border-bottom: 2px solid var(--border-color);
  margin-bottom: 48px;
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
  }

  .article-footer .btn {
    width: 100%;
  }
}
</style>
