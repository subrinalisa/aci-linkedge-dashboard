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
        class="flex items-center justify-center p-3 bg-blue-400 opacity-70 text-white rounded-full animate-bounce hover:bg-blue-600 transition duration-300 border absolute top-1/2 right-0 -translate-y-1/2"
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
        class="flex items-center justify-center p-3 bg-blue-400 opacity-70 text-white rounded-full animate-bounce hover:bg-blue-600 transition duration-300 absolute top-1/2 left-0 -translate-y-1/2"
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
        v-if="pages.length > 1 && deviceType == 'Mobile'"
        class="fixed bottom-[20px] left-1/2 right-0 -translate-x-1/2 flex justify-center lg:hidden z-40 max-w-[300px]"
      >
        <select
          v-model="selectedPage"
          class="p-2 rounded-md bg-white shadow w-full"
        >
          <option v-for="page in pages" :key="page.name" :value="page.name">
            {{ page.displayName }}
          </option>
        </select>
      </div>
    </div>
  </div>
  <a-button
    htmlType="button"
    aria-label="Open feedback form"
    class="fixed bottom-[80px] right-6 md:bottom-8 md:right-8 z-50 inline-flex items-center gap-2 rounded-full px-6 py-3 bg-indigo-600 !text-white shadow-lg hover:bg-indigo-700 hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 active:scale-95 transition h-auto opacity-40"
    :loading="feedback_data_loading"
    @click="handleFeedback"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
        d="M7 8h10M7 12h6m-8 8l-2 2V6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H7z"
      />
    </svg>
    <span class="hidden sm:inline">Feedback</span>
  </a-button>
  <a-modal v-model:open="open_feedback" title="" :footer="null">
    <h2 class="font-medium text-lg text-indigo-600" v-if="feedback_data.length">
      Previous Feedback
    </h2>

    <!-- Chat thread -->
    <div ref="chatBox" class="capitalize">
      <div
        v-if="feedback_data.length == 0"
        class="text-gray-500 text-left mb-5"
      >
        <a-empty>
          <template #description>
            <span> No Previous Feedback available </span>
          </template>
        </a-empty>
      </div>

      <div
        v-for="(msg, i) in feedback_data"
        :key="i"
        class="mb-3 flex capitalize"
        :class="msg.user_id == userInfo?.id ? 'justify-end' : 'justify-start'"
      >
        <!-- Avatar (optional) -->
        <div v-if="msg?.user_id !== userInfo?.id" class="mr-2">
          <div
            class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm"
          >
            {{ msg?.user?.name?.slice(0, 1) }}
          </div>
        </div>

        <!-- Bubble -->
        <div
          class="max-w-[75%] rounded-2xl px-3 py-2 shadow-sm"
          :class="
            msg.user_id == userInfo?.id
              ? 'bg-indigo-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          "
        >
          <div class="whitespace-pre-line">{{ msg?.feedback }}</div>
          <div class="mt-1 text-[11px] opacity-75 text-right">
            {{ moment(msg.created_at).format("ll") }}
          </div>
        </div>

        <div v-if="msg?.user_id == userInfo?.id" class="ml-2">
          <div
            class="h-8 w-8 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-700 text-sm"
            :title="msg?.user?.name"
          >
            {{ msg?.user?.name?.slice(0, 1) }}
          </div>
        </div>
      </div>
    </div>
    <h2 class="font-medium text-lg text-indigo-600">Submit Your Feedback</h2>
    <form @submit.prevent="submitFeedback()">
      <div class="mb-4">
        <label class="block my-2">Your Message</label>
        <textarea
          rows="2"
          class="border w-full rounded-md p-3"
          placeholder="Enter here..."
          v-model="feedbackData.feedback"
          required
        ></textarea>
      </div>
      <a-button
        class="bg-indigo-600 !text-white px-8 py-2 rounded-md h-auto"
        htmlType="submit"
        :loading="feedback_loading"
      >
        Submit
      </a-button>
    </form>
  </a-modal>
</template>

<script setup>
import * as pbi from "powerbi-client";
import axios from "axios";
import { apiBase } from "@/config";
import { ref, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { showNotification } from "@/utilities/notification";
import Cookies from "js-cookie";
import moment from "moment";

const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const route = useRoute();
const config = {
  headers: {
    Authorization: `Bearer ${Cookies.get("token")}`,
  },
};
// Feedback
const open_feedback = ref(false);
const feedbackData = ref({
  feedback: "",
  menu: "",
});
const feedback_loading = ref(false);
const feedback_data = ref([]);
const feedback_data_loading = ref(false);

const handleFeedback = async () => {
  const activePage = await reportInstance.getActivePage();
  console.log("Active Page Name:", activePage?.displayName);
  feedbackData.value.menu = activePage?.displayName;

  feedback_data_loading.value = true;
  try {
    const res = await axios.get(
      `${apiBase}/get-permission-feedback/${route?.params?.id}?menu=${feedbackData.value.menu}`,
      config
    );
    feedback_data_loading.value = false;
    feedback_data.value = res?.data;
  } catch (err) {
    feedback_data_loading.value = false;
    feedback_data.value = [];
  }
  open_feedback.value = true;
};

const submitFeedback = async () => {
  const activePage = await reportInstance.getActivePage();
  console.log("Active Page Name:", activePage?.displayName);
  feedbackData.value.menu = activePage?.displayName;
  feedback_loading.value = true;
  try {
    const res = await axios.put(
      `${apiBase}/permission-feedback/${route?.params?.id}?feedback=${feedbackData.value.feedback}&menu=${feedbackData.value.menu}`,
      "",
      config
    );

    feedback_loading.value = false;
    showNotification(res?.data?.status?.toLowerCase(), res?.data?.message);
    if (res?.data?.status?.toLowerCase() == "success") {
      feedbackData.value = {
        feedback: "",
        menu: "",
      };
    }
  } catch (err) {
    feedback_loading.value = false;
    showNotification("error", err?.response?.data?.message || err?.message);
  }
  open_feedback.value = false;
};

const allpermissions = ref(JSON.parse(localStorage.getItem("all_permissions")));
let iframeUrl = ref("");

const reportData = ref(null);
const reportType = ref("");
const reportId = ref("");
const groupId = ref("");
const reportCategory = ref("");

const deviceType = ref("");

const pages = ref([]);
const selectedPage = ref("");

const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/tablet|ipad/.test(userAgent)) {
    return "Tablet";
  }

  if (/android/.test(userAgent)) {
    // Check if it's Android Tablet (no 'mobile' keyword in userAgent ususerAgentlly means tablet)
    if (!/mobile/.test(userAgent)) {
      return "Tablet";
    }
    return "Mobile";
  }

  if (/iphone|ipod|blackberry|opera mini|windows phone/.test(userAgent)) {
    return "Mobile";
  }

  return "Laptop/Desktop";
};

// const getDeviceType = () => {
//   const userAgent = navigator.userAgent.toLowerCase();
//   if (
//     /mobile|android|iphone|ipad|ipod|blackberry|opera mini|windows phone/.test(
//       userAgent
//     )
//   ) {
//     if (/tablet|ipad/.test(userAgent)) {
//       return "Tablet";
//     }
//     return "Mobile";
//   }
//   return "Laptop/Desktop";
// };

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
      if (deviceType.value == "Mobile") {
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
        const loadedPages = await reportInstance.getPages();
        pages.value = loadedPages;

        const activePage = await reportInstance.getActivePage();
        console.log("Active Page Name:", activePage?.displayName);

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
