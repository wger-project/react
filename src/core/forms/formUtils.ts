import type { StandardSchemaV1 } from "@tanstack/react-form";
import type { AnySchema } from "yup";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;

/**
 * What Formik did before validating: an empty string means "not filled in",
 * so an optional number field left blank passes instead of casting to NaN.
 */
function emptyStringsToUndefined(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(emptyStringsToUndefined);
    }
    if (isPlainObject(value)) {
        return Object.fromEntries(
            Object.entries(value).map(([key, entry]) => [key, emptyStringsToUndefined(entry)])
        );
    }
    return value === '' ? undefined : value;
}

/**
 * A yup schema as form validator.
 *
 * Yup types its Standard Schema input as the cast output (weight: number),
 * but the form holds what the inputs hand it (weight: string), so the input
 * type is asserted to the form's. Validation itself casts as before.
 */
export function yupSchema<TFormData>(schema: AnySchema): StandardSchemaV1<TFormData> {
    const standard = schema['~standard'];
    const adapted = {
        '~standard': {
            version: 1,
            vendor: standard.vendor,
            validate: (value: unknown) => standard.validate(emptyStringsToUndefined(value)),
        },
    };
    return adapted as StandardSchemaV1<TFormData>;
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
