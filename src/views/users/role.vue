<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/users";
import { storeToRefs } from "pinia";

const backupList = ref(null);
const roleList = ref(null);

const userStore = useUserStore();
const { getRoles, deleteRole } = userStore;
const { isLoading } = storeToRefs(userStore);

onMounted(() => fetchData());

const fetchData = async () => {
  backupList.value = await getRoles();
  roleList.value = backupList.value?.sort((a, b) => a.name.localeCompare(b.name));
};

const searchList = (query) => {
  if (!query) return (roleList.value = backupList.value);
  roleList.value = backupList.value.filter((role) =>
    role?.name?.toLowerCase().includes(query?.toLowerCase())
  );
};
</script>

<template>
  <MainLayout>
    <div class="md:flex justify-between mb-3">
      <input
        type="text"
        placeholder="Search Role..."
        class="px-4 py-2 border rounded"
        @input="searchList($event.target.value)"
      />
      <div>
        <button
          @click="$router.push({ name: 'role-create' })"
          class="px-4 py-2 mt-2 bg-[#000180] text-white rounded hover:bg-indigo-600"
        >
          <PlusOutlined class="mr-2 align-middle" /> Add New Role
        </button>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="purchase-table">
        <thead class="table-header">
          <tr>
            <th>Actions</th>
            <th>Role</th>
            <th>Dashboard Permissions</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-if="isLoading">
            <td colspan="3">Loading . . .</td>
          </tr>
          <tr v-if="!isLoading && !roleList?.length">
            <td colspan="3">No Data Found</td>
          </tr>
          <tr v-for="role in roleList" :key="role?.id">
            <td class="text-center lg:w-16">
              <button
                type="button"
                class="edit_btn"
                @click="
                  $router.push({
                    name: 'role-edit',
                    params: { id: role?.id },
                  })
                "
              >
                <EditOutlined class="align-middle" />
              </button>
              <a-popconfirm
                title="Are you sure delete?"
                @confirm="
                  async () => {
                    res = await deleteRole(role?.id);
                    res && fetchData();
                  }
                "
              >
                <button type="button" class="del_btn ml-2">
                  <DeleteOutlined class="align-middle" />
                </button>
              </a-popconfirm>
            </td>
            <td>
              <span class="md:hidden mr-1 font-bold">Role:</span>
              {{ role?.name }}
            </td>
            <td>
              <div class="flex">
                <span class="md:hidden mr-1 font-semibold">Permissions:</span>
                <div v-if="Object.values(role?.module_wise_permissions)?.length == 0">-</div>

                <span
                  class="capitalize text-blue-500"
                  v-for="(permissions, module, key) in role?.module_wise_permissions"
                  :key="key"
                >
                  {{ module }} -
                  <span
                    class="capitalize text-blue-500"
                    v-for="(permission, index) in permissions"
                    :key="index"
                  >
                    {{ permission?.name }}
                    <span class="mr-1" v-if="index < permissions?.length - 1">, </span>
                  </span>
                  <span
                    class="mr-1"
                    v-if="key < Object.values(role?.module_wise_permissions)?.length - 1"
                    >|
                  </span>
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </MainLayout>
</template>
