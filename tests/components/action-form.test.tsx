// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Input } from "@/components/ui/input";
import { ToastProvider } from "@/components/ui/toast";
import type { ActionResult } from "@/types/action";

afterEach(cleanup);

function setup(
  action: (fd: FormData) => Promise<ActionResult>,
  clearOnSuccess = false,
) {
  render(
    <ToastProvider>
      <ActionForm
        action={action}
        successMessage="Saved ✓"
        clearOnSuccess={clearOnSuccess}
      >
        <Input name="name" aria-label="name" />
        <SubmitButton>Go</SubmitButton>
      </ActionForm>
    </ToastProvider>,
  );
  return userEvent.setup();
}

describe("<ActionForm />", () => {
  it("submits FormData, toasts success and clears text fields when asked", async () => {
    const action = vi.fn(async () => ({ ok: true }) as const);
    const user = setup(action, true);

    await user.type(screen.getByLabelText("name"), "hello");
    await user.click(screen.getByRole("button", { name: "Go" }));

    await waitFor(() => expect(action).toHaveBeenCalledOnce());
    expect((action.mock.calls[0] as unknown as [FormData])[0].get("name")).toBe(
      "hello",
    );
    expect(await screen.findByText("Saved ✓")).toBeTruthy();
    await waitFor(() =>
      expect((screen.getByLabelText("name") as HTMLInputElement).value).toBe(
        "",
      ),
    );
  });

  it("keeps what the user typed and shows the error when the action fails", async () => {
    const action = vi.fn(async () => ({ ok: false, error: "Nope" }) as const);
    const user = setup(action, true);

    await user.type(screen.getByLabelText("name"), "keep me");
    await user.click(screen.getByRole("button", { name: "Go" }));

    expect(await screen.findByText("Nope")).toBeTruthy();
    expect((screen.getByLabelText("name") as HTMLInputElement).value).toBe(
      "keep me",
    );
  });

  it("survives a network failure", async () => {
    const action = vi.fn(async () => {
      throw new Error("offline");
    });
    const user = setup(action);
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(await screen.findByText(/Couldn't reach the server/)).toBeTruthy();
  });

  it("disables the submit button while pending", async () => {
    let release: (r: ActionResult) => void = () => {};
    const action = vi.fn(
      () => new Promise<ActionResult>((resolve) => (release = resolve)),
    );
    const user = setup(action);

    await user.click(screen.getByRole("button", { name: "Go" }));
    await waitFor(() =>
      expect(
        (screen.getByRole("button", { name: "Go" }) as HTMLButtonElement)
          .disabled,
      ).toBe(true),
    );

    release({ ok: true });
    await waitFor(() =>
      expect(
        (screen.getByRole("button", { name: "Go" }) as HTMLButtonElement)
          .disabled,
      ).toBe(false),
    );
  });
});
