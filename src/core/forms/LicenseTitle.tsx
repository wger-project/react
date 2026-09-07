import { useTranslation } from "react-i18next";
import { TextField } from "@mui/material";
import { useFieldContext } from "@/core/forms/formContexts";
import { fieldErrorMessage } from "@/core/forms/formUtils";
import React from "react";

/** Bound to the form field it is rendered in via form.AppField */
export function LicenseTitle() {
    const [t] = useTranslation();
    const field = useFieldContext<string>();
    const error = field.state.meta.isTouched ? fieldErrorMessage(field.state.meta.errors) : undefined;

    return <TextField
        fullWidth
        id={field.name}
        name={field.name}
        label={t("licenses.originalTitle")}
        variant="standard"
        value={field.state.value}
        onChange={event => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        error={error !== undefined}
        helperText={error}
    />;
}
