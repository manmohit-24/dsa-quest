import { Input, Select } from "@/components/ui/input";
import { DEFAULT_TAG_TYPE, TAG_TYPE_OPTIONS } from "@/lib/constants";
import type { Section } from "@/types/domain";

export function SectionFields({ section }: { section?: Section }) {
  return (
    <>
      <Input
        name="title"
        required
        placeholder="Section title e.g. Trees"
        defaultValue={section?.title}
      />
      <Input
        name="tag"
        placeholder="Tag text e.g. JTG #1 topic"
        defaultValue={section?.tag ?? ""}
      />
      <Select
        name="tagType"
        aria-label="Tag colour"
        options={TAG_TYPE_OPTIONS}
        defaultValue={section?.tagType ?? DEFAULT_TAG_TYPE}
      />
    </>
  );
}
