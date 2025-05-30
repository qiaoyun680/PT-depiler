<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { computedAsync } from "@vueuse/core";

import { type VForm } from "vuetify/components";
import { type IDownloaderMetadata } from "@/shared/storages/types/metadata.ts";

import { getDownloader, getDownloaderMetaData } from "@ptd/downloader";
import { formatDate, formValidateRules } from "@/options/utils.ts";

const clientConfig = defineModel<IDownloaderMetadata & { valid?: boolean }>();
const { t } = useI18n();

const clientMeta = computedAsync(async () => await getDownloaderMetaData(clientConfig.value!.type));

const showPassword = ref<boolean>(false);

enum connectStatus {
  default = "default",
  success = "success",
  error = "error",
}

const connectBtnMap: Record<connectStatus, { icon: string; color: string }> = {
  [connectStatus.default]: { icon: "mdi-access-point", color: "info" },
  [connectStatus.success]: { icon: "mdi-access-point-check", color: "success" },
  [connectStatus.error]: { icon: "mdi-access-point-remove", color: "error" },
};

const connectTesting = ref<boolean>(false);
const connectStatusRef = ref<connectStatus>(connectStatus.default);
const formRef = ref<VForm>();

async function checkConnect() {
  if ((await formRef.value!.validate()).valid) {
    connectTesting.value = true;
    const client = await getDownloader(clientConfig.value!);
    try {
      connectStatusRef.value = (await client.ping()) ? connectStatus.success : connectStatus.error;
    } catch (e) {
      connectStatusRef.value = connectStatus.error;
      setTimeout(() => (connectStatusRef.value = connectStatus.default), 3e3);
    } finally {
      connectTesting.value = false;
      clientConfig.value!.valid = true; // 不管是否测试成功，都允许用户进行下一步操作（保存下载服务器配置）
    }
  }
}
</script>

<template>
  <v-card class="mb-5">
    <v-form v-if="clientConfig" ref="formRef" fast-fail>
      <v-container class="pa-0">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="clientConfig.type" :label="t('SetDownloader.common.type')" disabled />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="clientConfig.name"
              :label="t('SetDownloader.common.name')"
              :placeholder="t('SetDownloader.common.name')"
              :rules="[formValidateRules.require(t('SetDownloader.editor.nameTip'))]"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="clientConfig.id"
              :label="t('SetDownloader.common.uid') + t('SetDownloader.editor.uidPlaceholder')"
              disabled
            />
          </v-col>
        </v-row>
        <v-row>
          <v-text-field
            v-model="clientConfig.address"
            :label="t('SetDownloader.common.address')"
            :rules="[formValidateRules.url(t('SetDownloader.editor.addressTip'))]"
            required
          />
        </v-row>
        <v-row>
          <v-text-field
            v-if="typeof clientConfig.username !== 'undefined'"
            v-model="clientConfig.username"
            :label="t('SetDownloader.common.username')"
          />
        </v-row>
        <v-row>
          <v-text-field
            v-model="clientConfig.password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :label="t('SetDownloader.editor.password')"
            :type="showPassword ? 'text' : 'password'"
            class="pr-5"
            @click:append="showPassword = !showPassword"
          />
        </v-row>
        <v-row>
          <v-slider
            v-model="clientConfig.timeout"
            :color="clientConfig.timeout! > 8 * 60e3 ? 'red' : clientConfig.timeout! > 5 * 60e3 ? 'amber' : 'green'"
            :label="$t('SetDownloader.editor.timeout')"
            :max="10 * 60e3"
            :min="0"
            :step="1e3"
            class="px-2"
          >
            <template #append>
              <v-btn variant="flat" @click="clientConfig.timeout = 60e3">
                {{ formatDate(clientConfig.timeout!, "mm:ss") }}
              </v-btn>
            </template>
          </v-slider>
        </v-row>
        <v-row>
          <v-switch
            v-if="clientMeta?.feature?.DefaultAutoStart?.allowed"
            v-model="clientConfig.feature!.DefaultAutoStart"
            :label="t('SetDownloader.editor.autoStart')"
            class="ml-4"
            color="success"
          />
        </v-row>
      </v-container>

      <v-btn
        :color="connectBtnMap[connectStatusRef]['color']"
        :disabled="connectTesting"
        :loading="connectTesting"
        block
        variant="text"
        @click="checkConnect"
      >
        <v-icon :icon="connectBtnMap[connectStatusRef]['icon']" />
        {{ t("SetDownloader.editor.connect." + connectStatusRef) }}
      </v-btn>

      <v-alert v-if="clientMeta?.warning" color="warning">
        <ul>
          <li v-for="(data, index) in clientMeta.warning" :key="index">● {{ data }}</li>
        </ul>
      </v-alert>
    </v-form>
  </v-card>
</template>

<style scoped lang="scss"></style>
