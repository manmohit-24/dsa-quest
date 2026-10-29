"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export type ToastTone = "success" | "error";
type ShowToast = (message: string, tone?: ToastTone) => void;

const ToastContext = createContext<ShowToast>(() => {});

/** `const toast = useToast(); toast("Saved ✓"); toast("Nope", "error");` */
export function useToast(): ShowToast {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    message: string;
    tone: ToastTone;
    visible: boolean;
  }>({
    message: "",
    tone: "success",
    visible: false,
  });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = useCallback<ShowToast>((message, tone = "success") => {
    clearTimeout(timer.current);
    setState({ message, tone, visible: true });
    // Errors stay a little longer so they can actually be read.
    timer.current = setTimeout(
      () => setState((current) => ({ ...current, visible: false })),
      tone === "error" ? 4000 : 2200,
    );
  }, []);

  return (
    <ToastContext value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed right-6 bottom-6 z-[999] rounded-lg px-[18px] py-2.5 text-[13px] transition duration-200",
          state.tone === "error"
            ? "bg-danger text-background"
            : "bg-foreground text-background",
          state.visible
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0",
        )}
      >
        {state.message}
      </div>
    </ToastContext>
  );
}
