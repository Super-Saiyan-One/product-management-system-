import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import * as api from '../api'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const loading = ref(false)
  const total = ref(0)
  
  const searchParams = reactive({
    name: '',
    status: '',
    barcode: '',
    brand: '',
    page: 1,
    size: 20
  })

  const fetchProducts = async (params = {}) => {
    loading.value = true
    try {
      const response = await api.getProducts({ ...searchParams, ...params })
      products.value = response.data.data
      total.value = response.data.total
      return response.data
    } catch (error) {
      console.error('获取产品列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const createProduct = async (productData) => {
    try {
      const response = await api.createProduct(productData)
      await fetchProducts()
      return response.data
    } catch (error) {
      console.error('创建产品失败:', error)
      throw error
    }
  }

  const updateProduct = async (id, productData) => {
    try {
      const response = await api.updateProduct(id, productData)
      await fetchProducts()
      return response.data
    } catch (error) {
      console.error('更新产品失败:', error)
      throw error
    }
  }

  const deleteProduct = async (id) => {
    try {
      await api.deleteProduct(id)
      await fetchProducts()
    } catch (error) {
      console.error('删除产品失败:', error)
      throw error
    }
  }

  const importProducts = async (products) => {
    try {
      const response = await api.importProducts(products)
      await fetchProducts()
      return response.data
    } catch (error) {
      console.error('导入产品失败:', error)
      throw error
    }
  }

  const exportProducts = async (status = '') => {
    try {
      const response = await api.exportProducts(status)
      
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `products_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出产品失败:', error)
      throw error
    }
  }

  return {
    products,
    loading,
    total,
    searchParams,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    importProducts,
    exportProducts
  }
})