import { Input, Select } from "@/components/ui/input";
import {
  DEFAULT_DIFFICULTY,
  DEFAULT_PLATFORM,
  DIFFICULTY_OPTIONS,
  PLATFORM_OPTIONS,
} from "@/lib/constants";
import type { Problem } from "@/types/domain";

export function ProblemFields({ problem }: { problem?: Problem }) {
  return (
    <>
      <Input
        name="name"
        required
        placeholder="Problem name"
        defaultValue={problem?.name}
      />
      <Select
        name="difficulty"
        aria-label="Difficulty"
        options={DIFFICULTY_OPTIONS}
        defaultValue={problem?.difficulty ?? DEFAULT_DIFFICULTY}
      />
      <Select
        name="platform"
        aria-label="Platform"
        options={PLATFORM_OPTIONS}
        defaultValue={problem?.platform ?? DEFAULT_PLATFORM}
      />
      <Input
        name="url"
        type="url"
        placeholder="URL (optional)"
        defaultValue={problem?.url ?? ""}
      />
      <Input
        name="notes"
        placeholder="Notes (optional)"
        defaultValue={problem?.notes ?? ""}
      />
    </>
  );
}
