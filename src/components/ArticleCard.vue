<template>
  <div class="article-card" @click="goToDetail">
    <div v-if="article.images && article.images.length > 0" class="article-image">
      <img :src="article.images[0]" :alt="article.title" />
      <span class="article-category-badge">{{ article.category }}</span>
    </div>

    <div class="article-content">
      <h3 class="article-title">{{ article.title }}</h3>
      <p class="article-excerpt">{{ excerpt }}</p>

      <div class="article-footer">
        <span class="article-date">{{ formattedDate }}</span>
        <span class="read-more">続きを読む →</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArticleCard',
  props: {
    article: {
      type: Object,
      required: true
    }
  },
  computed: {
    excerpt() {
      // 本文の最初の15文字を抽出し、それ以降は三点リーダで省略
      const maxLength = 15
      if (this.article.content.length <= maxLength) {
        return this.article.content
      }
      return this.article.content.substring(0, maxLength) + '...'
    },
    formattedDate() {
      const date = new Date(this.article.publishedAt)
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  },
  methods: {
    goToDetail() {
      this.$router.push(`/article/${this.article.id}`)
    }
  }
}
</script>

<style scoped>
.article-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.article-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-card:hover .article-image img {
  transform: scale(1.05);
}

.article-category-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  background-color: rgba(59, 130, 246, 0.9);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

.article-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-excerpt {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
  flex: 1;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.article-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.read-more {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 600;
}

@media (max-width: 768px) {
  .article-image {
    height: 160px;
  }

  .article-title {
    font-size: 16px;
  }

  .article-content {
    padding: 16px;
  }
}
</style>
