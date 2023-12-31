<template>
  <CommonModal v-bind="$attrs" :closable="false" class="transaction-successful-modal" title="">
    <template #animation>
      <AnimationsProgressPlane class="w-72" />
    </template>

    <div class="flex h-full flex-col overflow-auto">
      <div class="h2 text-center sm:h1">Transaction submitted</div>
      <CommonCardWithLineButtons v-if="transactionsRequestInProgress">
        <TokenBalanceLoader v-for="index in transactionHashes.length" :key="index" />
      </CommonCardWithLineButtons>
      <CommonCardWithLineButtons v-else-if="transactionsRequestError">
        <CommonErrorBlock class="m-2" @try-again="fetch">
          {{ transactionsRequestError.message }}
        </CommonErrorBlock>
      </CommonCardWithLineButtons>
      <template v-else>
        <CommonCardWithLineButtons>
          <ZkSyncLiteTransactionLineItem v-for="(item, index) in transactions" :key="index" :transaction="item" />
        </CommonCardWithLineButtons>
      </template>

      <CommonAlert class="mt-3" variant="neutral" :icon="InformationCircleIcon">
        <p>
          It can take <span class="font-medium">up to 7 hours</span> until funds arrive on
          <span class="font-medium">{{ destinations.ethereum.label }}</span> (L1)
        </p>
        <a :href="LITE_WITHDRAWAL_TIMES" target="_blank" class="alert-link">
          Learn more
          <ArrowUpRightIcon class="ml-1 h-3 w-3" />
        </a>
      </CommonAlert>

      <div
        class="sticky bottom-0 z-[1] mt-auto flex w-full flex-col items-center bg-gray bg-opacity-60 backdrop-blur-sm"
      >
        <NuxtLink :to="{ name: 'transaction-zksync-lite' }" class="link mb-2 mt-2 text-sm underline-offset-2">
          Make another transaction
        </NuxtLink>
        <CommonButton as="RouterLink" :to="{ name: 'index' }" class="mx-auto" variant="primary-solid">
          Go to Home page
        </CommonButton>
      </div>
    </div>
  </CommonModal>
</template>

<script lang="ts" setup>
import { watch } from "vue";

import { ArrowUpRightIcon, InformationCircleIcon } from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";

import ZkSyncLiteTransactionLineItem from "@/components/transaction/zksync/lite/ZkSyncLiteTransactionLineItem.vue";

import useTransactionsReceipt from "@/composables/zksync/lite/useTransactionsReceipts";

import type { PropType } from "vue";

import { useDestinationsStore } from "@/store/destinations";
import { useLiteProviderStore } from "@/store/zksync/lite/provider";
import { useLiteTokensStore } from "@/store/zksync/lite/tokens";
import { LITE_WITHDRAWAL_TIMES } from "@/utils/doc-links";

const props = defineProps({
  transactionHashes: {
    type: Array as PropType<string[]>,
    required: true,
  },
});

const { destinations } = storeToRefs(useDestinationsStore());
const liteProviderStore = useLiteProviderStore();
const liteTokensStore = useLiteTokensStore();
const { tokens } = storeToRefs(liteTokensStore);
const { transactions, transactionsRequestInProgress, transactionsRequestError, requestTransactions } =
  useTransactionsReceipt(liteProviderStore.requestProvider, () =>
    liteTokensStore.requestTokens().then(() => (tokens.value ? Object.values(tokens.value) : []))
  );

const fetch = () => {
  requestTransactions(props.transactionHashes);
};

watch(
  () => props.transactionHashes,
  () => {
    fetch();
  },
  { immediate: true }
);
</script>

<style lang="scss">
.transaction-successful-modal .modal-card {
  @apply grid h-full grid-rows-[0_max-content_1fr];
}
</style>
