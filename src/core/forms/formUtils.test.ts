import type { AnyFieldApi, AnyFormApi } from "@tanstack/react-form";
import { fieldError, fieldErrorMessage, setServerError, submitHandler, yupSchema } from "@/core/forms/formUtils";
import * as yup from "yup";

/** Runs the adapted schema and returns the issues, or none when it passes */
const validate = (schema: yup.AnySchema, value: unknown) => {
    const result = yupSchema(schema)['~standard'].validate(value);
    if (result instanceof Promise) {
        throw new Error('the adapter must validate synchronously');
    }
    return result.issues;
};

describe('yupSchema', () => {

    test('passes valid input without issues', () => {
        const schema = yup.object({ name: yup.string().required() });

        expect(validate(schema, { name: 'Squats' })).toBeUndefined();
    });

    test('reports nested errors with the path as segments', () => {
        const schema = yup.object({
            logs: yup.array().of(yup.object({ weight: yup.number().typeError('not a number') })),
        });

        const issues = validate(schema, { logs: [{ weight: 20 }, { weight: 'heavy' }] });

        expect(issues).toEqual([{ message: 'not a number', path: ['logs', 1, 'weight'] }]);
    });

    test('reports errors of a custom test on the path it names', () => {
        const schema = yup.object({
            entries: yup.array().test('needs-first', 'first is required', function (entries) {
                return (entries?.length ?? 0) > 0 || this.createError({
                    path: 'entries[0].value',
                    message: 'first is required'
                });
            }),
        });

        const issues = validate(schema, { entries: [] });

        expect(issues).toEqual([{ message: 'first is required', path: ['entries', 0, 'value'] }]);
    });

    test('treats an empty string as not filled in, like Formik did', () => {
        const schema = yup.object({
            optional: yup.number().notRequired().positive(),
            required: yup.number().required('required'),
            list: yup.array().of(yup.number().nullable()),
        });

        expect(validate(schema, { optional: '', required: 5, list: ['', 3] })).toBeUndefined();
        expect(validate(schema, { optional: '', required: '', list: [] })).toEqual([
            { message: 'required', path: ['required'] },
        ]);
    });

    test('leaves class instances alone while clearing empty strings', () => {
        const date = new Date('2026-09-07');
        const schema = yup.object({ date: yup.date().required() });

        expect(validate(schema, { date })).toBeUndefined();
    });

    test('rethrows anything that is not a validation error', () => {
        const schema = yup.object({
            name: yup.string().test('boom', 'boom', () => {
                throw new TypeError('broken test');
            }),
        });

        expect(() => validate(schema, { name: 'x' })).toThrow(TypeError);
    });
});

describe('fieldErrorMessage', () => {

    test('returns a plain string error as it is', () => {
        expect(fieldErrorMessage(['too short'])).toBe('too short');
    });

    test('returns the message of a Standard Schema issue', () => {
        expect(fieldErrorMessage([{ message: 'too short', path: ['name'] }])).toBe('too short');
    });

    test('skips the empty slots other validators leave behind', () => {
        expect(fieldErrorMessage([undefined, 'late error'])).toBe('late error');
    });

    test('returns nothing for a valid field', () => {
        expect(fieldErrorMessage([])).toBeUndefined();
    });
});

describe('fieldError', () => {

    const fieldWith = (isTouched: boolean, errors: unknown[]) =>
        ({ state: { meta: { isTouched, errors } } }) as unknown as AnyFieldApi;

    test('shows nothing before the user touched the field', () => {
        expect(fieldError(fieldWith(false, ['too short']))).toBeUndefined();
    });

    test('shows the first error once touched', () => {
        expect(fieldError(fieldWith(true, ['too short', 'also too long']))).toBe('too short');
    });
});

describe('submitHandler', () => {

    test('keeps the browser from submitting and hands over to the form', () => {
        const form = { handleSubmit: vi.fn() } as unknown as AnyFormApi;
        const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };

        submitHandler(form)(event as unknown as React.FormEvent);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(form.handleSubmit).toHaveBeenCalled();
    });
});

describe('setServerError', () => {

    test('writes the message into the server slot and keeps the other errors', () => {
        let meta = { errorMap: { onChange: 'too short' } };
        const form = {
            setFieldMeta: vi.fn((_field: string, updater: (prev: typeof meta) => typeof meta) => {
                meta = updater(meta);
            }),
        } as unknown as AnyFormApi;

        setServerError(form, 'description', 'not English');
        expect(meta.errorMap).toEqual({ onChange: 'too short', onServer: 'not English' });

        setServerError(form, 'description', undefined);
        expect(meta.errorMap).toEqual({ onChange: 'too short', onServer: undefined });
    });
});
