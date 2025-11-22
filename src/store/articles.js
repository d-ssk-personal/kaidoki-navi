import { defineStore } from 'pinia'
import api from '@/services/api'

export const useArticlesStore = defineStore('articles', {
  state: () => ({
    articles: [],
    currentArticle: null,
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      limit: 20
    }
  }),

  getters: {
    getAllArticles: (state) => state.articles,
    getArticleById: (state) => (id) => {
      return state.articles.find(article => article.id === parseInt(id))
    }
  },

  actions: {
    async fetchArticles(params = {}) {
      try {
        const response = await api.admin.getArticles(params)
        this.articles = response.items
        this.pagination = response.pagination
        return response
      } catch (error) {
        console.error('記事の取得に失敗しました:', error)
        throw error
      }
    },

    async fetchArticleById(id) {
      try {
        const article = await api.admin.getArticleById(id)
        this.currentArticle = article
        return article
      } catch (error) {
        console.error('記事詳細の取得に失敗しました:', error)
        throw error
      }
    },

    async addArticle(article) {
      try {
        const newArticle = await api.admin.createArticle(article)
        this.articles.unshift(newArticle)
        return newArticle
      } catch (error) {
        console.error('記事の追加に失敗しました:', error)
        throw error
      }
    },

    async updateArticle(id, updatedData) {
      try {
        const updated = await api.admin.updateArticle(id, updatedData)
        const index = this.articles.findIndex(article => article.id === parseInt(id))
        if (index !== -1) {
          this.articles[index] = updated
        }
        return updated
      } catch (error) {
        console.error('記事の更新に失敗しました:', error)
        throw error
      }
    },

    async deleteArticle(id) {
      try {
        await api.admin.deleteArticle(id)
        const index = this.articles.findIndex(article => article.id === parseInt(id))
        if (index !== -1) {
          this.articles.splice(index, 1)
        }
        return true
      } catch (error) {
        console.error('記事の削除に失敗しました:', error)
        throw error
      }
    },

    async bulkDeleteArticles(ids) {
      try {
        await api.admin.bulkDeleteArticles(ids)
        const idsToDelete = ids.map(id => parseInt(id))
        this.articles = this.articles.filter(article => !idsToDelete.includes(article.id))
        return true
      } catch (error) {
        console.error('記事の一括削除に失敗しました:', error)
        throw error
      }
    },

    async bulkUpdateStatus(ids, status) {
      try {
        await api.admin.bulkUpdateArticleStatus(ids, status)
        const idsToUpdate = ids.map(id => parseInt(id))
        this.articles.forEach(article => {
          if (idsToUpdate.includes(article.id)) {
            article.status = status
          }
        })
        return true
      } catch (error) {
        console.error('記事のステータス一括更新に失敗しました:', error)
        throw error
      }
    }
  }
})
