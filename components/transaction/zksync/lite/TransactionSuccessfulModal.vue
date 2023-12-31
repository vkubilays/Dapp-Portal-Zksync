<template>
  <CommonModal v-bind="$attrs" :closable="false" class="transaction-successful-modal" title="">
    <Vue3Lottie class="mx-auto -mt-14 -mb-16 w-72" :animation-data="SuccessConfetti" :loop="false" />

    <div class="flex h-full flex-col overflow-auto">
      <div class="h2 text-center sm:h1">Transaction completed</div>
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

      <slot name="after-transactions" />

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

import { storeToRefs } from "pinia";

import ZkSyncLiteTransactionLineItem from "@/components/transaction/zksync/lite/ZkSyncLiteTransactionLineItem.vue";

import useTransactionsReceipt from "@/composables/zksync/lite/useTransactionsReceipts";

import SuccessConfetti from "@/assets/lottie/success-confetti.json";

import type { PropType } from "vue";

import { useLiteProviderStore } from "@/store/zksync/lite/provider";
import { useLiteTokensStore } from "@/store/zksync/lite/tokens";

const props = defineProps({
  transactionHashes: {
    type: Array as PropType<string[]>,
    required: true,
  },
});

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
