<template>
  <div class="product-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>编辑产品</h3>
          <el-button @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
      </template>
      
      <ProductForm 
        ref="productFormRef"
        :product="product"
        @saved="handleSaved" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProduct } from '@/api'
import { ElMessage } from 'element-plus'
import ProductForm from '@/components/ProductForm.vue'

const route = useRoute()
const router = useRouter()
const productFormRef = ref()
const product = ref(null)

const fetchProduct = async () => {
  try {
    const response = await getProduct(route.params.id)
    product.value = response.data.data
    productFormRef.value?.show(product.value)
  } catch (error) {
    ElMessage.error('获取产品信息失败')
    router.back()
  }
}

const handleSaved = () => {
  ElMessage.success('保存成功')
  router.back()
}

onMounted(() => {
  fetchProduct()
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
</style>