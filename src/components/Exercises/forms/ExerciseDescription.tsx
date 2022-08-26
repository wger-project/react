import { useTranslation } from "react-i18next";
import { TextField } from "@mui/material";
import React from "react";
import { useField } from "formik";

export function ExerciseDescription(props: { fieldName: string }) {
    const [t] = useTranslation();
    const [field, meta] = useField(props.fieldName);

    return <TextField
        fullWidth
        id="description"
        label={t("description")}
        variant="standard"
        multiline
        rows={3}
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error}
        {...field}
    />;
}