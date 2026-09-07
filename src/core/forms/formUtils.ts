import type { StandardSchemaV1 } from "@tanstack/react-form";
import type { AnySchema } from "yup";

/**
 * A yup schema as form validator.
 *
 * Yup types its Standard Schema input as the cast output (weight: number),
 * but the form holds what the inputs hand it (weight: string), so the input
 * type is asserted to the form's. Validation itself casts as before.
 */
export function yupSchema<TFormData>(schema: AnySchema): StandardSchemaV1<TFormData> {
    return schema as unknown as StandardSchemaV1<TFormData>;
}

/**
 * The text of a field's first error: plain validators return strings,
 * Standard Schema validators issue objects.
 */
export function fieldErrorMessage(errors: ReadonlyArray<unknown>): string | undefined {
    const first = errors.find(error => error !== undefined);
    if (typeof first === 'string') {
        return first;
    }
    if (typeof first === 'object' && first !== null && 'message' in first) {
        return String(first.message);
    }
    return undefined;
}
