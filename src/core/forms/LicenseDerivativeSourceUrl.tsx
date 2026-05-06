import { useTranslation } from "react-i18next";
import { TextField } from "@mui/material";
import React from "react";
import { useField } from "formik";

export function LicenseDerivativeSourceUrl(props: { fieldName: string }) {
    const [t] = useTranslation();
    const [field, meta] = useField(props.fieldName);

    return <TextField
        fullWidth
        id={props.fieldName}
        label={t("licenses.derivativeSourceUrl")}
        variant="standard"
        placeholder={"https://"}
        error={meta.touched && Boolean(meta.error)}
        helperText={t("licenses.derivativeSourceUrlHelper") || meta.touched && meta.error}
        {...field}
    />;
}