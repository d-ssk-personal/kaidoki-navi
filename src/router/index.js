import { createRouter, createWebHistory } from 'vue-router'
import TopPage from '@/views/TopPage.vue'
import ItemDetail from '@/views/ItemDetail.vue'
import ArticleDetail from '@/views/ArticleDetail.vue'
import Settings from '@/views/Settings.vue'
import Legal from '@/views/Legal.vue'
import AdminLogin from '@/views/admin/AdminLogin.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import AdminArticleList from '@/views/admin/ArticleList.vue'
import ArticleForm from '@/views/admin/ArticleForm.vue'

const routes = [
  {
    path: '/',
    redirect: '/top'
  },
  {
    path: '/top',
    name: 'Top',
    component: TopPage
  },
  {
    path: '/item/:id',
    name: 'ItemDetail',
    component: ItemDetail
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/legal',
    name: 'Legal',
    component: Legal
  },
  // 管理画面
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard
  },
  {
    path: '/admin/articles',
    name: 'AdminArticleList',
    component: AdminArticleList
  },
  {
    path: '/admin/articles/new',
    name: 'AdminArticleNew',
    component: ArticleForm
  },
  {
    path: '/admin/articles/edit/:id',
    name: 'AdminArticleEdit',
    component: ArticleForm
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router