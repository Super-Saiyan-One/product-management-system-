import { createRouter, createWebHistory } from 'vue-router'
import ProductList from '../views/ProductList.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/products'
    },
    {
      path: '/products',
      name: 'ProductList',
      component: ProductList
    },
    {
      path: '/products/:id/edit',
      name: 'ProductEdit',
      component: () => import('../views/ProductEdit.vue')
    },
    {
      path: '/warehouses',
      name: 'WarehouseManagement',
      component: () => import('../views/WarehouseManagement.vue'),
      meta: {
        title: '仓库管理'
      }
    },
    {
      path: '/records/all',
      name: 'AllUpdateHistory',
      component: () => import('../views/AllUpdateHistory.vue')
    },
    {
      path: '/history',
      redirect: '/records/all'
    }
  ]
})

export default router