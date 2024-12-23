<template>
  <div>
    <div ref="embedContainer" class="h-[82vh] w-full"></div>
    <!-- <button @click="embedReport" class="bg-blue-600 text-white border p-2">Embed Report</button> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as pbi from "powerbi-client";
import { apiBase, config } from "@/config";
import axios from "axios";

const accessToken = ref("");
const embedUrl = ref("");
const reportId = ref("");
const embedContainer = ref(null);

const fetchEmbedDetails = async () => {
  try {
    // Call the provided backend API endpoint
    const response = await axios.get(`${apiBase}/get-embed-token`, config);

    console.log(response?.data);
    accessToken.value = response?.data?.embedToken; // Ensure the key is correctly named in the backend response
    embedUrl.value = `https://app.powerbi.com/reportEmbed?groupId=${response?.data?.groupId}&reportId=${response?.data?.reportId}`;
    reportId.value = response?.data?.reportId;
  } catch (error) {
    console.error("Error fetching embed details:", error.message);
  }
};

const embedReport = async () => {
  try {
    // Fetch embed details first
    await fetchEmbedDetails();

    const embedConfig = {
      type: "report",
      tokenType: pbi.models.TokenType.Embed,
      accessToken: accessToken.value,
      embedUrl: embedUrl.value,
      id: reportId.value,
      settings: {
        panes: {
          filters: { visible: true },
          pageNavigation: { visible: true },
        },
      },
    };

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
  } catch (error) {
    console.error("Error embedding report:", error.message);
  }
};

// Automatically fetch and embed the report when the component is mounted
const report_id = ref();
const module = ref();
onMounted(() => {
  embedReport();
  const result = JSON.parse(localStorage.getItem("all_permissions"))?.find((item) => item.id == id);
  console.log(result);
});
</script>
