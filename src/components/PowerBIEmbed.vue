<!-- <template>
  <a-skeleton v-if="isLoading" />
  <div class="video-container" v-if="!isLoading && iframeUrl">
    <iframe
      class="w-full c-height block"
      :src="iframeUrl"
      frameborder="0"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    ></iframe>
  </div>
  <div ref="embedContainer" class="h-[100vh] w-full" v-if="!isLoading && !iframeUrl"></div>
</template> -->

<template>
  <div>
    <a-skeleton v-if="isLoading" />
    <div class="video-container" v-if="!isLoading && iframeUrl">
      <iframe
        class="w-full c-height block"
        :src="iframeUrl"
        frameborder="0"
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    </div>
    <div v-if="!isLoading && !iframeUrl" class="relative">
      <button
        class="flex items-center justify-center p-3 bg-blue-400 opacity-70 text-white rounded-full animate-bounce hover:bg-blue-600 transition duration-300 border absolute top-1/2 right-0 lg:hidden"
        @click="onSwipeLeft"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </button>
      <button
        class="flex items-center justify-center p-3 bg-blue-400 opacity-70 text-white rounded-full animate-bounce hover:bg-blue-600 transition duration-300 absolute top-1/2 left-0 lg:hidden"
        @click="onSwipeRight"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7 16l-4-4m0 0l4-4m-4 4h18"
          />
        </svg>
      </button>

      <div
        ref="embedContainer"
        class="h-[90vh] w-full"
        v-touch:swipe.right="onSwipeRight"
        v-touch:swipe.left="onSwipeLeft"
      ></div>

      <!-- Page List Dropdown (Only show if multiple pages available) -->
      <div
        v-if="pages.length > 1"
        class="absolute bottom-3 left-0 right-0 flex justify-center lg:hidden"
      >
        <select v-model="selectedPage" class="p-2 rounded-md bg-white shadow">
          <option v-for="page in pages" :key="page.name" :value="page.name">
            {{ page.displayName }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as pbi from "powerbi-client";
import axios from "axios";
import { apiBase } from "@/config";
import { ref, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { showNotification } from "@/utilities/notification";
import Cookies from "js-cookie";

const config = {
  headers: {
    Authorization: `Bearer ${Cookies.get("token")}`,
  },
};

const route = useRoute();
const allpermissions = ref(JSON.parse(localStorage.getItem("all_permissions")));
let iframeUrl = ref("");

const reportData = ref(null);
const reportType = ref("");
const reportId = ref("");
const groupId = ref("");
const reportCategory = ref("");

const deviceType = ref("");

const pages = ref([]); // NEW ✨ to hold pages
const selectedPage = ref(""); // NEW ✨ to track selected page

const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (
    /mobile|android|iphone|ipad|ipod|blackberry|opera mini|windows phone/.test(
      userAgent
    )
  ) {
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

let reportInstance = null; // NEW ✨ to keep reference of report

const fetchEmbedDetails = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(
      `${apiBase}/get-embed-token?groupId=${groupId.value}&reportId=${reportId.value}`,
      config
    );
    isLoading.value = false;
    iframeUrl.value = "";

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
    console.log("response err", error);
    console.error("Error fetching embed details:", error.message);
    isLoading.value = false;
    iframeUrl.value =
      allpermissions.value.find((item) => item.id == route.params.id)?.url ||
      allpermissions.value.find((item) => item.id == route.params.id)
        ?.secondary_url;

    if (error?.response?.data?.status == "error" && !iframeUrl.value) {
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
          },
        };
      }

      const powerbiService = new pbi.service.Service(
        pbi.factories.hpmFactory,
        pbi.factories.wpmpFactory,
        pbi.factories.routerFactory
      );

      // Embed the report
      reportInstance = powerbiService.embed(embedContainer.value, embedConfig); // Save instance

      // Handle events
      reportInstance.on("loaded", async () => {
        console.log("Report loaded successfully");

        // Fetch pages after loading
        const loadedPages = await reportInstance.getPages();
        pages.value = loadedPages;
        if (pages.value.length > 0) {
          selectedPage.value = pages.value[0].name;
        }
      });

      reportInstance.on("error", (event) => {
        console.error("Error embedding report", event.detail);
      });
    });
  } catch (error) {
    console.error("Error embedding report:", error.message);
  }
};

const updateReportData = async () => {
  reportData.value = allpermissions.value.find(
    (item) => item.id == route.params.id
  );
  reportId.value = reportData.value?.report_id;
  groupId.value = reportData.value?.module;
  reportType.value = reportData.value?.report_type;
  deviceType.value = getDeviceType();
  console.log("deviceType", deviceType.value);

  if (reportType.value === "PowerBI Report") reportCategory.value = "report";
  else if (reportType.value === "PowerBI Dashboard")
    reportCategory.value = "dashboard";
  else if (reportType.value === "PowerBI Tile") reportCategory.value = "tile";

  await embedReport();
};

const changePage = async () => {
  // NEW ✨ function to change page
  const page = pages.value.find((p) => p.name === selectedPage.value);
  if (page) {
    await page.setActive();
  }
};

const onSwipeLeft = () => {
  console.log("swipe left");

  const currentIndex = pages.value.findIndex(
    (p) => p.name === selectedPage.value
  );
  if (currentIndex < pages.value.length - 1) {
    selectedPage.value = pages.value[currentIndex + 1].name;
  }
};

const onSwipeRight = () => {
  console.log("swipe right");
  const currentIndex = pages.value.findIndex(
    (p) => p.name === selectedPage.value
  );
  if (currentIndex > 0) {
    selectedPage.value = pages.value[currentIndex - 1].name;
  }
};

watch(() => selectedPage.value, changePage); // NEW ✨ Watcher

watch(() => route.params.id, updateReportData, { immediate: true });
</script>
