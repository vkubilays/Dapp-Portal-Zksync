<template>
  <CommonModal
    v-if="status !== 'done'"
    :opened="opened"
    :close-on-background-click="status === 'not-started'"
    class="confirm-deposit-transaction-modal"
    title="Confirm transaction"
    @close="closeModal"
  >
    <div class="flex h-full flex-col overflow-auto">
      <template v-if="transaction">
        <CommonCardWithLineButtons>
          <AddressCardParsed
            :address="account.address!"
            :destination="destinations.ethereum"
            :tooltip="`Add funds from ${destinations.ethereum.label} (L1)`"
          />
          <div class="-mx-1 border-b border-dashed"></div>
          <TokenBalance v-bind="transaction.token" as="div" :amount="transaction.amount" />
        </CommonCardWithLineButtons>
        <TransactionItemIcon :icon="ArrowDownIcon" />
        <CommonCardWithLineButtons>
          <AddressCardParsed
            :address="transaction.to"
            :destination="destinations.era"
            :tooltip="`Add funds to ${destinations.era.label} (L2)`"
          />
        </CommonCardWithLineButtons>
      </template>

      <TransactionFeeDetails class="my-2" label="Fee:" :fee-token="feeToken" :fee-amount="lastFee" />

      <div class="sticky bottom-0 z-[1] mt-auto w-full bg-gray bg-opacity-60 backdrop-blur-sm">
        <div class="mx-4 mb-3 border-t border-dashed border-gray-300"></div>
        <TransactionFeeDetails
          v-for="(item, index) in totalOfEachToken"
          class="-my-0.5"
          :key="item.token.address"
          :label="index === 0 ? 'Total:' : ''"
          :fee-token="item.token"
          :fee-amount="item.amount"
        />
        <transition v-bind="TransitionAlertScaleInOutTransition">
          <div v-if="!buttonDisabled && newFeeAlert" class="mx-4 mt-3">
            <CommonAlert variant="warning" :icon="ExclamationCircleIcon">
              <p>Fee has changed since you started the transaction. Please confirm the updated fee to proceed.</p>
              <CommonButton @click="newFeeAlert = false">Confirm</CommonButton>
            </CommonAlert>
          </div>
        </transition>
        <div v-if="error" class="mx-4">
          <CommonErrorBlock :retry-button="false" class="mt-3">
            {{ error.message }}
          </CommonErrorBlock>
        </div>
        <CommonButton
          :disabled="buttonDisabled || newFeeAlert || status !== 'not-started'"
          class="mx-auto mt-3"
          variant="primary-solid"
          @click="makeTransaction"
        >
          <transition v-bind="TransitionPrimaryButtonText" mode="out-in">
            <span v-if="status === 'processing'">Processing...</span>
            <span v-else-if="status === 'waiting-for-signature'">Waiting for confirmation</span>
            <span v-else>Add funds to {{ destinations.era.label }}</span>
          </transition>
        </CommonButton>
        <CommonHeightTransition :opened="status === 'waiting-for-signature'">
          <div class="text-center text-sm font-medium text-gray-500">
            <div class="pt-1"></div>
            Confirm this transaction in your {{ walletName }} wallet
          </div>
        </CommonHeightTransition>
      </div>
    </div>
  </CommonModal>

  <CommonModal v-else opened :closable="false" class="deposit-transaction-successful-modal" title="">
    <template #animation>
      <AnimationsProgressPlane class="w-72" />
    </template>

    <div class="flex h-full flex-col overflow-auto">
      <div class="h2 text-center sm:h1">Transaction submitted</div>
      <CommonCardWithLineButtons v-if="transaction">
        <TransactionLineItem
          :icon="transactionReceiptIcon"
          :transaction-url="`${blockExplorerUrl}/tx/${ethTransactionHash}`"
        >
          <template #top-left>
            <div class="transaction-line-label">Deposit</div>
          </template>
          <template #top-right>
            <TokenAmount
              :token="transaction.token"
              :amount="transaction.amount"
              :direction="transactionReceiptDirection"
            />
          </template>
          <template #bottom-right>
            <TotalPrice
              :token="transaction.token"
              :amount="transaction.amount"
              :direction="transactionReceiptDirection"
              :loading="transaction.token.price === 'loading'"
            />
          </template>
        </TransactionLineItem>
      </CommonCardWithLineButtons>

      <CommonAlert class="mt-3" variant="neutral" :icon="InformationCircleIcon">
        <p>
          Your funds will be available on <span class="font-medium">{{ destinations.era.label }}</span> (L2) after the
          transaction is committed on <span class="font-medium">{{ destinations.ethereum.label }}</span> (L1) and then
          processed on <span class="font-medium">{{ destinations.era.label }}</span> (L2). You are free to close this
          page.
        </p>
        <a :href="`${blockExplorerUrl}/tx/${ethTransactionHash}`" target="_blank" class="alert-link">
          Track status
          <ArrowUpRightIcon class="ml-1 h-3 w-3" />
        </a>
      </CommonAlert>

      <div class="sticky bottom-0 z-[1] mt-auto flex w-full flex-col items-center">
        <CommonButton as="RouterLink" :to="{ name: 'index' }" class="mx-auto mt-8" variant="primary-solid">
          Go to Home page
        </CommonButton>
      </div>
    </div>
  </CommonModal>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  PlusIcon,
} from "@heroicons/vue/24/outline";
import { BigNumber } from "ethers";
import { storeToRefs } from "pinia";

import TokenAmount from "@/components/transaction/transactionLineItem/TokenAmount.vue";
import TotalPrice from "@/components/transaction/transactionLineItem/TotalPrice.vue";

import useTransaction from "@/composables/zksync/era/deposit/useTransaction";

import type { DepositFeeValues } from "@/composables/zksync/era/deposit/useFee";
import type { Token } from "@/types";
import type { BigNumberish } from "ethers";
import type { PropType } from "vue";

import { useDestinationsStore } from "@/store/destinations";
import { useNetworkStore } from "@/store/network";
import { useOnboardStore } from "@/store/onboard";
import { usePreferencesStore } from "@/store/preferences";
import { useEraEthereumBalanceStore } from "@/store/zksync/era/ethereumBalance";
import { useEraTransactionsHistoryStore } from "@/store/zksync/era/transactionsHistory";
import { useEraWalletStore } from "@/store/zksync/era/wallet";
import { TransitionPrimaryButtonText } from "@/utils/transitions";

export type ConfirmationModalTransaction = {
  to: string;
  token: Token;
  amount: BigNumberish;
};

const props = defineProps({
  opened: {
    type: Boolean,
  },
  transaction: {
    type: Object as PropType<ConfirmationModalTransaction>,
  },
  fee: {
    type: String as PropType<BigNumberish>,
  },
  feeToken: {
    type: Object as PropType<Token>,
  },
  feeValues: {
    type: Object as PropType<DepositFeeValues>,
  },
  buttonDisabled: {
    type: Boolean,
    default: false,
  },
  estimate: {
    type: Function as PropType<() => Promise<void>>,
    required: true,
  },
});

const emit = defineEmits<{
  (eventName: "update:opened", value: boolean): void;
}>();
const closeModal = () => emit("update:opened", false);

const eraTransactionsHistoryStore = useEraTransactionsHistoryStore();
const walletEraStore = useEraWalletStore();
const eraEthereumBalanceStore = useEraEthereumBalanceStore();
const { account, walletName } = storeToRefs(useOnboardStore());
const { destinations } = storeToRefs(useDestinationsStore());
const { blockExplorerUrl } = storeToRefs(useNetworkStore());
const { previousTransactionAddress } = storeToRefs(usePreferencesStore());
const { status, error, ethTransactionHash, commitTransaction } = useTransaction(walletEraStore.getL1Signer);

const lastFee = ref(props.fee);
watch(
  () => props.fee,
  (newFee) => {
    if (newFee) {
      lastFee.value = newFee;
    }
  }
);

const newFeeAlert = ref(false);

const totalOfEachToken = computed<{ token: Token; amount: BigNumberish }[]>(() => {
  const tokenBySymbol: { [symbol: string]: Token } = {};
  if (props.transaction) {
    tokenBySymbol[props.transaction.token.symbol] = props.transaction.token;
  }
  if (props.feeToken) {
    tokenBySymbol[props.feeToken.symbol] = props.feeToken;
  }

  const totalBySymbol: { [symbol: string]: BigNumberish } = {};
  const addToTotal = (tokenSymbol: string, amount: BigNumberish) => {
    if (totalBySymbol[tokenSymbol]) {
      totalBySymbol[tokenSymbol] = BigNumber.from(totalBySymbol[tokenSymbol]).add(amount);
    } else {
      totalBySymbol[tokenSymbol] = amount;
    }
  };

  if (props.transaction) {
    addToTotal(props.transaction.token.symbol, props.transaction.amount);
  }
  if (props.feeToken && lastFee.value) {
    addToTotal(props.feeToken.symbol, lastFee.value);
  }

  return Object.entries(totalBySymbol).map(([symbol, amount]) => ({
    token: tokenBySymbol[symbol],
    amount: amount.toString(),
  }));
});

const transactionReceiptDirection = computed(() => {
  if (!props.transaction) return undefined;
  return props.transaction.to === account.value.address ? "in" : "out";
});
const transactionReceiptIcon = computed(() => {
  if (!transactionReceiptDirection.value) {
    return undefined;
  }
  return transactionReceiptDirection.value === "in" ? PlusIcon : ArrowRightIcon;
});

const makeTransaction = async () => {
  if (!props.feeToken || !props.fee || !props.feeValues) return;

  const prevFee = BigNumber.from(lastFee.value);

  await props.estimate();

  if (prevFee.lt(props.fee)) {
    newFeeAlert.value = true;
  }

  if (newFeeAlert.value || props.buttonDisabled) return;

  const tx = await commitTransaction(props.transaction!, props.feeValues);

  if (status.value === "done") {
    previousTransactionAddress.value = props.transaction!.to;
  }

  if (tx) {
    tx.waitL1Commit()
      .then(() => {
        eraTransactionsHistoryStore.reloadRecentTransactions();
        walletEraStore.requestBalance({ force: true });
        eraEthereumBalanceStore.requestBalance({ force: true });
      })
      .catch((err) => {
        error.value = err as Error;
        status.value = "not-started";
      });
  }
};
</script>

<style lang="scss">
.confirm-deposit-transaction-modal .modal-card {
  @apply grid h-full grid-rows-[max-content_1fr];
}
.deposit-transaction-successful-modal .modal-card {
  @apply grid h-full grid-rows-[0_max-content_1fr];
}
</style>
