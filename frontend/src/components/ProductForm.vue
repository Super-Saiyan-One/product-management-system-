<template>
  <el-dialog 
    v-model="visible" 
    :title="isEdit ? '编辑产品' : '新增产品'" 
    width="800px"
    :close-on-click-modal="false">
    <el-form 
      ref="formRef"
      :model="form" 
      :rules="rules" 
      label-width="150px">
      <!-- 基本信息 -->
      <el-divider content-position="left">基本信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入商品名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="品牌" prop="brand">
            <el-input v-model="form.brand" placeholder="请输入品牌" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="条形码" prop="barcode">
            <el-input v-model="form.barcode" placeholder="请输入条形码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="销售状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
              <el-option label="可销售" value="saleable" />
              <el-option label="不可销售" value="non-saleable" />
              <el-option label="可销售（后续需下架）" value="saleable-pending-removal" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="发货代码" prop="shippingCode">
            <el-input v-model="form.shippingCode" placeholder="请输入发货代码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产品状态/备注" prop="statusNote">
            <el-input v-model="form.statusNote" placeholder="请输入产品状态/备注" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否有质检/报关单" prop="hasQualityCert">
            <el-switch v-model="form.hasQualityCert" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 商品描述 -->
      <el-divider content-position="left">商品描述</el-divider>
      <el-form-item label="商品介绍(型号/参数)" prop="description">
        <el-input 
          v-model="form.description" 
          type="textarea" 
          :rows="3"
          placeholder="请输入商品介绍(型号/参数)" />
      </el-form-item>

      <el-form-item label="产品描述(亮点)" prop="highlights">
        <el-input 
          v-model="form.highlights" 
          type="textarea" 
          :rows="2"
          placeholder="请输入产品描述(亮点)" />
      </el-form-item>

      <!-- 价格信息 -->
      <el-divider content-position="left">价格信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="市场价" prop="marketPrice">
            <el-input-number 
              v-model="form.marketPrice" 
              :precision="2"
              :min="0"
              style="width: 100%"
              placeholder="0.00"
              controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="销本价" prop="salePrice">
            <el-input-number 
              v-model="form.salePrice" 
              :precision="2"
              :min="0"
              style="width: 100%"
              placeholder="0.00"
              controls-position="right" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="采购价(本仓不含运)" prop="purchasePrice">
            <el-input-number 
              v-model="form.purchasePrice" 
              :precision="2"
              :min="0"
              style="width: 100%"
              placeholder="0.00"
              controls-position="right" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="货品单件运费" prop="shippingFee">
            <el-input-number 
              v-model="form.shippingFee" 
              :precision="2"
              :min="0"
              style="width: 100%"
              placeholder="0.00"
              controls-position="right" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="最低采购价(集采不含运)" prop="minPurchasePrice">
            <el-input-number 
              v-model="form.minPurchasePrice" 
              :precision="2"
              :min="0"
              style="width: 100%"
              placeholder="0.00"
              controls-position="right" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 仓储信息 -->
      <el-divider content-position="left">仓储信息</el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="发货仓库名称" prop="warehouseName">
            <el-select 
              v-model="form.warehouseName" 
              placeholder="请选择发货仓库" 
              style="width: 100%"
              @change="handleWarehouseChange"
              filterable>
              <el-option 
                v-for="warehouse in warehouses" 
                :key="warehouse.id"
                :label="warehouse.name" 
                :value="warehouse.name" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仓库代码" prop="warehouseCode">
            <el-input v-model="form.warehouseCode" placeholder="自动填充" readonly />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="对应供货商代码" prop="supplierCode">
            <el-input v-model="form.supplierCode" placeholder="自动填充" readonly />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="老发货代码1" prop="oldShippingCode1">
            <el-input v-model="form.oldShippingCode1" placeholder="请输入老发货代码1" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="老发货代码2" prop="oldShippingCode2">
            <el-input v-model="form.oldShippingCode2" placeholder="请输入老发货代码2" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button 
        type="primary" 
        @click="handleSave"
        :loading="saving">
        {{ saving ? '保存中...' : '确认' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, defineEmits, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { ElMessage } from 'element-plus'
import { getWarehouses, getWarehouseByName } from '@/api'

const emit = defineEmits(['saved'])

const productStore = useProductStore()
const visible = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const formRef = ref()
const warehouses = ref([])

const form = reactive({
  id: null,
  name: '',
  brand: '',
  barcode: '',
  status: 'saleable',
  statusNote: '',
  description: '',
  highlights: '',
  marketPrice: null,
  salePrice: null,
  purchasePrice: null,
  minPurchasePrice: null,
  shippingFee: null,
  warehouseCode: '',
  supplierCode: '',
  warehouseName: '',
  hasQualityCert: false,
  shippingCode: '',
  oldShippingCode1: '',
  oldShippingCode2: ''
})

const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择销售状态', trigger: 'change' }
  ],
  shippingCode: [
    { required: false, message: '请输入发货代码', trigger: 'blur' }
  ]
}

const show = (product = null) => {
  visible.value = true
  isEdit.value = !!product
  
  if (product) {
    Object.keys(form).forEach(key => {
      form[key] = product[key] ?? form[key]
    })
  } else {
    resetForm()
  }
}

const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (key === 'status') {
      form[key] = '可销售'
    } else if (key === 'hasQualityCert') {
      form[key] = false
    } else if (typeof form[key] === 'number') {
      form[key] = null
    } else {
      form[key] = ''
    }
  })
  form.id = null
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
    
    saving.value = true
    
    const saveData = { ...form }
    delete saveData.id
    
    try {
      if (isEdit.value) {
        await productStore.updateProduct(form.id, saveData)
        ElMessage.success('更新成功')
      } else {
        await productStore.createProduct(saveData)
        ElMessage.success('创建成功')
      }
      
      emit('saved')
      visible.value = false
    } catch (error) {
      // 处理发货代码重复错误
      if (error.response?.data?.message === '发货代码已存在') {
        const duplicateProduct = error.response.data.duplicateProduct
        ElMessageBox.alert(
          `发货代码 "${duplicateProduct.shippingCode}" 已存在！\n\n` +
          `产品名称：${duplicateProduct.name}\n` +
          `品牌：${duplicateProduct.brand || '无'}`,
          '发货代码重复',
          {
            confirmButtonText: '确定',
            type: 'warning'
          }
        )
      } else if (error.response?.data?.message === '条形码已存在') {
        ElMessage.error('条形码已存在')
      } else {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      }
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    }
  } finally {
    saving.value = false
  }
}

// 获取仓库列表
const fetchWarehouses = async () => {
  try {
    const response = await getWarehouses()
    warehouses.value = response.data.data
  } catch (error) {
    console.error('获取仓库列表失败:', error)
    ElMessage.error('获取仓库列表失败')
  }
}

// 处理仓库选择变更
const handleWarehouseChange = async (warehouseName) => {
  if (!warehouseName) {
    form.warehouseCode = ''
    form.supplierCode = ''
    return
  }
  
  try {
    const response = await getWarehouseByName(warehouseName)
    const warehouse = response.data.data
    
    form.warehouseCode = warehouse.code
    form.supplierCode = warehouse.supplierCode || ''
  } catch (error) {
    console.error('获取仓库信息失败:', error)
    ElMessage.error('获取仓库信息失败')
  }
}

onMounted(() => {
  fetchWarehouses()
})

defineExpose({
  show
})
</script>