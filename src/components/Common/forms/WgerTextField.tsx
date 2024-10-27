import { TextField } from "@mui/material";
import { TextFieldProps } from "@mui/material/TextField/TextField";
import { useField } from "formik";
import React from "react";

export function WgerTextField(props: { fieldName: string, title: string, fieldProps?: TextFieldProps }) {
    const [field, meta] = useField(props.fieldName);

    return <TextField
        fullWidth
        id={props.fieldName}
        label={props.title}
        variant="standard"
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error}
        {...field}
        {...props.fieldProps}
    />;
}