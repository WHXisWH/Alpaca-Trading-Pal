import { uploadToStorage, downloadFromStorage } from "@/lib/0g/storage";

export function useStorage() {
  return {
    uploadToStorage,
    downloadFromStorage,
  };
}