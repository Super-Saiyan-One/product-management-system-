<template>
  <div class="product-container">
    <el-card class="search-card">
      <el-form :model="searchForm" @submit.prevent="handleSearch" inline>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.createdDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="产品状态/备注">
          <el-input v-model="searchForm.statusNote" clearable />
        </el-form-item>
        <el-form-item label="销售状态">
          <el-select v-model="searchForm.status" clearable style="width: 200px">
            <el-option label="可销售" value="saleable" />
            <el-option label="不可销售" value="non-saleable" />
            <el-option label="可销售（后续需下架）" value="saleable-pending-removal" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" clearable />
        </el-form-item>
        <el-form-item label="品牌">
          <el-input v-model="searchForm.brand" clearable />
        </el-form-item>
        <el-form-item label="条形码">
          <el-input v-model="searchForm.barcode" clearable />
        </el-form-item>
        <el-form-item label="发货代码">
          <el-input v-model="searchForm.shippingCode" clearable />
        </el-form-item>
        <el-form-item label="对应供货商代码">
          <el-input v-model="searchForm.supplierCode" clearable />
        </el-form-item>
        <el-form-item label="对应发货仓库名称">
          <el-input v-model="searchForm.warehouseName" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="productStore.loading">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="action-card">
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        新增产品
      </el-button>
      <el-button type="success" @click="showImportDialog">
        <el-icon><Upload /></el-icon>
        导入Excel
      </el-button>
      <el-button type="warning" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出Excel
      </el-button>
      <el-button 
        type="danger" 
        @click="batchDelete"
        :disabled="selectedProducts.length === 0">
        <el-icon><Delete /></el-icon>
        批量删除 ({{ selectedProducts.length }})
      </el-button>
    </el-card>

    <el-card class="table-card">
      <el-table 
        :data="productStore.products" 
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        v-loading="productStore.loading"
        row-key="id">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="createdAt" label="创建时间" width="160" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="statusNote" label="产品状态/备注" width="140" show-overflow-tooltip />
        <el-table-column prop="status" label="销售状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hasQualityCert" label="质检证书" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.hasQualityCert ? 'success' : 'danger'" size="small">
              {{ row.hasQualityCert ? '✓' : '✗' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="brand" label="品牌" width="100" show-overflow-tooltip />
        <el-table-column prop="barcode" label="条形码" width="140" show-overflow-tooltip />
        <el-table-column prop="shippingCode" label="发货代码" width="110" show-overflow-tooltip />
        <el-table-column prop="description" label="商品介绍" min-width="200" show-overflow-tooltip />
        <el-table-column prop="highlights" label="产品亮点" min-width="200" show-overflow-tooltip />
        <el-table-column prop="marketPrice" label="市场价" width="90" align="right">
          <template #default="{ row }">
            <span v-if="row.marketPrice">¥{{ row.marketPrice }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="salePrice" label="销售价" width="90" align="right">
          <template #default="{ row }">
            <span v-if="row.salePrice">¥{{ row.salePrice }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="purchasePrice" label="采购价" width="90" align="right">
          <template #default="{ row }">
            <span v-if="row.purchasePrice">¥{{ row.purchasePrice }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="minPurchasePrice" label="最低采购价" width="100" align="right">
          <template #default="{ row }">
            <span v-if="row.minPurchasePrice">¥{{ row.minPurchasePrice }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="shippingFee" label="运费" width="80" align="right">
          <template #default="{ row }">
            <span v-if="row.shippingFee">¥{{ row.shippingFee }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="warehouseCode" label="仓库代码" width="100" show-overflow-tooltip />
        <el-table-column prop="supplierCode" label="供货商代码" width="110" show-overflow-tooltip />
        <el-table-column prop="warehouseName" label="发货仓库" width="120" show-overflow-tooltip />
        <el-table-column prop="oldShippingCode1" label="老发货代码1" width="120" show-overflow-tooltip />
        <el-table-column prop="oldShippingCode2" label="老发货代码2" width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="260" fixed="right" align="center" class-name="operation-column">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="editProduct(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button size="small" type="info" @click="viewHistory(row)">
                <el-icon><Clock /></el-icon>
                历史
              </el-button>
              <el-button size="small" type="danger" @click="deleteProduct(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="productStore.total"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination" />
    </el-card>

    <ProductForm 
      ref="productFormRef"
      @saved="handleProductSaved" />
    
    <ExcelUpload 
      ref="excelUploadRef"
      @imported="handleImported" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Clock, Search, Refresh, Plus, Upload, Download } from '@element-plus/icons-vue'
import ProductForm from '@/components/ProductForm.vue'
import ExcelUpload from '@/components/ExcelUpload.vue'

const router = useRouter()
const productStore = useProductStore()
const productFormRef = ref()
const excelUploadRef = ref()

const selectedProducts = ref([])

const searchForm = reactive({
  createdDateRange: null,
  statusNote: '',
  status: '',
  name: '',
  brand: '',
  barcode: '',
  shippingCode: '',
  supplierCode: '',
  warehouseName: ''
})

const currentPage = ref(1)
const pageSize = ref(20)
const sortBy = ref(null)
const sortOrder = ref(null)

const fetchProducts = async () => {
  const params = {
    ...searchForm,
    page: currentPage.value,
    size: pageSize.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value
  }
  
  // 处理创建时间范围参数
  if (searchForm.createdDateRange && searchForm.createdDateRange.length === 2) {
    params.createdStartDate = searchForm.createdDateRange[0]
    params.createdEndDate = searchForm.createdDateRange[1]
    delete params.createdDateRange
  }
  
  await productStore.fetchProducts(params)
}

const handleSearch = () => {
  currentPage.value = 1
  fetchProducts()
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    if (key === 'createdDateRange' || key === 'dateRange' || key === 'updateDateRange') {
      searchForm[key] = null
    } else {
      searchForm[key] = ''
    }
  })
  handleSearch()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchProducts()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchProducts()
}

const handleSortChange = ({ prop, order }) => {
  sortBy.value = prop
  sortOrder.value = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : null
  currentPage.value = 1
  fetchProducts()
}

const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

const showAddDialog = () => {
  productFormRef.value?.show()
}

const editProduct = (product) => {
  productFormRef.value?.show(product)
}

const deleteProduct = async (product) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除产品"${product.name}"吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    console.log('开始删除产品，ID:', product.id)
    await productStore.deleteProduct(product.id)
    ElMessage.success('删除成功')
    fetchProducts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败详细错误:', error)
      const errorMessage = error.response?.data?.message || error.message || '删除失败'
      ElMessage.error(`删除失败: ${errorMessage}`)
    }
  }
}

const batchDelete = async () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请选择要删除的产品')
    return
  }

  try {
    const deleteCount = selectedProducts.value.length
    
    await ElMessageBox.confirm(
      `确定要删除选中的 ${deleteCount} 个产品吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    let successCount = 0
    let errorCount = 0
    
    for (const product of selectedProducts.value) {
      try {
        await productStore.deleteProduct(product.id)
        successCount++
      } catch (error) {
        console.error(`删除产品 ${product.name} 失败:`, error)
        errorCount++
      }
    }
    
    ElMessage.success(`成功删除 ${successCount} 个产品${errorCount > 0 ? `，${errorCount}个删除失败` : ''}`)
    selectedProducts.value = []
    fetchProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const viewHistory = (product) => {
  router.push(`/records/all?productId=${product.id}`)
}

const showImportDialog = () => {
  excelUploadRef.value?.show()
}

const handleExport = async () => {
  try {
    await productStore.exportProducts()
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const handleProductSaved = () => {
  fetchProducts()
}

const handleImported = (result) => {
  ElMessage.success(`导入完成：成功 ${result.successCount} 个，失败 ${result.failureCount} 个`)
  fetchProducts()
}

const getStatusType = (status) => {
  const types = {
    'saleable': 'success',
    'non-saleable': 'danger', 
    'saleable-pending-removal': 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'saleable': '可销售',
    'non-saleable': '不可销售',
    'saleable-pending-removal': '可销售（后续需下架）'
  }
  return texts[status] || '未知'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.product-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
  background: transparent;
}

.search-card, .action-card, .table-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
  overflow: hidden;
}

.search-card .el-card__body,
.action-card .el-card__body,
.table-card .el-card__body {
  padding: 20px;
}

.search-card {
  background: #fff;
}

.action-card {
  background: #fff;
}

.action-card .el-button {
  margin-right: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-card .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pagination {
  margin-top: 20px;
  justify-content: center;
}

.el-form--inline .el-form-item {
  margin-bottom: 10px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.action-buttons .el-button {
  margin: 0 2px;
  min-width: 60px;
  padding: 6px 12px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-buttons .el-button--primary {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

.action-buttons .el-button--info {
  background: #909399;
  border-color: #909399;
  color: #fff;
}

.action-buttons .el-button--danger {
  background: #f56c6c;
  border-color: #f56c6c;
  color: #fff;
}

.action-buttons .el-button .el-icon {
  margin-right: 4px;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table .el-table__header-wrapper) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  z-index: 3;
}

:deep(.el-table .el-table__header th) {
  background: transparent;
  color: #495057;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  z-index: 3;
}

/* 操作列正常样式 - 白色不透明背景 */
:deep(.el-table .operation-column) {
  background-color: #fff !important;
}

/* 固定列样式 - 白色不透明背景 */
:deep(.el-table .el-table__fixed-right) {
  background-color: #fff !important;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08) !important;
  z-index: 100 !important;
  position: relative !important;
}

:deep(.el-table .el-table__fixed-right::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff !important;
  z-index: -1;
}

:deep(.el-table .el-table__fixed-right .el-table__header-wrapper) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
  z-index: 101 !important;
  position: relative !important;
}

:deep(.el-table .el-table__fixed-right .el-table__header th) {
  background: transparent !important;
  z-index: 101 !important;
  position: relative !important;
}

:deep(.el-table .el-table__fixed-right .el-table__body-wrapper) {
  background: #fff !important;
  z-index: 100 !important;
  position: relative !important;
}

:deep(.el-table .el-table__fixed-right .el-table__body td) {
  background: #fff !important;
  position: relative !important;
  z-index: 100 !important;
}

/* 强制覆盖所有可能的透明样式 */
:deep(.el-table .el-table__fixed-right *) {
  background-color: inherit !important;
}

:deep(.el-table .el-table__row:hover > td) {
  background-color: #f8f9fa;
}

:deep(.el-table .el-table__fixed-right .el-table__row:hover > td) {
  background-color: #f8f9fa !important;
}

/* 额外的强制样式确保完全不透明 */
:deep(.el-table .el-table__fixed-right .el-table__body) {
  background: #fff !important;
}

:deep(.el-table .el-table__fixed-right .el-table__body tr) {
  background: #fff !important;
}

:deep(.el-table .el-table__fixed-right .el-table__body tr td) {
  background: #fff !important;
  opacity: 1 !important;
}

/* 使用伪元素创建白色遮罩层 */
:deep(.el-table .el-table__fixed-right .el-table__body-wrapper::after) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  pointer-events: none;
  z-index: -1;
}

:deep(.el-table .el-table__row td) {
  border-bottom: 1px solid #f1f3f4;
  transition: all 0.3s ease;
}

/* 标签样式优化 */
:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
  border: none;
}

/* 分页样式优化 */
:deep(.el-pagination) {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 6px;
  margin: 0 2px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .product-container {
    padding: 0 10px;
  }
  
  .search-card .el-form--inline .el-form-item {
    margin-bottom: 15px;
  }
}

@media (max-width: 768px) {
  .product-container {
    padding: 0 5px;
  }
  
  .action-card .el-button {
    margin-right: 8px;
    margin-bottom: 12px;
    width: calc(50% - 4px);
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .action-buttons .el-button {
    min-width: auto;
    width: 100%;
  }
}
</style>