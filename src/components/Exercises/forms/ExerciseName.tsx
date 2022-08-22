import { useTranslation } from "react-i18next";
import { TextField } from "@mui/material";
import React from "react";
import { useField } from "formik";

export function ExerciseName(props: { fieldName: string }) {
    const [t] = useTranslation();
    const [field, meta] = useField(props.fieldName);

    return <TextField
        fullWidth
        id={props.fieldName}
        label={t("name")}
        variant="standard"
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error}
        {...field}
    />;
}