import { TextField, TextFieldProps } from "@mui/material";
import { useField } from "formik";
import React from "react";

interface WgerTextFieldProps {
    fieldName: string,
    title: string,
    fieldProps?: TextFieldProps,
    fullwidth?: boolean,
}

export function WgerTextField(props: WgerTextFieldProps) {
    const [field, meta] = useField(props.fieldName);
    const fullwidth = props.fullwidth ?? true;

    return <TextField
        fullWidth={fullwidth}
        id={props.fieldName}
        label={props.title}
        variant="standard"
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error}
        {...field}
        {...props.fieldProps}
    />;
}