import { Autocomplete, Chip, InputAdornment, TextField } from "@mui/material";
import { useField } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";

type AliasItem = { id?: number; alias: string };

export function ExerciseAliases(props: { fieldName: string }) {
    const [t] = useTranslation();
    const [field, meta, helpers] = useField<AliasItem[]>(props.fieldName);

    const normalize = (items: (AliasItem | string)[] | null | undefined): AliasItem[] =>
        (items || []).map(item =>
            typeof item === "string" ? { alias: item } : ("alias" in item ? (item as AliasItem) : { alias: String(item) })
        );

    /**
     * Extract a human-readable error string from the Yup alias validator, which
     * returns a list of errors.
     */
    const formatError = (err: unknown): string | undefined => {
        if (!err) return undefined;
        if (typeof err === "string") return err;

        if (typeof err === "object") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const o = err as any;
            if (typeof o.alias === "string") return o.alias;
            if (typeof o.message === "string") return o.message;

            for (const k of Object.keys(o)) {
                const v = o[k];
                if (typeof v === "string") return v;
                if (v && typeof v === "object") {
                    if (typeof v.alias === "string") return v.alias;
                    if (typeof v.message === "string") return v.message;
                }
            }
        }

        return String(err);
    };

    return <Autocomplete
        multiple
        freeSolo
        id={props.fieldName}
        value={field.value || []}
        options={[]}
        getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.alias)}
        isOptionEqualToValue={(option, value) => option.alias === value.alias && (option.id === value.id || option.id === undefined || value.id === undefined)}
        onChange={(_, newValue) => {
            helpers.setValue(normalize(newValue));
        }}
        onBlur={field.onBlur}
        renderInput={(params) => {
            const chips = (field.value || []).map((option, index) => (
                <Chip
                    label={option.alias}
                    onDelete={() => {
                        const newVal = [...(field.value || [])];
                        newVal.splice(index, 1);
                        helpers.setValue(newVal);
                    }}
                    key={option.id ?? `${option.alias}-${index}`}
                />
            ));

            return (
                <TextField
                    {...params}
                    id="exerciseAliases"
                    variant="standard"
                    label={t("exercises.alternativeNames")}
                    error={meta.touched && Boolean(meta.error)}
                    helperText={meta.touched ? formatError(meta.error) : undefined}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment
                                    position="start"
                                    sx={{ display: "flex", gap: 0.5, alignItems: "center" }}
                                >
                                    {chips}
                                    {/*{params.InputProps?.startAdornment}*/}
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            );
        }}
    />;
}