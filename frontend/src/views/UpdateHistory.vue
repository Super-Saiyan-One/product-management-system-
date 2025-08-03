<template>
  <div class="update-history">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>修改记录</h3>
          <div class="header-actions">
            <el-form inline v-if="!productId">
              <el-form-item label="产品ID:">
                <el-input v-model="searchProductId" placeholder="输入产品ID" style="width: 200px" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="fetchRecords">查询</el-button>
              </el-form-item>
            </el-form>
            <el-button type="success" @click="viewAllRecords">查看所有记录</el-button>
          </div>
        </div>
      </template>

      <el-timeline v-if="records.length > 0">
        <el-timeline-item 
          v-for="record in records" 
          :key="record.id"
          :timestamp="formatDate(record.createdAt)"
          placement="top">
          <el-card>
            <div class="record-header">
              <el-tag :type="getActionType(record.action)">
                {{ getActionText(record.action) }}
              </el-tag>
              <span class="product-name" v-if="record.product">
                {{ record.product.name }}
              </span>
            </div>
            
            <div v-if="record.action === 'update' && record.changes" class="changes">
              <h4>变更内容：</h4>
              <div v-for="(change, field) in JSON.parse(record.changes)" :key="field" class="change-item">
                <strong>{{ getFieldLabel(field) }}:</strong>
                <span class="old-value">{{ change.old || '-' }}</span>
                →
                <span class="new-value">{{ change.new || '-' }}</span>
              </div>
            </div>
            
            <div v-else-if="record.action === 'create' && record.changes" class="changes">
              <h4>创建内容：</h4>
              <div v-for="(value, field) in JSON.parse(record.changes)" :key="field" class="change-item">
                <strong>{{ getFieldLabel(field) }}:</strong>
                <span class="new-value">{{ value || '-' }}</span>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-empty v-else description="暂无修改记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUpdateRecords } from '@/api'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const records = ref([])
const loading = ref(false)
const productId = ref(route.query.productId)
const searchProductId = ref('')

const fieldLabels = {
  name: '商品名称',
  brand: '品牌',
  barcode: '条形码',
  status: '销售状态',
  marketPrice: '市场价',
  salePrice: '销本价',
  purchasePrice: '采购价',
  description: '商品描述',
  highlights: '商品亮点',
  warehouseCode: '仓库代码',
  supplierCode: '供应商代码',
  hasQualityCert: '质检证书',
  shippingFee: '运费'
}

const fetchRecords = async (targetProductId = null) => {
  const id = targetProductId || productId.value || searchProductId.value
  
  if (!id) {
    ElMessage.warning('请输入产品ID')
    return
  }

  loading.value = true
  
  try {
    const response = await getUpdateRecords(id)
    records.value = response.data.data
  } catch (error) {
    console.error('获取修改记录失败:', error)
    ElMessage.error('获取修改记录失败')
  } finally {
    loading.value = false
  }
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

const viewAllRecords = () => {
  router.push('/records/all')
}

onMounted(() => {
  if (productId.value) {
    fetchRecords()
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.product-name {
  font-weight: bold;
  color: #409eff;
}

.changes {
  margin-top: 10px;
}

.changes h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.change-item {
  margin: 5px 0;
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.change-item:last-child {
  border-bottom: none;
}

.old-value {
  color: #f56c6c;
  text-decoration: line-through;
  margin: 0 5px;
}

.new-value {
  color: #67c23a;
  font-weight: bold;
  margin: 0 5px;
}

.el-timeline {
  margin-top: 20px;
}
</style>