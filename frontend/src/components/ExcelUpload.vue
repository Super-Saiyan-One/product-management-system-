<template>
  <el-dialog v-model="visible" title="导入Excel" width="700px" :close-on-click-modal="false">
    <el-upload
      ref="uploadRef"
      :auto-upload="false"
      :on-change="handleFileChange"
      :before-upload="beforeUpload"
      accept=".xlsx,.xls"
      :show-file-list="false"
      drag>
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        将Excel文件拖拽到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持.xlsx和.xls格式，文件大小不超过10MB
        </div>
      </template>
    </el-upload>

    <div v-if="fileName" class="file-info">
      <el-tag type="success">{{ fileName }}</el-tag>
      <el-button size="small" @click="clearFile" style="margin-left: 10px">清除</el-button>
    </div>

    <div v-if="previewData.length > 0" class="preview-section">
      <div class="preview-header">
        <h4>数据预览：</h4>
        <div class="preview-controls">
          <el-pagination
            v-model:current-page="currentPreviewPage"
            :page-size="previewPageSize"
            :total="previewData.length"
            layout="total, prev, pager, next"
            size="small"
            style="margin-bottom: 10px" />
        </div>
      </div>
      
      <el-table 
        :data="getCurrentPageData()" 
        border 
        size="small" 
        style="width: 100%"
        max-height="400px">
        <el-table-column 
          label="行号" 
          width="60" 
          align="center"
          fixed="left">
          <template #default="{ $index }">
            {{ (currentPreviewPage - 1) * previewPageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column 
          v-if="previewData[0]._sheetName"
          label="工作表" 
          width="120"
          fixed="left">
          <template #default="{ row }">
            <el-tag size="small" :type="getSheetTagType(row._sheetName)">
              {{ row._sheetName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          v-for="(col, index) in columns" 
          :key="index"
          :prop="col.key" 
          :label="col.label"
          min-width="120"
          show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row[col.key]" :class="{ 'empty-cell': !row[col.key] }">
              {{ row[col.key] }}
            </span>
            <span v-else class="empty-cell">-</span>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="preview-info">
        <p>共检测到 <strong>{{ previewData.length }}</strong> 行数据</p>
        <el-button size="small" @click="showDataAnalysis">数据分析</el-button>
      </div>
      
      <el-alert
        title="字段映射说明"
        type="info"
        :closable="false"
        style="margin-top: 15px">
        <template #default>
          <p style="margin: 0;">系统将自动识别以下字段：</p>
          <div class="field-mapping">
            <el-tag size="small">维护时间</el-tag>
            <el-tag size="small">商品名称</el-tag>
            <el-tag size="small">品牌</el-tag>
            <el-tag size="small">条形码</el-tag>
            <el-tag size="small">发货代码</el-tag>
            <el-tag size="small">产品状态/备注</el-tag>
            <el-tag size="small">市场价</el-tag>
            <el-tag size="small">销本价</el-tag>
            <el-tag size="small">采购价</el-tag>
            <el-tag size="small">仓库代码</el-tag>
            <el-tag size="small">供货商代码</el-tag>
            <el-tag size="small">发货仓库名称</el-tag>
            <el-tag size="small">老发货代码1/2</el-tag>
          </div>
        </template>
      </el-alert>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button 
        type="primary" 
        @click="handleImport"
        :loading="importing"
        :disabled="previewData.length === 0">
        {{ importing ? '导入中...' : '确认导入' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import * as XLSX from 'xlsx'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const emit = defineEmits(['imported'])

const visible = ref(false)
const importing = ref(false)
const previewData = ref([])
const columns = ref([])
const rawFile = ref(null)
const fileName = ref('')
const currentPreviewPage = ref(1)
const previewPageSize = ref(10)

const fieldMapping = {
  // 基础字段
  '创建时间': 'createdAt',
  '维护时间': 'createdAt',
  '商品名称': 'name',
  ' 商品名称': 'name', // 处理前面有空格的情况
  '品牌': 'brand',
  '条形码': 'barcode',
  '发货代码': 'shippingCode',
  
  // 状态和描述
  '销售状态': 'status',
  '产品状态/备注': 'statusNote',
  '商品描述': 'description',
  '商品介绍(型号/参数)': 'description',
  '商品亮点': 'highlights',
  '产品描述(亮点)': 'highlights',
  
  // 价格字段
  '市场价': 'marketPrice',
  '销本价': 'salePrice',
  '采购价': 'purchasePrice',
  '采购价(本仓不含运)': 'purchasePrice',
  '采购价\n(本仓不含运)': 'purchasePrice',
  '最低采购价': 'minPurchasePrice',
  '最低采购价(集采不含运)': 'minPurchasePrice',
  '最低采购价\n(集采不含运)': 'minPurchasePrice',
  '货品单件运费': 'shippingFee',
  '运费': 'shippingFee',
  
  // 仓储物流
  '仓库代码': 'warehouseCode',
  '供应商代码': 'supplierCode',
  '对应供货商代码': 'supplierCode',
  '对应发货仓库名称': 'warehouseName',
  '老发货代码1': 'oldShippingCode1',
  '老发货代码2': 'oldShippingCode2',
  
  // 质检
  '是否有质检/报关单': 'hasQualityCert'
}

const show = () => {
  visible.value = true
  resetData()
}

const resetData = () => {
  previewData.value = []
  columns.value = []
  rawFile.value = null
  fileName.value = ''
  currentPreviewPage.value = 1
}

const clearFile = () => {
  resetData()
}

const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel'
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isExcel) {
    ElMessage.error('只能上传Excel文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB!')
    return false
  }
  return true
}

const handleFileChange = (file) => {
  rawFile.value = file.raw
  fileName.value = file.name
  parseExcel(file.raw)
}

const parseExcel = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      
      // 处理多个工作表，优先使用有数据的工作表
      let allData = []
      let totalRows = 0
      
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length >= 2) {
          const headers = jsonData[0].map(h => String(h || '').trim()) // 清理列名
          
          // 找到关键字段的索引
          const nameIndex = headers.findIndex(h => 
            h.includes('商品名称') || h.includes('产品名称')
          )
          
          // 更严格的数据过滤：必须有商品名称或至少3个有效字段
          const rows = jsonData.slice(1).filter(row => {
            // 检查是否有商品名称
            if (nameIndex !== -1 && row[nameIndex] && String(row[nameIndex]).trim() !== '') {
              return true
            }
            
            // 如果没有商品名称，检查是否至少有3个非空字段
            const validCells = row.filter(cell => 
              cell !== null && cell !== undefined && String(cell).trim() !== ''
            )
            return validCells.length >= 3
          })
          
          // 根据工作表名称推断状态
          let sheetStatus = 'saleable'
          if (sheetName.includes('不可销售')) {
            sheetStatus = 'non-saleable'
          } else if (sheetName.includes('后续需下架') || sheetName.includes('待下架')) {
            sheetStatus = 'saleable-pending-removal'
          }
          
          // 为每行添加工作表来源和状态信息
          const processedRows = rows.map(row => {
            const rowData = { _sheetName: sheetName, _defaultStatus: sheetStatus }
            headers.forEach((header, index) => {
              rowData[`col_${index}`] = row[index] || ''
            })
            return rowData
          })
          
          if (allData.length === 0) {
            // 第一个工作表，设置列结构
            columns.value = headers.map((header, index) => ({
              label: header,
              key: `col_${index}`,
              originalKey: header
            }))
          }
          
          allData = allData.concat(processedRows)
          totalRows += rows.length
        }
      }
      
      if (allData.length === 0) {
        ElMessage.error('Excel文件没有有效数据，至少需要表头和一行数据')
        return
      }
      
      previewData.value = allData
      
      ElMessage.success(`成功解析Excel文件，共${workbook.SheetNames.length}个工作表，${totalRows}行数据`)
    } catch (error) {
      console.error('Excel解析失败:', error)
      ElMessage.error('Excel文件解析失败，请检查文件格式')
    }
  }
  reader.readAsArrayBuffer(file)
}

const convertStatusValue = (value) => {
  if (!value) return 'saleable'
  
  const statusMap = {
    '可销售': 'saleable',
    '不可销售': 'non-saleable',
    '可销售（后续需下架）': 'saleable-pending-removal'
  }
  
  return statusMap[value] || 'saleable'
}

const handleImport = async () => {
  if (!previewData.value.length) {
    ElMessage.error('没有可导入的数据')
    return
  }
  
  importing.value = true
  
  try {
    const products = previewData.value.map(row => {
      const product = {}
      
      // 设置默认状态（基于工作表）
      if (row._defaultStatus) {
        product.status = row._defaultStatus
      }
      
      columns.value.forEach(col => {
        const mappedKey = fieldMapping[col.originalKey]
        if (mappedKey) {
          let value = row[col.key]
          
          // 处理空值和无效值
          if (value === null || value === undefined || value === '') {
            if (['marketPrice', 'salePrice', 'purchasePrice', 'minPurchasePrice', 'shippingFee'].includes(mappedKey)) {
              value = null
            } else if (mappedKey === 'hasQualityCert') {
              value = false
            } else if (mappedKey === 'createdAt') {
              value = new Date() // 如果维护时间为空，使用当前时间
            } else {
              return // 跳过空的文本字段
            }
          }
          
          // 数据类型转换
          if (mappedKey === 'status') {
            value = convertStatusValue(value) || product.status || 'saleable'
          } else if (['marketPrice', 'salePrice', 'purchasePrice', 'minPurchasePrice', 'shippingFee'].includes(mappedKey)) {
            const numValue = parseFloat(value)
            value = isNaN(numValue) ? null : numValue
          } else if (mappedKey === 'createdAt' && value) {
            // 处理日期格式
            let date
            if (typeof value === 'number') {
              // Excel日期数字格式
              date = new Date((value - 25569) * 86400 * 1000)
            } else if (typeof value === 'string') {
              // 字符串日期格式
              date = new Date(value)
            } else {
              date = new Date(value)
            }
            value = isNaN(date.getTime()) ? new Date() : date
          } else if (mappedKey === 'hasQualityCert') {
            value = String(value).toLowerCase().includes('是') || String(value).toLowerCase().includes('有') || String(value) === '1'
          } else if (typeof value === 'string') {
            value = value.trim() // 清理字符串
          }
          
          product[mappedKey] = value
        }
      })
      
      // 数据验证
      if (!product.name || product.name.trim() === '') {
        console.warn(`跳过第${previewData.value.indexOf(row) + 1}行：商品名称为空`)
        return null // 返回null，稍后过滤掉
      }
      
      // 检查是否有足够的有效数据（至少需要商品名称和另外2个字段）
      const validFieldCount = Object.keys(product).filter(key => 
        !key.startsWith('_') && product[key] !== null && product[key] !== undefined && product[key] !== ''
      ).length
      
      if (validFieldCount < 3) {
        console.warn(`跳过第${previewData.value.indexOf(row) + 1}行：有效字段不足（只有${validFieldCount}个）`)
        return null
      }
      
      // 设置默认值
      if (!product.status) {
        product.status = 'saleable'
      }
      if (!product.hasQualityCert) {
        product.hasQualityCert = false
      }
      
      return product
    }).filter(product => product !== null) // 过滤掉无效的产品
    
    if (products.length === 0) {
      ElMessage.error('没有有效的产品数据可导入')
      return
    }
    
    console.log(`准备导入${products.length}个有效产品`)
    
    // 如果产品数量超过500个，进行分批导入
    const batchSize = 500
    if (products.length > batchSize) {
      await importInBatches(products, batchSize)
      return
    }
    
    const response = await fetch('/api/products/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ products })
    })
    
    console.log('API响应状态:', response.status)
    console.log('API响应头:', response.headers.get('content-type'))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API错误响应:', errorText)
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`)
    }
    
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('非JSON响应:', text.substring(0, 500))
      throw new Error('服务器返回了非JSON格式的响应，可能是服务器错误')
    }
    
    const result = await response.json()
    console.log('解析后的结果:', result)
    
    if (result.success) {
      let message = `导入成功！产品：成功${result.successCount}，失败${result.failureCount}`
      if (result.warehouseCount > 0) {
        message += `，自动处理仓库${result.warehouseCount}个`
      }
      ElMessage.success(message)
      
      if (result.failureCount > 0 && result.errors) {
        console.warn('导入错误详情:', result.errors)
        ElMessage.warning(`部分数据导入失败，请查看控制台了解详情`)
      }
      
      emit('imported', result)
      visible.value = false
    } else {
      ElMessage.error(`导入失败：${result.message}`)
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error(`导入过程中发生错误：${error.message}`)
  } finally {
    importing.value = false
  }
}

const getCurrentPageData = () => {
  const start = (currentPreviewPage.value - 1) * previewPageSize.value
  const end = start + previewPageSize.value
  return previewData.value.slice(start, end)
}

const getSheetTagType = (sheetName) => {
  if (sheetName.includes('不可销售')) {
    return 'danger'
  } else if (sheetName.includes('后续需下架') || sheetName.includes('待下架')) {
    return 'warning'
  }
  return 'success'
}

const showDataAnalysis = () => {
  const analysis = analyzeData()
  ElMessage.info(`数据分析：有效产品名称 ${analysis.validNames} 个，空行 ${analysis.emptyRows} 个，部分数据行 ${analysis.partialRows} 个`)
  console.log('详细数据分析:', analysis)
}

const analyzeData = () => {
  const nameIndex = columns.value.findIndex(col => 
    col.originalKey.includes('商品名称') || col.originalKey.includes('产品名称')
  )
  
  let validNames = 0
  let emptyRows = 0
  let partialRows = 0
  
  previewData.value.forEach(row => {
    const hasName = nameIndex !== -1 && row[`col_${nameIndex}`] && String(row[`col_${nameIndex}`]).trim() !== ''
    const validCells = Object.keys(row).filter(key => 
      !key.startsWith('_') && row[key] && String(row[key]).trim() !== ''
    ).length
    
    if (hasName) {
      validNames++
    } else if (validCells === 0) {
      emptyRows++
    } else {
      partialRows++
    }
  })
  
  return { validNames, emptyRows, partialRows, total: previewData.value.length }
}

const importInBatches = async (products, batchSize) => {
  const totalBatches = Math.ceil(products.length / batchSize)
  let totalSuccessCount = 0
  let totalFailureCount = 0
  const allErrors = []
  
  ElMessage.info(`数据量较大，将分${totalBatches}批次导入，每批${batchSize}个产品`)
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize
    const end = Math.min(start + batchSize, products.length)
    const batch = products.slice(start, end)
    
    try {
      console.log(`导入第${i + 1}/${totalBatches}批，包含${batch.length}个产品`)
      
      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ products: batch })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        totalSuccessCount += result.successCount || 0
        totalFailureCount += result.failureCount || 0
        if (result.errors) {
          allErrors.push(...result.errors)
        }
        
        let batchMessage = `第${i + 1}批导入完成: 产品成功${result.successCount || 0}个`
        if (result.warehouseCount > 0) {
          batchMessage += `，仓库${result.warehouseCount}个`
        }
        ElMessage.success(batchMessage)
      } else {
        throw new Error(result.message || '批次导入失败')
      }
      
      // 批次间稍作延迟，避免服务器压力过大
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
    } catch (error) {
      console.error(`第${i + 1}批导入失败:`, error)
      ElMessage.error(`第${i + 1}批导入失败: ${error.message}`)
      // 继续导入下一批
    }
  }
  
  // 显示最终结果
  ElMessage.success(`所有批次导入完成！总计成功：${totalSuccessCount}，失败：${totalFailureCount}`)
  
  if (allErrors.length > 0) {
    console.warn('所有导入错误:', allErrors)
  }
  
  emit('imported', { 
    success: true, 
    successCount: totalSuccessCount, 
    failureCount: totalFailureCount,
    errors: allErrors
  })
  visible.value = false
}

defineExpose({
  show
})
</script>

<style scoped>
.file-info {
  margin: 15px 0;
  text-align: center;
}

.preview-section {
  margin-top: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.preview-header h4 {
  margin: 0;
}

.preview-info {
  margin: 15px 0;
  color: #666;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-cell {
  color: #ccc;
  font-style: italic;
}

.field-mapping {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.field-mapping .el-tag {
  margin: 0;
}
</style>