import { useTranslation } from "react-i18next";
import { FormControl, FormHelperText, InputLabel, Select } from "@mui/material";
import React from "react";
import { useField } from "formik";

export function ExerciseSelect(props: { fieldName: string, options: any }) {
    const [t] = useTranslation();
    const [field, meta] = useField(props.fieldName);

    return <FormControl fullWidth>
        <InputLabel id="label-category">{t("category")}</InputLabel>
        <Select
            labelId="label-category"
            id="category"
            label={t("category")}
            error={meta.touched && Boolean(meta.error)}
            {...field}
        >
            {props.options}
        </Select>
        {
            meta.touched
            && Boolean(meta.error)
            && <FormHelperText error>{meta.error}</FormHelperText>
        }
    </FormControl>;
}