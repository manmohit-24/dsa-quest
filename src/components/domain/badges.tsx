import { Badge, type BadgeTone } from "@/components/ui/badge";
import type {
  BadgeType,
  Difficulty,
  Platform,
  Priority,
  TagType,
} from "@/lib/constants";
import { PLATFORM_OPTIONS } from "@/lib/constants";

/* Domain value → colour. The only place these mappings live. */

const DIFFICULTY_TONE: Record<Difficulty, BadgeTone> = {
  easy: "success",
  medium: "warning",
  hard: "danger",
};

const PRIORITY_TONE: Record<Priority, BadgeTone> = {
  1: "danger",
  2: "warning",
  3: "neutral",
};

const BADGE_TYPE_TONE: Record<BadgeType, BadgeTone> = {
  danger: "danger",
  accent: "accent",
  success: "success",
};

const TAG_TYPE_TONE: Record<TagType, BadgeTone> = {
  jtg: "danger",
  imp: "warning",
  ext: "success",
};

export function DifficultyBadge({
  difficulty,
}: {
  difficulty: Difficulty | null;
}) {
  if (!difficulty) return null;
  return <Badge tone={DIFFICULTY_TONE[difficulty]}>{difficulty}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge
      tone={PRIORITY_TONE[priority]}
      className="min-w-6 justify-center px-[7px]"
    >
      P{priority}
    </Badge>
  );
}

export function PlatformBadge({ platform }: { platform: Platform | null }) {
  if (!platform) return null;
  const label =
    PLATFORM_OPTIONS.find((option) => option.value === platform)?.label ??
    platform;
  return (
    <Badge tone="outline" className="px-1.5 text-[10px] font-normal">
      {label}
    </Badge>
  );
}

/** The pill next to a phase title. Renders nothing for an empty badge. */
export function PhaseBadge({
  text,
  type,
}: {
  text: string | null;
  type: BadgeType | null;
}) {
  if (!text) return null;
  return (
    <Badge tone={BADGE_TYPE_TONE[type ?? "accent"]} className="px-2.5">
      {text}
    </Badge>
  );
}

/** The small tag next to a section title. Renders nothing for an empty tag. */
export function SectionTag({
  text,
  type,
}: {
  text: string | null;
  type: TagType | null;
}) {
  if (!text) return null;
  return (
    <Badge
      tone={TAG_TYPE_TONE[type ?? "imp"]}
      className="px-[7px] text-[10px] font-normal"
    >
      {text}
    </Badge>
  );
}
