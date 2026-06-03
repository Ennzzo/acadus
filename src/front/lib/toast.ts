"use client";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

function show(type: ToastType, message: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("acadus-toast", {
      detail: {
        id: Date.now(),
        type,
        message,
      },
    }),
  );
}

export const toast = {
  success: (message: string) => show("success", message),
  error: (message: string) => show("error", message),
  info: (message: string) => show("info", message),
};
