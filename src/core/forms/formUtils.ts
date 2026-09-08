import type { AnyFieldApi, AnyFormApi, StandardSchemaV1 } from "@tanstack/react-form";
import type { FormEvent } from "react";
import { AnySchema, ValidationError } from "yup";

interface Issue {
    message: string,
    path?: Array<string | number>,
}

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

/** "logs[0].weight" as the segments a Standard Schema issue carries */
const pathSegments = (path: string | undefined): Array<string | number> | undefined =>
    path?.match(/[^.[\]]+/g)?.map(segment => /^\d+$/.test(segment) ? Number(segment) : segment);

/** Yup's own conversion, which it only runs for its async Standard Schema adapter */
function issuesOf(error: ValidationError, parentPath?: string): Issue[] {
    if (error.inner.length === 0 && error.errors.length > 0) {
        const path = parentPath ? `${parentPath}.${error.path}` : error.path;
        return error.errors.map(message => ({ message, path: pathSegments(path) }));
    }
    const path = parentPath ? `${parentPath}.${error.path}` : error.path;
    return error.inner.flatMap(inner => issuesOf(inner, path));
}

/**
 * A yup schema as synchronous form validator.
 *
 * Yup's own Standard Schema adapter is async, and TanStack drops a submit
 * while an async validation is still running, e.g. when the user saves right
 * after typing. Our schemas have no async rules, so validateSync closes that
 * window. Yup also types its input as the cast output (weight: number) while
 * the form holds what the inputs hand it (weight: string), so the input type
 * is asserted to the form's.
 */
export function yupSchema<TFormData>(schema: AnySchema): StandardSchemaV1<TFormData> {
    const adapted = {
        '~standard': {
            version: 1,
            vendor: 'yup',
            validate: (value: unknown) => {
                try {
                    return { value: schema.validateSync(emptyStringsToUndefined(value), { abortEarly: false }) };
                } catch (error) {
                    if (error instanceof ValidationError) {
                        return { issues: issuesOf(error) };
                    }
                    throw error;
                }
            },
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

/**
 * An error the server reported for one field, shown until it is cleared
 * again. Replaces Formik's setFieldError.
 */
export function setServerError(form: AnyFormApi, field: string, message: string | undefined) {
    form.setFieldMeta(field, prev => ({
        ...prev,
        errorMap: { ...prev.errorMap, onServer: message },
    }));
}

/** The field's error text once the user touched it, nothing before that or while it is valid */
export function fieldError(field: AnyFieldApi): string | undefined {
    return field.state.meta.isTouched ? fieldErrorMessage(field.state.meta.errors) : undefined;
}

/** What the form element does on submit: keeps the browser out of it and lets TanStack validate and submit */
export function submitHandler(form: AnyFormApi) {
    return (event: FormEvent) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
    };
}

/**
 * A key for a form component whose defaults come from loaded data: a change
 * remounts it with fresh defaults, which is what enableReinitialize did.
 */
export const defaultsKey = (...parts: unknown[]): string => JSON.stringify(parts);
