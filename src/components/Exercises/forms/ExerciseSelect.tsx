import { FormControl, FormHelperText, InputLabel, Select } from "@mui/material";
import { useFieldContext } from "@/core/forms/formContexts";
import { fieldErrorMessage } from "@/core/forms/formUtils";
import React from "react";
import { useTranslation } from "react-i18next";

/** Bound to the form field it is rendered in via form.AppField */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ExerciseSelect(props: { options: any }) {
    const [t] = useTranslation();
    const field = useFieldContext<number | ''>();
    const error = field.state.meta.isTouched ? fieldErrorMessage(field.state.meta.errors) : undefined;

    return <FormControl fullWidth>
        <InputLabel id="label-category">{t("category")}</InputLabel>
        <Select
            labelId="label-category"
            id="category"
            name={field.name}
            label={t("category")}
            error={error !== undefined}
            value={field.state.value}
            onChange={event => field.handleChange(event.target.value as number | '')}
            onBlur={field.handleBlur}
        >
            {props.options}
        </Select>
        {error !== undefined && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>;
}
