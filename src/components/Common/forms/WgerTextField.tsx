import { TextField } from "@mui/material";
import { useField } from "formik";
import React from "react";

export function WgerTextField(props: { fieldName: string, title: string }) {
    const [field, meta] = useField(props.fieldName);

    return <TextField
        fullWidth
        id={props.fieldName}
        label={props.title}
        variant="standard"
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error}
        {...field}
    />;
}