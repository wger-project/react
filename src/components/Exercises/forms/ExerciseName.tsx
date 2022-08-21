import { useTranslation } from "react-i18next";
import { TextField } from "@mui/material";
import React from "react";

export function ExerciseName(props: { fieldName: string, formik: any }) {
    const [t] = useTranslation();

    return <TextField
        id="nameEn"
        label={t("name")}
        variant="standard"
        error={props.formik.touched[props.fieldName] && Boolean(props.formik.errors[props.fieldName])}
        helperText={props.formik.touched[props.fieldName] && props.formik.errors[props.fieldName]}
        {...props.formik.getFieldProps(props.fieldName)}
    />;
}