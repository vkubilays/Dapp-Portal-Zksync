<template>
  <Menu as="div" class="account-button-container">
    <ModalNetworkChange v-model:opened="networkChangeModalOpened" />
    <ModalViewOnExplorer v-model:opened="viewOnExplorerModalOpened" />
    <ModalSupport v-model:opened="supportModalOpened" />

    <MenuButton as="template">
      <SidebarAccountAvatarName class="main-account-button" />
    </MenuButton>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0"
      enter-to-class="transform opacity-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100"
      leave-to-class="transform opacity-0"
    >
      <MenuItems class="menu-panel">
        <SidebarAccountAvatarName :is-button="false" class="menu-account-button" tabindex="-1" />

        <div class="menu-options">
          <MenuItem v-if="mdAndSmaller" v-slot="{ active }" as="template">
            <button class="account-menu-item" :class="{ active }" @click="networkChangeModalOpened = true">
              <img
                v-if="selectedEthereumNetwork.iconUrl"
                :src="selectedEthereumNetwork.iconUrl"
                :alt="selectedEthereumNetwork.name"
                class="account-menu-item-icon p-1"
              />
              <div v-else class="account-menu-item-icon">{{ selectedEthereumNetwork.name.slice(0, 1) }}</div>
              <div class="flex items-center justify-between">
                <span>{{ selectedEthereumNetwork.name }}</span>
                <ChevronDownIcon class="mr-1 ml-2 h-4 w-4 transition-transform" aria-hidden="true" />
              </div>
            </button>
          </MenuItem>
          <MenuItem v-slot="{ active }" as="template">
            <button class="account-menu-item" :class="{ active }" @click="viewOnExplorerModalOpened = true">
              <Squares2X2Icon class="account-menu-item-icon p-2" aria-hidden="true" />
              View on explorer
            </button>
          </MenuItem>
          <MenuItem v-if="mdAndSmaller" v-slot="{ active }" as="template">
            <button class="account-menu-item" :class="{ active }" @click="supportModalOpened = true">
              <HeartIcon class="account-menu-item-icon p-1.5" aria-hidden="true" />
              Support
            </button>
          </MenuItem>
          <MenuItem v-slot="{ active }" as="template">
            <button class="account-menu-item" :class="{ active }" @click="onboardStore.disconnect">
              <PowerIcon class="account-menu-item-icon p-2" aria-hidden="true" />
              Logout
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { ChevronDownIcon, HeartIcon, Squares2X2Icon } from "@heroicons/vue/24/outline";
import { PowerIcon } from "@heroicons/vue/24/solid";
import { useBreakpoints } from "@vueuse/core";
import { storeToRefs } from "pinia";

import { useNetworkStore } from "@/store/network";
import { useOnboardStore } from "@/store/onboard";

const { selectedEthereumNetwork } = storeToRefs(useNetworkStore());
const onboardStore = useOnboardStore();

const breakpoints = useBreakpoints({
  md: "720px",
});
const mdAndSmaller = breakpoints.smallerOrEqual("md");

const networkChangeModalOpened = ref(false);
const viewOnExplorerModalOpened = ref(false);
const supportModalOpened = ref(false);
</script>

<style lang="scss">
.account-button-container {
  @apply relative;

  .main-account-button {
    @apply transition-colors hover:bg-gray-200;
  }
  .menu-panel {
    @apply absolute left-0 bottom-0 z-10 grid h-max w-56 rounded-lg bg-white shadow-lg ring-1 ring-gray-900/5 focus:outline-none md:-left-px md:-top-px md:p-px;
    grid-template-areas:
      "menu-options"
      "account-button";
    grid-template-rows: repeat(2, max-content);
    @media screen and (min-width: 720px) {
      grid-template-areas:
        "account-button"
        "menu-options";
    }

    .menu-account-button {
      grid-area: account-button;
    }
    .menu-options {
      @apply border-b p-1 md:border-b-0 md:border-t;
      grid-area: menu-options;

      .account-menu-item {
        @apply grid w-full grid-cols-[max-content_1fr] items-center gap-3 rounded-lg px-2 py-2 text-left leading-6 text-gray-900 transition-colors;
        &.active {
          @apply bg-gray text-primary-400;

          .account-menu-item-icon {
            @apply bg-white text-primary-400;
          }
        }

        .account-menu-item-icon {
          @apply flex aspect-square h-auto w-8 items-center justify-center rounded-full bg-gray-50 text-center text-gray-500;
        }
      }
    }
  }
}
</style>
