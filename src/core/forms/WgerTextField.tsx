import { TextField, TextFieldProps } from "@mui/material";
import { useFieldContext } from "@/core/forms/formContexts";
import { fieldError } from "@/core/forms/formUtils";
import React from "react";

interface WgerTextFieldProps {
    title: string,
    variant?: TextFieldProps['variant'],
    /** Shown under the field while it has no error */
    helperText?: string,
    /** Called after the form took the new value */
    onValueChange?: (value: string) => void,
    /** Anything else MUI should get; the binding props below win */
    fieldProps?: TextFieldProps,
    fullwidth?: boolean,
}

/**
 * The generic text field, bound to the form field it is rendered in via
 * form.AppField.
 */
export function WgerTextField({
                                  title,
                                  variant,
                                  helperText,
                                  onValueChange,
                                  fieldProps,
                                  fullwidth = true
                              }: WgerTextFieldProps) {
    const field = useFieldContext<string>();
    const error = fieldError(field);

    return <TextField
        fullWidth={fullwidth}
        variant={variant}
        {...fieldProps}
        id={field.name}
        name={field.name}
        label={title}
        value={field.state.value}
        onChange={e => {
            field.handleChange(e.target.value);
            onValueChange?.(e.target.value);
        }}
        onBlur={field.handleBlur}
        error={error !== undefined}
        helperText={error ?? helperText}
    />;
}
