import { AnyFieldApi, useSelector } from "@tanstack/react-form";
import { fieldErrorMessage } from "@/core/forms/formUtils";

/**
 * The first error of a field or of anything nested in it, e.g. the alias
 * inside an alias list: the schema reports those on `aliases[0].alias`,
 * which has no field of its own to show them.
 */
export function useNestedFieldError(field: AnyFieldApi): string | undefined {
    const name: string = field.name;

    return useSelector(field.form.store, state => {
        const errors = Object.entries(state.fieldMeta)
            .filter(([key]) => key === name || key.startsWith(`${name}[`) || key.startsWith(`${name}.`))
            .flatMap(([, meta]) => meta?.errors ?? []);
        return fieldErrorMessage(errors);
    });
}
