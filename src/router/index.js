import { createRouter, createWebHistory } from 'vue-router'
import TopPage from '@/views/TopPage.vue'
import ItemDetail from '@/views/ItemDetail.vue'
import ArticleDetail from '@/views/ArticleDetail.vue'
import Settings from '@/views/Settings.vue'
import Legal from '@/views/Legal.vue'
import AdminLogin from '@/views/admin/Login.vue'
import AdminHome from '@/views/admin/AdminHome.vue'
import ArticleList from '@/views/admin/ArticleList.vue'
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
  // 管理者画面
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin',
    name: 'AdminHome',
    component: AdminHome
  },
  {
    path: '/admin/articles',
    name: 'ArticleList',
    component: ArticleList
  },
  {
    path: '/admin/articles/:id',
    name: 'ArticleForm',
    component: ArticleForm
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router