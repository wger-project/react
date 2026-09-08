import { Autocomplete, Chip, InputAdornment, TextField } from "@mui/material";
import { useFieldContext } from "@/core/forms/formContexts";
import { useNestedFieldError } from "@/core/forms/useNestedFieldError";
import React from "react";
import { useTranslation } from "react-i18next";

export type AliasItem = { id?: number; alias: string };

/** Bound to the form field it is rendered in via form.AppField */
export function ExerciseAliases() {
    const [t] = useTranslation();
    const field = useFieldContext<AliasItem[]>();
    // The validator reports on the single aliases, e.g. `aliases[0].alias`
    const nestedError = useNestedFieldError(field);
    const error = field.state.meta.isTouched ? nestedError : undefined;
    const value = field.state.value || [];

    const normalize = (items: (AliasItem | string)[] | null | undefined): AliasItem[] => {
        const seen = new Set<string>();

        return (items || [])
            .map(item =>
                typeof item === "string" ? { alias: item } : ("alias" in item ? (item as AliasItem) : { alias: String(item) })
            )
            .filter(item => {
                if (seen.has(item.alias)) {
                    return false;
                }
                seen.add(item.alias);

                return true;
            });
    };

    return <Autocomplete
        multiple
        freeSolo
        id={field.name}
        value={value}
        options={[]}
        getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.alias)}
        isOptionEqualToValue={(option, value) => {
            const optionAlias = typeof option === "string" ? option : option.alias;
            const valueAlias = typeof value === "string" ? value : value.alias;
            const optionId = typeof option === "string" ? undefined : option.id;
            const valueId = typeof value === "string" ? undefined : value.id;
            return optionAlias === valueAlias && (optionId === valueId || optionId === undefined || valueId === undefined);
        }}
        onChange={(_, newValue) => {
            field.handleChange(normalize(newValue));
        }}
        onBlur={field.handleBlur}
        renderInput={(params) => {
            const chips = value.map((option, index) => (
                <Chip
                    label={option.alias}
                    onDelete={() => field.handleChange(value.filter((_, i) => i !== index))}
                    key={option.id ?? option.alias}
                />
            ));

            return (
                <TextField
                    {...params}
                    id="exerciseAliases"
                    variant="standard"
                    label={t("exercises.alternativeNames")}
                    error={error !== undefined}
                    helperText={error}
                    slotProps={{
                        ...params.slotProps,
                        input: {
                            ...params.slotProps?.input,
                            startAdornment: (
                                <InputAdornment
                                    position="start"
                                    sx={{ display: "flex", gap: 0.5, alignItems: "center" }}
                                >
                                    {chips}
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            );
        }}
    />;
}
