interface ValidationErrorResponse {
    [key: string]: string[];
}

export function collectValidationErrors(errors: ValidationErrorResponse | undefined | null): string[] {
    const allErrors: string[] = [];
    if (!errors) {
        return allErrors;
    }

    for (const field in errors) {
        if (Object.hasOwn(errors, field)) {
            allErrors.push(...errors[field]);
        }
    }

    return allErrors;
}

export function errorsToString(errors: ValidationErrorResponse): string {
    const allErrors = collectValidationErrors(errors);
    return allErrors.length > 0 ? allErrors.join(" | ") : "";
}