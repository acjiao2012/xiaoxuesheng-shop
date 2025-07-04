<template>
  <div class="address-page">
    <h2>收货地址管理</h2>
    <el-button type="primary" @click="showAdd = true">新增地址</el-button>
    <el-table :data="addresses" style="width: 100%; margin-top: 18px;">
      <el-table-column prop="name" label="收货人" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column prop="province" label="省份" />
      <el-table-column prop="city" label="城市" />
      <el-table-column prop="detail_address" label="详细地址" />
      <el-table-column prop="is_default" label="默认">
        <template #default="scope">
          <el-tag v-if="scope.row.is_default" type="success">默认</el-tag>
          <el-button v-else size="small" @click="setDefault(scope.row.id)">设为默认</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="editAddress(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteAddress(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="showAdd" :title="editMode ? '编辑地址' : '新增地址'" width="400px">
      <el-form :model="newAddr">
        <el-form-item label="收货人"><el-input v-model="newAddr.name" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="newAddr.phone" /></el-form-item>
        <el-form-item label="省份"><el-input v-model="newAddr.province" /></el-form-item>
        <el-form-item label="城市"><el-input v-model="newAddr.city" /></el-form-item>
        <el-form-item label="区县"><el-input v-model="newAddr.district" /></el-form-item>
        <el-form-item label="详细地址"><el-input v-model="newAddr.detail_address" /></el-form-item>
        <el-form-item label="设为默认"><el-switch v-model="newAddr.is_default" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAddressList, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../api/user'
import { ElMessage } from 'element-plus'

interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail_address: string
  is_default: boolean
  created_at: string
}

const addresses = ref<Address[]>([])
const showAdd = ref(false)
const editMode = ref(false)
const editingId = ref<string | null>(null)
const newAddr = ref<Omit<Address, 'id' | 'created_at'>>({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail_address: '',
  is_default: false
})

async function loadAddresses() {
  try {
    const res = await getAddressList()
    addresses.value = res.addresses
  } catch {
    ElMessage.error('获取地址失败')
  }
}

onMounted(loadAddresses)

function editAddress(addr: Address) {
  Object.assign(newAddr.value, addr)
  editingId.value = addr.id
  editMode.value = true
  showAdd.value = true
}

function resetForm() {
  newAddr.value = {
    name: '', phone: '', province: '', city: '', district: '', detail_address: '', is_default: false
  }
  editingId.value = null
  editMode.value = false
}

async function saveAddress() {
  try {
    if (editingId.value) {
      await updateAddress(editingId.value, newAddr.value)
      ElMessage.success('地址已更新')
    } else {
      await addAddress(newAddr.value)
      ElMessage.success('地址已添加')
    }
    showAdd.value = false
    resetForm()
    loadAddresses()
  } catch {
    ElMessage.error('保存失败')
  }
}

async function deleteAddress(id: string) {
  try {
    await deleteAddress(id)
    ElMessage.success('已删除')
    loadAddresses()
  } catch {
    ElMessage.error('删除失败')
  }
}

async function setDefault(id: string) {
  try {
    await setDefaultAddress(id)
    ElMessage.success('已设为默认')
    loadAddresses()
  } catch {
    ElMessage.error('设置失败')
  }
}
</script>
<style scoped>
.address-page { max-width: 700px; margin: 0 auto; padding: 32px 0; }
</style> 