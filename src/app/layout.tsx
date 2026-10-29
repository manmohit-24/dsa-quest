import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "DSA Tracker", template: "%s · DSA Tracker" },
  description: "Multi-sheet, priority-based DSA practice tracker.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <main className="mx-auto max-w-[820px] px-6 pt-8 pb-20">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
