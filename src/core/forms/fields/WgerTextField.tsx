import { TextField, TextFieldProps } from "@mui/material";
import { useFieldContext } from "@/core/forms/formContexts";
import { fieldErrorMessage } from "@/core/forms/formUtils";
import React from "react";

interface WgerTextFieldProps {
    title: string,
    /** Shown under the field while it has no error */
    helperText?: string,
    fieldProps?: TextFieldProps,
    fullwidth?: boolean,
}

/**
 * The generic text field, bound to the form field it is rendered in via
 * form.AppField. Successor of the Formik WgerTextField one folder up.
 */
export function WgerTextField({ title, helperText, fieldProps, fullwidth = true }: WgerTextFieldProps) {
    const field = useFieldContext<string>();
    const error = field.state.meta.isTouched ? fieldErrorMessage(field.state.meta.errors) : undefined;

    return <TextField
        fullWidth={fullwidth}
        id={field.name}
        name={field.name}
        label={title}
        variant="standard"
        value={field.state.value}
        onChange={e => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        error={error !== undefined}
        helperText={error ?? helperText}
        {...fieldProps}
    />;
}
