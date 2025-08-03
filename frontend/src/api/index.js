import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

export const getProducts = (params) => {
  return api.get('/products', { params })
}

export const getProduct = (id) => {
  return api.get(`/products/${id}`)
}

export const createProduct = (data) => {
  return api.post('/products', data)
}

export const updateProduct = (id, data) => {
  return api.put(`/products/${id}`, data)
}

export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`)
}

export const importProducts = (data) => {
  return api.post('/products/import', data)
}

export const exportProducts = (status) => {
  return api.get('/products/export', {
    params: { status },
    responseType: 'blob'
  })
}

export const getUpdateRecords = (productId) => {
  return api.get(`/products/${productId}/records`)
}

export const getAllUpdateRecords = (params) => {
  return api.get('/records', { params })
}

// Warehouse API
export const getWarehouses = () => {
  return api.get('/warehouses')
}

export const getWarehouseByName = (name) => {
  return api.get(`/warehouses/by-name/${encodeURIComponent(name)}`)
}

export const createWarehouse = (data) => {
  return api.post('/warehouses', data)
}

export const updateWarehouse = (id, data) => {
  return api.put(`/warehouses/${id}`, data)
}

export const deleteWarehouse = (id) => {
  return api.delete(`/warehouses/${id}`)
}