<template>
  <LoadersConnecting />
  <ModalNetworkChangedWarning v-if="!isConnectingWallet" />
  <LoginLayout v-if="!account.isConnected">
    <LoginPage />
  </LoginLayout>
  <div class="app-layout" v-else>
    <ModalWalletWarning />
    <Sidebar />
    <main class="app-layout-main">
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { watch } from "vue";

import { storeToRefs } from "pinia";

import { useRoute } from "#app";
import LoginLayout from "@/layouts/login.vue";
import { useOnboardStore } from "@/store/onboard";
import { usePreferencesStore } from "@/store/preferences";
import LoginPage from "@/views/Login.vue";

const route = useRoute();
const { account, isConnectingWallet } = storeToRefs(useOnboardStore());
const { version } = storeToRefs(usePreferencesStore());
watch(
  () => route.name,
  (routeName) => {
    if (!routeName) return;

    if (/(-lite-|.*-lite$)/.test(routeName.toString())) {
      version.value = "lite";
    } else if (/(-era-|.*-era$)/.test(routeName.toString())) {
      version.value = "era";
    }
  },
  { immediate: true }
);
watch(
  version,
  () => {
    document.documentElement.classList.remove("lite", "era");
    document.documentElement.classList.add(version.value);
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.app-layout {
  @apply mx-auto grid;
  min-height: 100vh;
  min-height: 100dvh;
  grid-template-areas:
    "main"
    "main-actions"
    "menu"
    "side"
    "toast";
  grid-template-rows: 1fr auto auto 0px 0px;

  @media screen and (min-width: 720px) {
    --rui-layout-nav-gap: 1fr;
    --rui-layout-side-gap: var(--rui-layout-nav-gap);
    --rui-layout-nav-size: 5.5rem;
    --rui-layout-main-size: 31.25rem;
    --rui-layout-side-size: minmax(var(--rui-layout-nav-size), auto);
    grid-template-areas:
      "menu . main . ."
      "menu . main-actions . ."
      "side side side side side"
      "toast toast toast toast toast";
    grid-template-columns:
      var(--rui-layout-nav-size) var(--rui-layout-nav-gap) var(--rui-layout-main-size) var(--rui-layout-side-gap)
      var(--rui-layout-side-size);
  }
  @media screen and (min-width: 1024px) {
    --rui-layout-nav-size: 6.5rem;
    grid-template-areas:
      "menu . main . side"
      "menu . main-actions . side"
      ". . toast . .";
    grid-template-rows: 1fr auto auto;
  }
  @media screen and (min-width: 1280px) {
    --rui-layout-nav-size: 15.5rem;
    --rui-layout-main-size: 33.5rem;
  }
  @media screen and (min-width: 1920px) {
    --rui-layout-start: 9.5rem;
    --rui-layout-side-size: calc(var(--rui-layout-start) + var(--rui-layout-nav-size));
    max-width: 94.375rem;
    grid-template-areas:
      ". menu . main . side ."
      ". menu . main-actions . side ."
      ". . . toast . . .";
    grid-template-columns:
      var(--rui-layout-start) var(--rui-layout-nav-size) var(--rui-layout-nav-gap) var(--rui-layout-main-size)
      var(--rui-layout-side-gap) var(--rui-layout-side-size) var(--rui-layout-end, 0);
  }

  .app-layout-main {
    @apply flex flex-col px-4 py-2 md:px-0 md:py-4;
    grid-area: main / main / main / main;
  }
}
</style>
