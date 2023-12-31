<template>
  <div>
    <CommonContentBlock>
      <CommonTotalBalance :balance="balance" :loading="loading" :error="balanceError" />
      <CommonButtonsLineGroup class="my-4">
        <CommonButton as="RouterLink" :to="{ name: 'transaction-zksync-era-receive' }">
          <template #icon>
            <ArrowDownIcon aria-hidden="true" />
          </template>
          <template #default>Receive</template>
        </CommonButton>
        <CommonButton as="RouterLink" :to="{ name: 'transaction-zksync-era' }">
          <template #icon>
            <PaperAirplaneIcon aria-hidden="true" />
          </template>
          <template #default>Send</template>
        </CommonButton>
        <CommonButton as="RouterLink" :to="{ name: 'transaction-zksync-era-swap' }">
          <template #icon>
            <ArrowsRightLeftIcon aria-hidden="true" />
          </template>
          <template #default>Swap</template>
        </CommonButton>
      </CommonButtonsLineGroup>

      <!-- Tokens container -->
      <div>
        <div class="flex items-center justify-between py-4">
          <h2 class="text-sm text-gray-secondary">Balances</h2>
          <CommonLabelButton as="RouterLink" :to="{ name: 'balances' }">View all</CommonLabelButton>
        </div>
        <div class="-mx-2 -mt-1 -mb-3">
          <template v-if="loading">
            <TokenBalanceLoader v-for="index in 2" :key="index" send-route-name />
          </template>
          <div v-else-if="balanceError" class="m-3 mb-2.5 -mt-1">
            <CommonErrorBlock @try-again="fetch">
              {{ balanceError.message }}
            </CommonErrorBlock>
          </div>
          <template v-else-if="displayedBalances.length">
            <TokenBalance
              v-for="item in displayedBalances"
              as="div"
              :key="item.address"
              send-route-name="transaction-zksync-era"
              v-bind="item"
            />
          </template>
          <template v-else>
            <CommonEmptyBlock class="mx-3 mb-3 mt-1">
              You don't have any balances on <span class="font-medium">{{ destinations.era.label }}</span> (L2)
              <br />
              <span class="mt-1.5 inline-block">
                Proceed to
                <NuxtLink class="link" :to="{ name: 'transaction-zksync-era-receive' }">Add funds</NuxtLink> page to add
                balance to your account
              </span>
            </CommonEmptyBlock>
          </template>
        </div>
      </div>
    </CommonContentBlock>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount } from "vue";

import { ArrowDownIcon, ArrowsRightLeftIcon, PaperAirplaneIcon } from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";

import useInterval from "@/composables/useInterval";
import useSingleLoading from "@/composables/useSingleLoading";

import { useDestinationsStore } from "@/store/destinations";
import { useOnboardStore } from "@/store/onboard";
import { useEraWalletStore } from "@/store/zksync/era/wallet";
import { parseTokenAmount, removeSmallAmount } from "@/utils/formatters";
import { isOnlyZeroes } from "@/utils/helpers";

const onboardStore = useOnboardStore();
const walletEraStore = useEraWalletStore();
const { balance, balanceInProgress, balanceError, allBalancePricesLoaded } = storeToRefs(walletEraStore);
const { destinations } = storeToRefs(useDestinationsStore());

const displayedBalances = computed(() => {
  return balance.value.filter(({ amount, decimals, price }) => {
    const decimalAmount =
      typeof price === "number" ? removeSmallAmount(amount, decimals, price) : parseTokenAmount(amount, decimals);
    if (!isOnlyZeroes(decimalAmount)) {
      return true;
    }
    return false;
  });
});

const { loading, reset: resetSingleLoading } = useSingleLoading(
  computed(() => balanceInProgress.value || !allBalancePricesLoaded.value)
);

const fetch = () => {
  walletEraStore.requestBalance();
};
fetch();

const { reset: resetAutoUpdate, stop: stopAutoUpdate } = useInterval(() => {
  fetch();
}, 60000);

const unsubscribe = onboardStore.subscribeOnAccountChange((newAddress) => {
  if (!newAddress) return;
  resetSingleLoading();
  resetAutoUpdate();
  fetch();
});

onBeforeUnmount(() => {
  stopAutoUpdate();
  unsubscribe();
});
</script>

<style lang="scss" scoped></style>
