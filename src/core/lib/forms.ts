interface ValidationErrorResponseSubList {
    [key: string]: ValidationErrorResponseList[];
}

interface ValidationErrorResponseList {
    [key: string]: string[];
}

interface ValidationErrorResponse {
    [key: string]: string;
}

// Errors of a list serializer, keyed by item index
interface ValidationErrorResponseNested {
    [key: string]: ValidationErrorResponseList | ValidationErrorResponseNested;
}

export function collectValidationErrors(
    errors: ValidationErrorResponseList | ValidationErrorResponseSubList | ValidationErrorResponse | ValidationErrorResponseNested | undefined | null,
    parentKey?: string
): string[] {
    const allErrors: string[] = [];
    if (!errors) {
        return allErrors;
    }

    for (const field in errors) {
        if (Object.hasOwn(errors, field)) {
            const value = errors[field];
            const key = parentKey ? `${parentKey}.${field}` : field;

            if (Array.isArray(value)) {
                if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
                    // If value is an array of objects, treat as sublist and recurse
                    for (const sub of value) {
                        if (typeof sub === "object" && sub !== null) {
                            allErrors.push(...collectValidationErrors(sub, key));
                        } else {
                            allErrors.push(`${key}: ${sub}`);
                        }
                    }
                } else {
                    // If value is an array of strings, treat as error messages
                    allErrors.push(...value.map(error => `${key}: ${error}`));
                }
            } else if (typeof value === "string") {
                // If value is a string, treat as a single error message
                allErrors.push(`${key}: ${value}`);
            } else if (typeof value === "object" && value !== null) {
                // If value is an object, treat as nested errors and recurse
                allErrors.push(...collectValidationErrors(value, key));
            }
        }
    }

    return allErrors;
}

export function errorsToString(errors: ValidationErrorResponse): string {
    const allErrors = collectValidationErrors(errors);
    return allErrors.length > 0 ? allErrors.join(" | ") : "";
}