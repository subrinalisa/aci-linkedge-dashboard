<script setup>
import MainLayout from "@/components/MainLayout.vue";
import { useDataStore } from "@/stores/data";
import moment from "moment";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const dataStore = useDataStore();
const { getInvoice } = dataStore;

const route = useRoute();
const { id } = route?.params;

const invoice = ref(null);

onMounted(async () => (invoice.value = await getInvoice(id)));
</script>

<template>
  <MainLayout>
    <div class="bg-white p-3 rounded">
      <div class="text-center mb-5">
        <p>Sales Receipt</p>
        <p>
          <strong>{{ moment(invoice?.sale_date).format("LLL") }}</strong>
        </p>
        <p>Sale ID: {{ id }}</p>
        <p class="capitalize">Employee: {{ invoice?.sold_user?.name }}</p>
      </div>

      <div class="mb-5">
        <h6 class="font-bold">Pharma POS</h6>
        <p>Dhaka</p>
        <p>018999</p>
      </div>

      <table class="w-full text-left">
        <thead>
          <tr>
            <th>Item Name</th>
            <th class="text-right">Price</th>
            <th class="text-right">Qty.</th>
            <th class="text-right">Disc %</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in invoice?.sale_products">
            <td>{{ product?.product_name }}</td>
            <td class="text-right">{{ product?.price }}</td>
            <td class="text-right">{{ product?.quantity }}</td>
            <td class="text-right">{{ product?.discount_percent || 0 }}</td>
            <td class="text-right">{{ product?.total }}</td>
          </tr>
        </tbody>
        <tfoot class="border-t border-dashed">
          <tr>
            <td colspan="3"></td>
            <td class="text-right">Total Payable</td>
            <td class="text-right">{{ invoice?.total }}</td>
          </tr>
          <tr>
            <td colspan="3"></td>
            <td class="text-right">Advance Payment</td>
            <td class="text-right">{{ invoice?.paid_amount || 0.0 }}</td>
          </tr>
          <tr>
            <td colspan="3"></td>
            <td class="text-right">Subtotal</td>
            <td class="text-right">{{ invoice?.sub_total }}</td>
          </tr>
          <tr>
            <td colspan="3"></td>
            <td colspan="2"><hr /></td>
          </tr>
          <tr>
            <td colspan="3"></td>
            <td class="text-right font-semibold">Total</td>
            <td class="text-right">{{ invoice?.total }}</td>
          </tr>

          <tr>
            <td colspan="3"></td>
            <td class="text-right">Cash</td>
            <td class="text-right">{{ invoice?.paid_amount || 0.0 }}</td>
          </tr>
          <tr>
            <td colspan="3"></td>
            <td class="text-right">Due</td>
            <td class="text-right">{{ invoice?.amount_due }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </MainLayout>
</template>
