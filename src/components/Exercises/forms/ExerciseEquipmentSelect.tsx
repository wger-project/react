import { Autocomplete, TextField } from "@mui/material";
import { useFieldContext } from "@/core/forms/formContexts";
import React from "react";
import { useTranslation } from "react-i18next";

/** Bound to the form field it is rendered in via form.AppField */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ExerciseEquipmentSelect(props: { options: any[] }) {
    const [t] = useTranslation();
    const field = useFieldContext<number[]>();

    return <Autocomplete
        multiple
        id={field.name}
        options={props.options.map(e => e.id)}
        getOptionLabel={option => props.options.find(e => e.id === option)!.translatedName}
        value={field.state.value}
        onChange={(event, newValue) => field.handleChange(newValue)}
        onBlur={field.handleBlur}
        renderInput={params => (
            <TextField
                variant="standard"
                label={t("exercises.equipment")}
                {...params}
            />
        )}
    />;
}
