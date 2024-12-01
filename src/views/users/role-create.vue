<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/users";
import { storeToRefs } from "pinia";
import { showNotification } from "@/utilities/notification";

const permissionList = ref(null);
const formData = ref({
  name: "",
  permission: [],
});

const userStore = useUserStore();
const { getPermission, addRole } = userStore;
const { isLoading } = storeToRefs(userStore);

onMounted(async () => {
  permissionList.value = await getPermission();
});
const createRole = async (router) => {
  if (!formData.value.name) {
    showNotification("error", "Must enter the role name");
    return 0;
  }
  const res = await addRole(formData.value);
  res && router.go(-1);
};
</script>

<template>
  <MainLayout>
    <h6 class="font-medium">Create New Role</h6>
    <form @submit.prevent="createRole($router)">
      <div class="lg:grid grid-cols-3 gap-4 mt-3">
        <label for="name">Role Name</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          placeholder="Enter role name.."
          class="input-text col-span-2"
        />
        <label for="permissions">Select Permissions</label>
        <div class="col-span-2">
          <p v-if="isLoading">Loading...</p>
          <p class="mb-1" v-for="item in permissionList" :key="item?.id">
            <label
              ><input type="checkbox" :value="item?.name" v-model="formData.permission" />
              <span class="align-baseline ml-2 capitalize"
                >{{ item?.name }} - {{ item?.module }}</span
              ></label
            >
          </p>
        </div>
      </div>

      <div class="mt-5">
        <button
          type="submit"
          class="px-4 py-2 min-w-32 inline-block bg-[#000180] text-white rounded-lg mt-3"
        >
          Submit
        </button>
        <button
          type="button"
          class="px-4 py-2 min-w-32 inline-block bg-gray-600 text-white rounded-lg mt-3 ml-2"
          @click="$router.go(-1)"
        >
          Cancel
        </button>
      </div>
    </form>
  </MainLayout>
</template>

<style scoped>
.scrollable-content {
  overflow-y: auto;
}
</style>
