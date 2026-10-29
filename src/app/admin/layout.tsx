import Link from "next/link";
import type { ReactNode } from "react";
import { AdminTabs } from "@/components/admin/admin-tabs";
import { buttonStyles } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageHeader
        title="Admin Panel"
        description="Manage sheets, phases, sections and problems."
        actions={
          <Link href="/" className={buttonStyles({ variant: "ghost" })}>
            ← Tracker
          </Link>
        }
      />
      <AdminTabs />
      {children}
    </>
  );
}
