import { createFormHookContexts } from "@tanstack/react-form";

// Separate from appForm.ts so the bound field components can import the
// contexts without importing the hook that registers them
export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();
