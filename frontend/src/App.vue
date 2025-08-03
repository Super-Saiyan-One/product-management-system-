<template>
  <div id="app">
    <el-container>
      <el-header class="header">
        <h1>产品管理系统</h1>
        <div class="nav-tabs">
          <router-link to="/products" class="nav-tab" :class="{ active: $route.path === '/products' }">
            产品管理
          </router-link>
          <router-link to="/warehouses" class="nav-tab" :class="{ active: $route.path === '/warehouses' }">
            仓库管理
          </router-link>
          <router-link to="/records/all" class="nav-tab" :class="{ active: $route.path === '/records/all' }">
            修改记录
          </router-link>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('产品管理系统启动')
})
</script>

<style>
#app {
  min-height: 100vh;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header h1 {
  margin: 0;
  color: #409eff;
  font-size: 24px;
  font-weight: 600;
}

.nav-tabs {
  display: flex;
  gap: 20px;
}

.nav-tab {
  padding: 12px 20px;
  color: #606266;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
  border: 1px solid transparent;
}

.nav-tab:hover {
  color: #409eff;
  background: #f5f7fa;
  border-color: #e6e6e6;
}

.nav-tab.active {
  color: #409eff;
  background: #ecf5ff;
  border-color: #409eff;
}

.main {
  background: #fff;
  padding: 20px;
  min-width: 100%;
  min-height: calc(100vh - 60px);
}

body {
  margin: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}
</style>