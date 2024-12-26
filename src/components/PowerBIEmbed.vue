<template>
  <div>
    <a-skeleton v-if="isLoading" />
    <div ref="embedContainer" class="h-[100vh] w-full" v-else></div>
  </div>
</template>

<script setup>
import * as pbi from "powerbi-client";
import axios from "axios";
import { apiBase, config } from "@/config";
import { ref, onMounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { showNotification } from "@/utilities/notification";

const route = useRoute();
const { id } = route?.params;
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

// Power BI
const accessToken = ref("");
const embedUrl = ref("");
const embedContainer = ref(null);
const isLoading = ref(false);

const fetchEmbedDetails = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(
      `${apiBase}/get-embed-token?groupId=${groupId.value}&reportId=${reportId.value}`,
      config
    );
    isLoading.value = false;

    if (
      response?.data?.status == "success" &&
      (reportType.value === "PowerBI Report" ||
        reportType.value === "PowerBI Dashboard" ||
        reportType.value === "PowerBI Tile")
    ) {
      accessToken.value = response?.data?.embedToken;
      embedUrl.value = `https://app.powerbi.com/reportEmbed?groupId=${response?.data?.groupId}&reportId=${response?.data?.reportId}`;
      reportId.value = response?.data?.reportId;
    }
  } catch (error) {
    console.error("Error fetching embed details:", error.message);
    isLoading.value = false;

    if (error?.response?.data?.status == "error") {
      showNotification(
        error?.response?.data?.status,
        error?.response?.data?.message?.groupId?.at(0) ||
          error?.response?.data?.message?.reportId?.at(0) ||
          "Error in getting the report. Possible reason can be report id changed or developer token finished. Please contact MIS."
      );
    }
  }
};

const embedReport = async () => {
  try {
    await fetchEmbedDetails();

    nextTick(() => {
      let embedConfig = {};
      if (deviceType.value == "Mobile" || deviceType.value === "Tablet") {
        embedConfig = {
          type: reportCategory.value,
          tokenType: pbi.models.TokenType.Embed,
          accessToken: accessToken.value,
          embedUrl: embedUrl.value,
          id: reportId.value,
          permissions: pbi.models.Permissions.All,
          settings: {
            filterPaneEnabled: false,
            navContentPaneEnabled: true,
            layoutType: pbi.models.LayoutType.MobilePortrait,
            // panes: {
            //   filters: { visible: true },
            //   pageNavigation: { visible: true },
            // },
          },
        };
      } else {
        embedConfig = {
          type: reportCategory.value,
          tokenType: pbi.models.TokenType.Embed,
          accessToken: accessToken.value,
          embedUrl: embedUrl.value,
          id: reportId.value,
          permissions: pbi.models.Permissions.All,
          settings: {
            filterPaneEnabled: false,
            navContentPaneEnabled: true,
            // panes: {
            //   filters: { visible: true },
            //   pageNavigation: { visible: true },
            // },
          },
        };
      }

      const powerbi = new pbi.service.Service(
        pbi.factories.hpmFactory,
        pbi.factories.wpmpFactory,
        pbi.factories.routerFactory
      );

      // Embed the report
      const report = powerbi.embed(embedContainer.value, embedConfig);

      // Optional: Handle events
      report.on("loaded", () => {
        console.log("Report loaded successfully");
      });
      report.on("error", (event) => {
        console.error("Error embedding report", event.detail);
      });
    });
  } catch (error) {
    console.error("Error embedding report:", error.message);
  }
};
const updateReportData = async () => {
  reportData.value = allpermissions.value.find((item) => item.id == route.params.id);
  reportId.value = reportData.value?.report_id;
  groupId.value = reportData.value?.module;
  reportType.value = reportData.value?.report_type;
  deviceType.value = getDeviceType();
  console.log("deviceType", deviceType.value);

  if (reportType.value === "PowerBI Report") reportCategory.value = "report";
  else if (reportType.value === "PowerBI Dashboard") reportCategory.value = "dashboard";
  else if (reportType.value === "PowerBI Tile") reportCategory.value = "tile";

  await embedReport();
};
watch(() => route.params.id, updateReportData, { immediate: true });
// onMounted(() => updateReportData());

// onMounted(async () => {
//   await embedReport();
// });
const toggleFullscreen = () => {
  const element = embedContainer.value;
  if (!document.embedContainer) {
    // Enter fullscreen
    element.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  } else {
    // Exit fullscreen
    document.exitFullscreen().catch((err) => {
      console.error(`Error attempting to exit full-screen mode: ${err.message}`);
    });
  }
};
</script>
