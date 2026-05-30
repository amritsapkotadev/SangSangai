import * as SecureStore from "expo-secure-store";

const DEBUG = true;

const KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
} as const;

export const storage = {
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.TOKEN);
  },

  async setToken(token: string): Promise<void> {
    return SecureStore.setItemAsync(KEYS.TOKEN, token);
  },

  async getUserJson(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.USER);
  },

  async setUserJson(json: string): Promise<void> {
    return SecureStore.setItemAsync(KEYS.USER, json);
  },

  async clearAuth(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.TOKEN);
    await SecureStore.deleteItemAsync(KEYS.USER);
  },

  async hasToken(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(KEYS.TOKEN);
    return token !== null;
  },
};
