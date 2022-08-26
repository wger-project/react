import { useTranslation } from "react-i18next";
import { Autocomplete, Chip, TextField } from "@mui/material";
import React from "react";
import { useField } from "formik";

export function ExerciseAliases(props: { fieldName: string }) {
    const [t] = useTranslation();
    const [field, meta, helpers] = useField(props.fieldName);

    return <Autocomplete
        multiple
        freeSolo
        id={props.fieldName}
        value={field.value}
        options={field.value}
        onChange={(event, newValue) => {
            helpers.setValue(newValue);
        }}
        renderTags={(value: readonly string[], getTagProps) => {
            return value.map((option: string, index: number) => (
                <Chip label={option} {...getTagProps({ index })} />
            ));
        }}
        onBlur={field.onBlur}
        renderInput={params => (
            <TextField
                {...params}
                id="newAlternativeNameEn"
                variant="standard"
                label={t("exercises.alternativeNames")}
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && meta.error}
                value={field.value}
            />
        )}
    />;
}