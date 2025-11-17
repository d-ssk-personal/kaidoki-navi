import { createRouter, createWebHistory } from 'vue-router'
import TopPage from '@/views/TopPage.vue'
import ItemDetail from '@/views/ItemDetail.vue'
import ArticleDetail from '@/views/ArticleDetail.vue'
import Settings from '@/views/Settings.vue'
import Legal from '@/views/Legal.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router