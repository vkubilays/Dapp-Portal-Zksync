<template>
  <CommonModal
    v-model:opened="modalOpened"
    title="Network switched"
    @after-leave="networkStore.resetNetworkChangeWarning"
  >
    <p class="leading-normal">
      The selected network has been automatically changed from
      <span class="font-medium">{{ lastSelectedEthereumNetworkName }}</span> to
      <span class="font-medium">{{ selectedEthereumNetwork.name }}</span> since your last use of zkSync Plus.
    </p>
    <div class="mt-10 flex flex-col items-center">
      <a
        v-if="lastSelectedEthereumNetwork"
        :href="getNetworkUrl(lastSelectedEthereumNetwork, route.path)"
        class="link mb-2 text-sm underline-offset-2"
      >
        Return to {{ lastSelectedEthereumNetworkName }}
      </a>
      <CommonButton variant="primary-solid" @click="closeModal">
        Continue on {{ selectedEthereumNetwork.name }}
      </CommonButton>
    </div>
  </CommonModal>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

import { storeToRefs } from "pinia";

import { useRoute } from "#app";
import { useNetworkStore } from "@/store/network";
import { getNetworkUrl } from "@/utils/helpers";

const networkStore = useNetworkStore();
const {
  selectedEthereumNetwork,
  ethereumNetworkChangedWarning,
  lastSelectedEthereumNetworkName,
  lastSelectedEthereumNetwork,
} = storeToRefs(networkStore);

const route = useRoute();

const modalOpened = ref(ethereumNetworkChangedWarning.value);
watch(ethereumNetworkChangedWarning, (val) => {
  modalOpened.value = val;
});

const closeModal = () => {
  modalOpened.value = false;
};
</script>
