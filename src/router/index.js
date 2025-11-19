import { createRouter, createWebHistory } from 'vue-router'
import TopPage from '@/views/TopPage.vue'
import ProductList from '@/views/ProductList.vue'
import StoreList from '@/views/StoreList.vue'
import ItemDetail from '@/views/ItemDetail.vue'
import ArticleDetail from '@/views/ArticleDetail.vue'
import Legal from '@/views/Legal.vue'
import Login from '@/views/Login.vue'
import MyPage from '@/views/MyPage.vue'
import ForBusiness from '@/views/ForBusiness.vue'
import AdminLogin from '@/views/admin/AdminLogin.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import AdminArticleList from '@/views/admin/ArticleList.vue'
import ArticleForm from '@/views/admin/ArticleForm.vue'
import StoreManagement from '@/views/admin/StoreManagement.vue'
import StoreForm from '@/views/admin/StoreForm.vue'
import CompanyManagement from '@/views/admin/CompanyManagement.vue'
import CompanyForm from '@/views/admin/CompanyForm.vue'
import FlyerManagement from '@/views/admin/FlyerManagement.vue'
import FlyerForm from '@/views/admin/FlyerForm.vue'
import AccountManagement from '@/views/admin/AccountManagement.vue'

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
    path: '/products',
    name: 'ProductList',
    component: ProductList
  },
  {
    path: '/stores',
    name: 'StoreList',
    component: StoreList
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
    path: '/legal',
    name: 'Legal',
    component: Legal
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/mypage',
    name: 'MyPage',
    component: MyPage
  },
  {
    path: '/for-business',
    name: 'ForBusiness',
    component: ForBusiness
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
  },
  {
    path: '/admin/stores',
    name: 'AdminStoreManagement',
    component: StoreManagement
  },
  {
    path: '/admin/stores/new',
    name: 'AdminStoreNew',
    component: StoreForm
  },
  {
    path: '/admin/stores/edit/:id',
    name: 'AdminStoreEdit',
    component: StoreForm
  },
  {
    path: '/admin/companies',
    name: 'AdminCompanyManagement',
    component: CompanyManagement
  },
  {
    path: '/admin/companies/new',
    name: 'AdminCompanyNew',
    component: CompanyForm
  },
  {
    path: '/admin/companies/edit/:id',
    name: 'AdminCompanyEdit',
    component: CompanyForm
  },
  {
    path: '/admin/flyers',
    name: 'AdminFlyerManagement',
    component: FlyerManagement
  },
  {
    path: '/admin/flyers/new',
    name: 'AdminFlyerNew',
    component: FlyerForm
  },
  {
    path: '/admin/flyers/edit/:id',
    name: 'AdminFlyerEdit',
    component: FlyerForm
  },
  {
    path: '/admin/accounts',
    name: 'AdminAccountManagement',
    component: AccountManagement
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router