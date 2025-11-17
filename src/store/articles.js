import { defineStore } from 'pinia'
import { articles as initialArticles } from '@/data/articles'

export const useArticlesStore = defineStore('articles', {
  state: () => ({
    articles: [...initialArticles]
  }),

  getters: {
    getAllArticles: (state) => state.articles,

    getArticleById: (state) => (id) => {
      return state.articles.find(article => article.id === parseInt(id))
    },

    searchArticles: (state) => (query, category, tag, status) => {
      let results = [...state.articles]

      // カテゴリフィルター
      if (category) {
        results = results.filter(article => article.category === category)
      }

      // タグフィルター
      if (tag) {
        results = results.filter(article =>
          article.tags && article.tags.includes(tag)
        )
      }

      // ステータスフィルター
      if (status) {
        results = results.filter(article => article.status === status)
      }

      // キーワード検索
      if (query && query.trim()) {
        const lowerQuery = query.toLowerCase()
        results = results.filter(article =>
          article.title.toLowerCase().includes(lowerQuery) ||
          article.content.toLowerCase().includes(lowerQuery)
        )
      }

      return results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    }
  },

  actions: {
    addArticle(article) {
      const newId = Math.max(...this.articles.map(a => a.id), 0) + 1
      const newArticle = {
        ...article,
        id: newId,
        publishedAt: new Date().toISOString()
      }
      this.articles.push(newArticle)
      return newArticle
    },

    updateArticle(id, updatedData) {
      const index = this.articles.findIndex(article => article.id === parseInt(id))
      if (index !== -1) {
        this.articles[index] = {
          ...this.articles[index],
          ...updatedData
        }
        return this.articles[index]
      }
      return null
    },

    deleteArticle(id) {
      const index = this.articles.findIndex(article => article.id === parseInt(id))
      if (index !== -1) {
        this.articles.splice(index, 1)
        return true
      }
      return false
    },

    bulkDeleteArticles(ids) {
      const idsToDelete = ids.map(id => parseInt(id))
      this.articles = this.articles.filter(article => !idsToDelete.includes(article.id))
      return true
    },

    bulkUpdateStatus(ids, status) {
      const idsToUpdate = ids.map(id => parseInt(id))
      this.articles.forEach(article => {
        if (idsToUpdate.includes(article.id)) {
          article.status = status
        }
      })
      return true
    }
  }
})
