<template>
  <div class="all-update-history">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon><DocumentCopy /></el-icon>
            修改记录管理
          </h1>
          <p class="page-subtitle">查看和管理所有产品的修改历史记录</p>
        </div>
        <div class="stats-section">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-number">{{ pagination.total }}</div>
                <div class="stat-label">总记录数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card create">
                <div class="stat-number">{{ getActionCount('create') }}</div>
                <div class="stat-label">创建记录</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card update">
                <div class="stat-number">{{ getActionCount('update') }}</div>
                <div class="stat-label">更新记录</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="search-card" shadow="never">
      <el-form inline :model="searchForm" class="search-form">
        <el-form-item label="查看方式">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="table">表格视图</el-radio-button>
            <el-radio-button label="timeline">时间线视图</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select 
            v-model="searchForm.action" 
            placeholder="选择操作类型" 
            clearable 
            style="width: 140px">
            <el-option label="创建" value="create">
              <span style="color: #67c23a">🟢 创建</span>
            </el-option>
            <el-option label="更新" value="update">
              <span style="color: #e6a23c">🟡 更新</span>
            </el-option>
            <el-option label="删除" value="delete">
              <span style="color: #f56c6c">🔴 删除</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品ID">
          <el-input 
            v-model="searchForm.productId" 
            placeholder="输入产品ID" 
            style="width: 180px"
            clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchRecords" :loading="loading">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never" v-if="viewMode === 'table'">

      <el-table 
        :data="records" 
        v-loading="loading"
        style="width: 100%"
        row-key="id"
        stripe
        :header-cell-style="{ background: '#f8f9fa', color: '#495057' }">
        
        <el-table-column prop="id" label="记录ID" width="90" align="center">
          <template #default="scope">
            <el-tag size="small" type="info"># {{ scope.row.id }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="产品信息" width="250">
          <template #default="scope">
            <div class="product-info">
              <div class="product-name">
                <el-icon><Box /></el-icon>
                {{ scope.row.product?.name || '未知产品' }}
              </div>
              <div class="product-id">产品ID: {{ scope.row.productId }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作类型" width="120" align="center">
          <template #default="scope">
            <el-tag 
              :type="getActionType(scope.row.action)"
              :icon="getActionIcon(scope.row.action)"
              size="large">
              {{ getActionText(scope.row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作时间" width="200">
          <template #default="scope">
            <div class="time-info">
              <div class="date">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(scope.row.createdAt) }}
              </div>
              <div class="relative-time">{{ getRelativeTime(scope.row.createdAt) }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作者" width="130" align="center">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="24" style="background-color: #409eff;">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ scope.row.user?.username || '系统' }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="变更详情" min-width="400">
          <template #default="scope">
            <div v-if="scope.row.action === 'update' && scope.row.changes" class="changes-detail">
              <div v-for="(change, field) in getTopChanges(scope.row.changes)" :key="field" class="change-item">
                <el-tag size="small" class="field-tag">{{ getFieldLabel(field) }}</el-tag>
                <span class="change-arrow">
                  <span class="old-value">{{ change.old || '-' }}</span>
                  <el-icon><Right /></el-icon>
                  <span class="new-value">{{ change.new || '-' }}</span>
                </span>
              </div>
              <div v-if="getChangesCount(scope.row.changes) > 3" class="more-changes">
                还有 {{ getChangesCount(scope.row.changes) - 3 }} 项变更...
              </div>
            </div>
            
            <div v-else-if="scope.row.action === 'create'" class="action-detail">
              <el-tag type="success" size="default">
                <el-icon><Plus /></el-icon>
                新建产品
              </el-tag>
              <span class="action-desc">创建了新的产品记录</span>
            </div>
            
            <div v-else-if="scope.row.action === 'delete'" class="action-detail">
              <el-tag type="danger" size="default">
                <el-icon><Delete /></el-icon>
                删除产品
              </el-tag>
              <span class="action-desc">永久删除了产品记录</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link
              @click="viewDetails(scope.row)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background />
      </div>
    </el-card>

    <!-- 时间线视图 -->
    <el-card class="timeline-card" shadow="never" v-if="viewMode === 'timeline'">
      <el-timeline v-if="records.length > 0">
        <el-timeline-item 
          v-for="record in records" 
          :key="record.id"
          :timestamp="formatDate(record.createdAt)"
          placement="top"
          :color="getTimelineColor(record.action)">
          <el-card class="timeline-record" shadow="hover">
            <div class="record-header">
              <el-tag :type="getActionType(record.action)" size="large">
                <el-icon><component :is="getActionIcon(record.action)" /></el-icon>
                {{ getActionText(record.action) }}
              </el-tag>
              <div class="product-info">
                <div class="product-name">
                  <el-icon><Box /></el-icon>
                  {{ record.product?.name || '未知产品' }}
                </div>
                <div class="product-id">产品ID: {{ record.productId }}</div>
              </div>
            </div>
            
            <div v-if="record.action === 'update' && record.changes" class="changes">
              <h4>变更内容：</h4>
              <div v-for="(change, field) in getChangesObject(record.changes)" :key="field" class="change-item">
                <strong>{{ getFieldLabel(field) }}:</strong>
                <span class="old-value">{{ change.old || '-' }}</span>
                <el-icon class="arrow-icon"><Right /></el-icon>
                <span class="new-value">{{ change.new || '-' }}</span>
              </div>
            </div>
            
            <div v-else-if="record.action === 'create'" class="action-detail">
              <div class="action-summary">
                <el-icon><Plus /></el-icon>
                <span>创建了新的产品记录</span>
              </div>
            </div>
            
            <div v-else-if="record.action === 'delete'" class="action-detail">
              <div class="action-summary">
                <el-icon><Delete /></el-icon>
                <span>永久删除了产品记录</span>
              </div>
            </div>
            
            <div class="record-footer">
              <div class="user-info">
                <el-icon><User /></el-icon>
                <span>{{ record.user?.username || '系统' }}</span>
              </div>
              <div class="relative-time">{{ getRelativeTime(record.createdAt) }}</div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-empty v-else description="暂无修改记录" />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="`修改记录详情 - ${selectedRecord?.product?.name || '未知产品'}`"
      width="600px">
      
      <div v-if="selectedRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录ID">{{ selectedRecord.id }}</el-descriptions-item>
          <el-descriptions-item label="产品ID">{{ selectedRecord.productId }}</el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getActionType(selectedRecord.action)">
              {{ getActionText(selectedRecord.action) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">{{ formatDate(selectedRecord.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="操作者">{{ selectedRecord.user?.username || '系统' }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedRecord.changes" style="margin-top: 20px;">
          <h4>变更内容:</h4>
          <el-table :data="getChangesArray(selectedRecord.changes)" border>
            <el-table-column prop="field" label="字段" width="120">
              <template #default="scope">
                <strong>{{ getFieldLabel(scope.row.field) }}</strong>
              </template>
            </el-table-column>
            <el-table-column prop="old" label="原值">
              <template #default="scope">
                <span class="old-value">{{ scope.row.old || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="new" label="新值">
              <template #default="scope">
                <span class="new-value">{{ scope.row.new || '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getAllUpdateRecords } from '@/api'
import { ElMessage } from 'element-plus'
import { 
  DocumentCopy, Search, Refresh, Box, Calendar, User, Right, 
  Plus, Delete, View 
} from '@element-plus/icons-vue'

const records = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const selectedRecord = ref(null)
const viewMode = ref('table')

const searchForm = reactive({
  action: '',
  productId: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const fieldLabels = {
  name: '商品名称',
  brand: '品牌',
  barcode: '条形码',
  shippingCode: '发货代码',
  status: '销售状态',
  marketPrice: '市场价',
  salePrice: '销售价',
  purchasePrice: '采购价',
  minPurchasePrice: '最低采购价',
  description: '商品描述',
  highlights: '商品亮点',
  warehouseCode: '仓库代码',
  supplierCode: '供应商代码',
  warehouseName: '仓库名称',
  hasQualityCert: '质检证书',
  shippingFee: '运费',
  statusNote: '状态备注',
  createdTime: '创建时间'
}

const fetchRecords = async () => {
  loading.value = true
  
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...searchForm
    }
    
    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key]
      }
    })
    
    const response = await getAllUpdateRecords(params)
    const { data, total, page, size } = response.data
    
    records.value = data
    pagination.total = total
    pagination.page = page
    pagination.size = size
  } catch (error) {
    console.error('获取修改记录失败:', error)
    ElMessage.error('获取修改记录失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.action = ''
  searchForm.productId = ''
  pagination.page = 1
  fetchRecords()
}

const handleSizeChange = (newSize) => {
  pagination.size = newSize
  pagination.page = 1
  fetchRecords()
}

const handleCurrentChange = (newPage) => {
  pagination.page = newPage
  fetchRecords()
}

const viewDetails = (record) => {
  selectedRecord.value = record
  dialogVisible.value = true
}

const getActionType = (action) => {
  const types = {
    'create': 'success',
    'update': 'warning',
    'delete': 'danger'
  }
  return types[action] || 'info'
}

const getActionText = (action) => {
  const texts = {
    'create': '创建',
    'update': '更新',
    'delete': '删除'
  }
  return texts[action] || '未知'
}

const getFieldLabel = (field) => {
  return fieldLabels[field] || field
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getChangesArray = (changesStr) => {
  try {
    const changes = JSON.parse(changesStr)
    return Object.keys(changes).map(field => ({
      field,
      old: changes[field].old,
      new: changes[field].new
    }))
  } catch {
    return []
  }
}

// 获取统计数据
const getActionCount = (action) => {
  return records.value.filter(record => record.action === action).length
}

// 获取操作图标
const getActionIcon = (action) => {
  const icons = {
    'create': Plus,
    'update': Right,
    'delete': Delete
  }
  return icons[action] || Right
}

// 获取相对时间
const getRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return `${days}天前`
  }
}

// 获取前几项变更（用于表格显示）
const getTopChanges = (changesStr) => {
  try {
    const changes = JSON.parse(changesStr)
    const entries = Object.entries(changes)
    return Object.fromEntries(entries.slice(0, 3))
  } catch {
    return {}
  }
}

// 获取变更总数
const getChangesCount = (changesStr) => {
  try {
    const changes = JSON.parse(changesStr)
    return Object.keys(changes).length
  } catch {
    return 0
  }
}

// 获取变更对象（用于时间线视图）
const getChangesObject = (changesStr) => {
  try {
    return JSON.parse(changesStr)
  } catch {
    return {}
  }
}

// 获取时间线颜色
const getTimelineColor = (action) => {
  const colors = {
    'create': '#67c23a',
    'update': '#e6a23c',
    'delete': '#f56c6c'
  }
  return colors[action] || '#909399'
}

// 检查是否从路由参数传入了产品ID
const initializeFromRoute = () => {
  const route = useRoute()
  if (route.query.productId) {
    searchForm.productId = route.query.productId
    viewMode.value = 'timeline'
    fetchRecords()
  }
}

onMounted(() => {
  initializeFromRoute()
  if (!searchForm.productId) {
    fetchRecords()
  }
})
</script>

<style scoped>
.all-update-history {
  padding: 0;
  background: #fff;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  background: #fff;
  color: #333;
  padding: 40px 0;
  margin-bottom: 24px;
  border-bottom: 1px solid #e6e6e6;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.title-section {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.stats-section {
  max-width: 600px;
  margin: 0 auto;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  border: 1px solid #e6e6e6;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.create {
  border-left: 4px solid #67c23a;
}

.stat-card.update {
  border-left: 4px solid #e6a23c;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 搜索卡片样式 */
.search-card {
  margin: 0 24px 24px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.search-form {
  padding: 8px 0;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

/* 表格卡片样式 */
.table-card {
  margin: 0 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 产品信息样式 */
.product-info {
  padding: 4px 0;
}

.product-name {
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.product-id {
  font-size: 12px;
  color: #7f8c8d;
}

/* 时间信息样式 */
.time-info {
  padding: 4px 0;
}

.date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 2px;
}

.relative-time {
  font-size: 12px;
  color: #95a5a6;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.username {
  font-size: 12px;
  color: #5a6c7d;
}

/* 变更详情样式 */
.changes-detail {
  max-height: 120px;
  overflow-y: auto;
}

.change-item {
  margin: 6px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.field-tag {
  background-color: #f1f2f6;
  color: #2c3e50;
  border: none;
}

.change-arrow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.old-value {
  color: #e74c3c;
  background: #ffeaea;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.new-value {
  color: #27ae60;
  font-weight: bold;
  background: #eafaf1;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.more-changes {
  color: #7f8c8d;
  font-size: 12px;
  font-style: italic;
  margin-top: 4px;
}

.action-detail {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-desc {
  color: #7f8c8d;
  font-size: 13px;
}

/* 分页样式 */
.pagination-wrapper {
  padding: 24px;
  display: flex;
  justify-content: center;
  background: #fafbfc;
  border-top: 1px solid #e9ecef;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 0;
}

:deep(.el-table .cell) {
  padding: 12px 8px;
}

:deep(.el-table__row:hover) {
  background-color: #f8f9fa;
}

:deep(.el-table__header-wrapper) {
  background: #f8f9fa;
}

:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-dialog .old-value) {
  color: #e74c3c;
  background: #ffeaea;
  padding: 2px 6px;
  border-radius: 4px;
}

:deep(.el-dialog .new-value) {
  color: #27ae60;
  font-weight: bold;
  background: #eafaf1;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 时间线视图样式 */
.timeline-card {
  margin: 0 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.timeline-record {
  margin-bottom: 0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.timeline-record:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.record-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.changes {
  margin: 16px 0;
}

.changes h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.change-item {
  margin: 8px 0;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.change-item strong {
  color: #2c3e50;
  min-width: 80px;
}

.arrow-icon {
  color: #909399;
  font-size: 12px;
}

.action-detail {
  margin: 16px 0;
}

.action-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
  color: #1e40af;
  font-size: 14px;
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
  font-size: 12px;
}

.record-footer .user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #5a6c7d;
}

.record-footer .relative-time {
  color: #95a5a6;
}

:deep(.el-timeline-item__timestamp) {
  color: #409eff;
  font-weight: 500;
}

:deep(.el-timeline .el-timeline-item:last-child .el-timeline-item__tail) {
  display: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 24px 0;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .search-card,
  .table-card,
  .timeline-card {
    margin: 0 12px 12px 12px;
  }
  
  .header-content {
    padding: 0 12px;
  }
  
  .record-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .change-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>