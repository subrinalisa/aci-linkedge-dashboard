<template>
  <div>
    <h3 class="text-md font-semibold mb-2">
      <span class="text-blue-500">Image</span>
    </h3>
    <div class="mb-4">
      <input type="file" multiple @change="onFileChange" class="mb-4">
      <div class="flex space-x-4">
        <div v-for="(image, index) in images" :key="index" class="w-16 h-16 border border-gray-400 flex items-center justify-center">
          <img :src="image.src" alt="Image" class="w-full h-full object-contain" />
        </div>
      </div>
    </div>
    <div class="flex justify-end space-x-4">
        <button type="button" class="px-4 py-2 bg-[#000180] text-white rounded-lg">Save</button>
      </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      images: [],
    };
  },
  methods: {
    onFileChange(event) {
      const files = event.target.files;
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.images.push({ src: e.target.result });
        };
        reader.readAsDataURL(files[i]);
      }
    },
  },
};
</script>

<style scoped>
/* Add any additional styling here */
</style>
