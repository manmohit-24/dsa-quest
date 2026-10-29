import { Input, Select } from "@/components/ui/input";
import { BADGE_TYPE_OPTIONS, DEFAULT_BADGE_TYPE } from "@/lib/constants";
import type { Phase } from "@/types/domain";

export function PhaseFields({ phase }: { phase?: Phase }) {
  return (
    <>
      <Input
        name="title"
        required
        placeholder="Phase title e.g. Phase 1 — JTG Core"
        defaultValue={phase?.title}
      />
      <Input
        name="badge"
        placeholder="Badge text e.g. JTG Priority"
        defaultValue={phase?.badge ?? ""}
      />
      <Select
        name="badgeType"
        aria-label="Badge colour"
        options={BADGE_TYPE_OPTIONS}
        defaultValue={phase?.badgeType ?? DEFAULT_BADGE_TYPE}
      />
    </>
  );
}
