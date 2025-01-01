<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import PowerBIEmbed from "@/components/PowerBIEmbed.vue";
import { FullscreenOutlined, ReloadOutlined, RollbackOutlined } from "@ant-design/icons-vue";

const route = useRoute();
const allpermissions = ref(JSON.parse(localStorage.getItem("all_permissions")));

const reportData = ref(null);
const reportType = ref("");
const reportId = ref("");
const groupId = ref("");
const reportCategory = ref("");

const deviceType = ref("");

const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/mobile|android|iphone|ipad|ipod|blackberry|opera mini|windows phone/.test(userAgent)) {
    if (/tablet|ipad/.test(userAgent)) {
      return "Tablet";
    }
    return "Mobile";
  }
  return "Laptop/Desktop";
};

const updateReportData = () => {
  reportData.value = allpermissions.value.find((item) => item.id == route.params.id);
  reportId.value = reportData.value?.report_id;
  groupId.value = reportData.value?.module;
  reportType.value = reportData.value?.report_type;
  deviceType.value = getDeviceType();

  if (reportType.value === "PowerBI Report") reportCategory.value = "report";
  else if (reportType.value === "PowerBI Dashboard") reportCategory.value = "dashboard";
  else if (reportType.value === "PowerBI Tile") reportCategory.value = "tile";
};

watch(() => route.params.id, updateReportData, { immediate: true });

const toggleFullscreen = () => {
  const element = content.value;
  if (!document.fullscreenElement) {
    // Enter fullscreen
    element.style.height = "100vh";
    element.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  } else {
    // Exit fullscreen
    element.style.height = "";
    document.exitFullscreen().catch((err) => {
      console.error(`Error attempting to exit full-screen mode: ${err.message}`);
    });
  }
};

const refresh = () => {
  window.location.reload();
};
const content = ref();
</script>

<template>
  <MainLayout>
    <div class="md:flex justify-between items-center">
      <div>
        <h2 class="title mb-3">{{ reportData?.name }}</h2>
      </div>
      <div>
        <button
          type="button"
          class="edit_btn mr-3 mb-3"
          @click="toggleFullscreen"
          title="Full Screen"
        >
          <FullscreenOutlined class="align-baseline" />
        </button>
        <button type="button" class="del_btn mr-3 mb-3" title="Refresh" @click="refresh">
          <ReloadOutlined class="align-baseline" />
        </button>
        <button type="button" class="edit_btn mb-3" title="Back" @click="$router.go(-1)">
          <RollbackOutlined class="align-baseline" />
        </button>
      </div>
    </div>
    <div ref="content">
      <PowerBIEmbed
        v-if="
          reportType === 'PowerBI Report' ||
          reportType === 'PowerBI Dashboard' ||
          reportType === 'PowerBI Tile'
        "
        :groupId="groupId"
      />
      <div class="video-container" v-if="reportType == 'PowerBI URL'">
        <iframe
          class="w-full c-height block"
          :src="reportData?.secondary_url"
          frameborder="0"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
      <div class="video-container" v-if="reportType == 'Non Power BI'">
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
    </div>
  </MainLayout>
</template>
