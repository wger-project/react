import { createFormHook } from "@tanstack/react-form";
import { WgerTextField } from "@/core/forms/WgerTextField";
import { fieldContext, formContext } from "@/core/forms/formContexts";

// Field components registered here are available as <field.WgerTextField />
// inside <form.AppField>. Only useAppForm is exported: withForm is gone in v2.
export const { useAppForm } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: { WgerTextField },
    formComponents: {},
});
