import { Input } from "@/components/ui/input";
import type { Sheet } from "@/types/domain";

/** Fields shared by "Create sheet" and "Edit sheet". Pass `sheet` to pre-fill. */
export function SheetFields({ sheet }: { sheet?: Sheet }) {
  return (
    <>
      <Input
        name="name"
        required
        placeholder="Sheet name e.g. Striver Gap Sheet"
        defaultValue={sheet?.name}
      />
      <Input
        name="description"
        placeholder="Description (optional)"
        defaultValue={sheet?.description ?? ""}
      />
    </>
  );
}
