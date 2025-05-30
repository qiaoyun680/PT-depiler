/**
 * 所有和 ui 相关的选项均在本 store 管理
 */
import { defineStore } from "pinia";
import { usePreferredDark } from "@vueuse/core";
import type { IConfigPiniaStorageSchema, supportThemeType } from "@/storage.ts";

export const useConfigStore = defineStore("config", {
  persistWebExt: true,
  state: (): IConfigPiniaStorageSchema => ({
    lang: "zh_CN",
    theme: "light",
    isNavBarOpen: true,
    ignoreWrongPixelRatio: false,
    saveTableBehavior: true,

    tableBehavior: {
      MyData: {
        itemsPerPage: 20,
        columns: [
          "siteUserConfig.sortIndex",
          "name",
          "levelName",
          "uploaded",
          "ratio",
          "uploads",
          "seeding",
          "seedingSize",
          "bonus",
          "joinTime",
          "updateAt",
          "action",
        ],
        sortBy: [{ key: "siteUserConfig.sortIndex", order: "desc" }],
      },
      SearchEntity: {
        itemsPerPage: 50,
        columns: [
          "site",
          "title",
          "category",
          "size",
          "seeders",
          "leechers",
          "completed",
          "comments",
          "time",
          "action",
        ],
        sortBy: [{ key: "time", order: "desc" }],
      },
      SearchResultSnapshot: {
        itemsPerPage: 25,
        sortBy: [{ key: "createdAt", order: "desc" }],
      },
      SetDownloader: {
        itemsPerPage: 10,
        sortBy: [{ key: "enabled", order: "desc" }],
      },
      SetSearchSolution: {
        itemsPerPage: 10,
      },
      SetSite: {
        itemsPerPage: -1,
        sortBy: [{ key: "userConfig.sortIndex", order: "desc" }],
      },
    },
    userInfo: {
      queueConcurrency: 1,
    },

    download: {
      saveLastDownloader: false,
      localDownloadMethod: "browser",
    },

    searchEntity: {
      saveLastFilter: false,
      queueConcurrency: 1,
    },
  }),
  getters: {
    uiTheme(): Exclude<supportThemeType, "auto"> {
      if (this.theme === "auto") {
        const preferDark = usePreferredDark();
        return preferDark.value ? "dark" : "light";
      }
      return this.theme;
    },

    isLightUiTheme(): boolean {
      return this.uiTheme === "light";
    },
  },
  actions: {
    updateTableBehavior(table: string, key: string, data: any) {
      // @ts-ignore
      this.tableBehavior[table][key] = data;
      if (this.saveTableBehavior) {
        this.$save();
      }
    },
  },
});
