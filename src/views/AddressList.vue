<template>
  <div class="address-page">
    <h2>收货地址管理</h2>
    <el-button type="primary" @click="showAdd = true">新增地址</el-button>
    <el-table :data="addresses" style="width: 100%; margin-top: 18px;">
      <el-table-column prop="name" label="收货人" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column prop="province" label="省份" />
      <el-table-column prop="city" label="城市" />
      <el-table-column prop="detail" label="详细地址" />
      <el-table-column prop="isDefault" label="默认">
        <template #default="scope">
          <el-tag v-if="scope.row.isDefault" type="success">默认</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="editAddress(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteAddress(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="showAdd" title="新增地址" width="400px">
      <el-form :model="newAddr">
        <el-form-item label="收货人"><el-input v-model="newAddr.name" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="newAddr.phone" /></el-form-item>
        <el-form-item label="省份"><el-input v-model="newAddr.province" /></el-form-item>
        <el-form-item label="城市"><el-input v-model="newAddr.city" /></el-form-item>
        <el-form-item label="详细地址"><el-input v-model="newAddr.detail" /></el-form-item>
        <el-form-item label="设为默认"><el-switch v-model="newAddr.isDefault" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="addAddress">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../store/user'
const userStore = useUserStore()
const addresses = computed(() => userStore.addresses)
const showAdd = ref(false)
const newAddr = ref({ name: '', phone: '', province: '', city: '', detail: '', isDefault: false })
function addAddress() {
  if (!newAddr.value.name || !newAddr.value.phone) return
  const addr = { ...newAddr.value, id: Date.now().toString() }
  userStore.setAddresses([...userStore.addresses, addr])
  showAdd.value = false
  newAddr.value = { name: '', phone: '', province: '', city: '', detail: '', isDefault: false }
}
function editAddress(addr: Address) {
  // 可扩展为弹窗编辑
  Object.assign(newAddr.value, addr)
  showAdd.value = true
}
function deleteAddress(id: string) {
  userStore.setAddresses(userStore.addresses.filter(a => a.id !== id))
}
</script>
<style scoped>
.address-page { max-width: 700px; margin: 0 auto; padding: 32px 0; }
</style> 