import { getServerEnv } from "@/lib/env";

export const appConfig = {
  name: "Mana Store",
  suppliers: {
    weave365: {
      code: "weave365",
      get apiUrl() {
        return getServerEnv().WEAVE365_API_URL;
      },
    },
  },
} as const;
