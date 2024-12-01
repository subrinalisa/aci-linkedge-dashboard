<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const allpermissions = ref(JSON.parse(localStorage.getItem("all_permissions")));

const reportData = ref(null);

// Function to update reportData based on route params
const updateReportData = () => {
  const id = route?.params?.id?.replace(/_/g, " ");
  reportData.value = allpermissions.value.find((item) => item.name === id) || "";
};

// Watch for route parameter changes and update reportData
watch(() => route.params.id, updateReportData, { immediate: true });
</script>

<template>
  <MainLayout>
    <template v-if="!reportData">
      <h2 class="text-red-600 mb-3 uppercase">Invalid Report Request</h2>
      <button type="button" class="c-btn" @click="$router.go(-1)">go back</button>
    </template>
    <template v-else>
      <div class="md:flex justify-between items-center">
        <h2 class="title mb-3">{{ $route?.params?.id?.replace(/_/g, " ") }}</h2>
        <button type="button" class="c-btn mb-3" @click="$router.go(-1)">Back</button>
      </div>
      <div v-if="!reportData?.url && !reportData?.secondary_url">
        No URL Found in primary or secondary
      </div>
      <div class="video-container" v-else>
        <iframe
          class="w-full c-height block"
          :src="reportData?.url"
          frameborder="0"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    </template>
  </MainLayout>
</template>

<style scoped>
.c-height {
  height: calc(100vh - 200px);
}
</style>
