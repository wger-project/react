import { Autocomplete, TextField } from "@mui/material";
import { useField } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";

export function ExerciseEquipmentSelect(props: { fieldName: string, options: any[] }) {
    const [t] = useTranslation();
    const [field, meta, helpers] = useField(props.fieldName);

    return <Autocomplete
        multiple
        id={props.fieldName}
        options={props.options.map(e => e.id)}
        getOptionLabel={option => props.options.find(e => e.id === option)!.translatedName}
        {...field}
        onChange={(event, newValue) => {
            helpers.setValue(newValue);
        }}
        renderInput={params => (
            <TextField
                variant="standard"
                label={t("exercises.equipment")}
                value={field.value}
                {...params}
            />
        )}
    />;
}