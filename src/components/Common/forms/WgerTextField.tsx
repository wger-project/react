import { TextField } from "@mui/material";
import { TextFieldProps } from "@mui/material/TextField/TextField";
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