<template>
  <div class="warehouse-management-container">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><OfficeBuilding /></el-icon>
            仓库管理
          </span>
          <div class="header-actions">
            <el-button type="primary" @click="showAddDialog">
              <el-icon><Plus /></el-icon>
              新增仓库
            </el-button>
          </div>
        </div>
      </template>

      <el-alert
        title="仓库管理说明"
        type="info"
        description="管理系统中的仓库信息，包括仓库名称、仓库代码和供货商代码，三个字段均为必填。"
        show-icon
        class="warehouse-alert"
      />
    </el-card>

    <el-card class="table-card">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchForm.name"
              placeholder="按仓库名称搜索"
              clearable
              @input="handleSearch">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-input
              v-model="searchForm.code"
              placeholder="按仓库代码搜索"
              clearable
              @input="handleSearch">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-input
              v-model="searchForm.supplierCode"
              placeholder="按供货商代码搜索"
              clearable
              @input="handleSearch">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-button @click="resetSearch">重置</el-button>
          </el-col>
        </el-row>
      </div>

      <el-table 
        :data="filteredWarehouses" 
        v-loading="loading"
        stripe
        style="width: 100%">
        <el-table-column prop="name" label="仓库名称" min-width="200" />
        <el-table-column prop="code" label="仓库代码" width="150" />
        <el-table-column prop="supplierCode" label="供货商代码" min-width="150" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="showEditDialog(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="deleteWarehouse(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑仓库对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? '新增仓库' : '编辑仓库'"
      width="600px"
      :close-on-click-modal="false">
      <el-form
        ref="warehouseFormRef"
        :model="warehouseForm"
        :rules="warehouseRules"
        label-width="120px">
        <el-form-item label="仓库名称" prop="name">
          <el-input v-model="warehouseForm.name" placeholder="请输入仓库名称" />
        </el-form-item>
        <el-form-item label="仓库代码" prop="code">
          <el-input v-model="warehouseForm.code" placeholder="请输入仓库代码" />
        </el-form-item>
        <el-form-item label="供货商代码" prop="supplierCode">
          <el-input v-model="warehouseForm.supplierCode" placeholder="请输入供货商代码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitWarehouse" :loading="submitting">
            {{ dialogMode === 'add' ? '新增' : '更新' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { OfficeBuilding, Plus, Search } from '@element-plus/icons-vue'
import axios from 'axios'

const warehouses = ref([])
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('add') // 'add' or 'edit'
const warehouseFormRef = ref()

// 搜索相关
const searchForm = reactive({
  name: '',
  code: '',
  supplierCode: ''
})

const warehouseForm = reactive({
  id: null,
  name: '',
  code: '',
  supplierCode: ''
})

const warehouseRules = {
  name: [
    { required: true, message: '请输入仓库名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入仓库代码', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  supplierCode: [
    { required: true, message: '请输入供货商代码', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 过滤仓库列表
const filteredWarehouses = computed(() => {
  if (!searchForm.name && !searchForm.code && !searchForm.supplierCode) {
    return warehouses.value
  }
  
  return warehouses.value.filter(warehouse => {
    const nameMatch = !searchForm.name || warehouse.name?.toLowerCase().includes(searchForm.name.toLowerCase())
    const codeMatch = !searchForm.code || warehouse.code?.toLowerCase().includes(searchForm.code.toLowerCase())
    const supplierCodeMatch = !searchForm.supplierCode || warehouse.supplierCode?.toLowerCase().includes(searchForm.supplierCode.toLowerCase())
    
    return nameMatch && codeMatch && supplierCodeMatch
  })
})

const fetchWarehouses = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/warehouses')
    if (response.data.success) {
      warehouses.value = response.data.data
    }
  } catch (error) {
    ElMessage.error('获取仓库列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const showAddDialog = () => {
  dialogMode.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const showEditDialog = (warehouse) => {
  dialogMode.value = 'edit'
  warehouseForm.id = warehouse.id
  warehouseForm.name = warehouse.name
  warehouseForm.code = warehouse.code
  warehouseForm.supplierCode = warehouse.supplierCode || ''
  dialogVisible.value = true
}

const resetForm = () => {
  warehouseForm.id = null
  warehouseForm.name = ''
  warehouseForm.code = ''
  warehouseForm.supplierCode = ''
  if (warehouseFormRef.value) {
    warehouseFormRef.value.clearValidate()
  }
}

const submitWarehouse = async () => {
  try {
    await warehouseFormRef.value.validate()
    submitting.value = true
    
    const data = {
      name: warehouseForm.name,
      code: warehouseForm.code,
      supplierCode: warehouseForm.supplierCode
    }
    
    let response
    if (dialogMode.value === 'add') {
      response = await axios.post('/api/warehouses', data)
    } else {
      response = await axios.put(`/api/warehouses/${warehouseForm.id}`, data)
    }
    
    if (response.data.success) {
      ElMessage.success(dialogMode.value === 'add' ? '仓库创建成功' : '仓库更新成功')
      dialogVisible.value = false
      await fetchWarehouses()
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('已存在')) {
      ElMessage.error('仓库名称或代码已存在')
    } else {
      ElMessage.error(dialogMode.value === 'add' ? '创建失败' : '更新失败')
    }
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const deleteWarehouse = async (warehouse) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除仓库 "${warehouse.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await axios.delete(`/api/warehouses/${warehouse.id}`)
    
    if (response.data.success) {
      ElMessage.success('仓库删除成功')
      await fetchWarehouses()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 搜索处理
const handleSearch = () => {
  // 搜索是实时的，通过computed自动过滤
}

const resetSearch = () => {
  searchForm.name = ''
  searchForm.code = ''
  searchForm.supplierCode = ''
}

onMounted(() => {
  fetchWarehouses()
})
</script>

<style scoped>
.warehouse-management-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.warehouse-alert {
  margin-bottom: 20px;
}

.table-card {
  margin-top: 20px;
}

.search-area {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}


:deep(.el-table .el-table__row:hover) {
  background-color: #f5f7fa;
}

@media (max-width: 768px) {
  .warehouse-management-container {
    padding: 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .header-actions {
    justify-content: flex-end;
  }
}
</style>