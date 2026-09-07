import { Autocomplete, Button, InputAdornment, MenuItem, Select, Stack, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DiaryEntry } from "@/components/Nutrition/models/diaryEntry";
import { Ingredient } from "@/components/Nutrition/models/Ingredient";
import { Meal } from "@/components/Nutrition/models/meal";
import { NutritionWeightUnit } from "@/components/Nutrition/models/weightUnit";
import {
    useAddDiaryEntryQuery,
    useDeleteDiaryEntryQuery,
    useEditDiaryEntryQuery
} from "@/components/Nutrition/queries";
import { IngredientAutocompleter } from "@/components/Nutrition/widgets/IngredientAutocompleter";
import { useAppForm } from "@/core/forms/appForm";
import { fieldErrorMessage, yupSchema } from "@/core/forms/formUtils";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import { DateTime } from "luxon";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { dateToYYYYMMDD } from "@/core/lib/date";
import * as yup from "yup";

const GRAM_UNIT_VALUE = 'g';

type NutritionDiaryEntryFormProps = {
    planId: string,
    entry?: DiaryEntry,
    mealId?: string | null,
    meals?: Meal[],
    closeFn?: () => void,
}

interface DiaryEntryFormValues {
    datetime: Date | null,
    // The text field hands over strings, the schema casts them to numbers
    amount: string,
    ingredient: number | null,
}

export const NutritionDiaryEntryForm = ({ planId, entry, mealId, meals, closeFn }: NutritionDiaryEntryFormProps) => {

    const meal = mealId === undefined ? null : mealId;
    const mealObjs = meals === undefined ? [] : meals;

    const [t, i18n] = useTranslation();
    const addDiaryQuery = useAddDiaryEntryQuery(planId);
    const editDiaryQuery = useEditDiaryEntryQuery(planId);
    const deleteDiaryQuery = useDeleteDiaryEntryQuery(planId);
    const [dateValue, setDateValue] = useState<DateTime | null>(entry ? DateTime.fromJSDate(entry.datetime) : DateTime.now());
    const [selectedMeal, setSelectedMeal] = useState<string | null>(meal ?? entry?.mealId ?? null);

    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(entry?.ingredient ?? null);
    const [selectedUnit, setSelectedUnit] = useState<NutritionWeightUnit | null>(entry?.weightUnit ?? null);
    const [weightUnits, setWeightUnits] = useState<NutritionWeightUnit[]>(entry?.ingredient?.weightUnits ?? []);

    const validationSchema = yup.object({
        amount: yup
            .number()
            .required(t('forms.fieldRequired'))
            .max(1000, t('forms.maxValue', { value: '1000' }))
            .min(1, t('forms.minValue', { value: '1' })),
        ingredient: yup
            .number()
            .nullable()
            .moreThan(0, t('forms.fieldRequired'))
            .required(t('forms.fieldRequired')),
        datetime: yup
            .date()
            .required(t('forms.fieldRequired')),
    });

    // The dialog closes only once the server took the change, so a rejected
    // write is shown instead of disappearing with it
    const closeOnSuccess = { onSuccess: () => closeFn?.() };

    const handleDelete = () => {
        if (entry) {
            deleteDiaryQuery.mutate(entry.id!, closeOnSuccess);
            return;
        }
        closeFn?.();
    };

    const handleUnitChange = (value: string) => {
        if (value === GRAM_UNIT_VALUE) {
            setSelectedUnit(null);
        } else {
            const unit = weightUnits.find(u => u.id === Number(value));
            setSelectedUnit(unit ?? null);
        }
    };

    const defaultValues: DiaryEntryFormValues = {
        datetime: entry ? entry.datetime : new Date(),
        amount: String(entry ? entry.amount : 0),
        ingredient: entry ? entry.ingredientId : null,
    };

    const form = useAppForm({
        defaultValues,
        validators: { onChangeAsync: yupSchema<DiaryEntryFormValues>(validationSchema) },
        onSubmit: async ({ value }) => {
            // The schema already refused these, this only narrows the types
            if (value.datetime === null || value.ingredient === null) {
                return;
            }

            // Make sure "amount" is a number
            const newAmount = Number(value.amount);

            if (entry) {
                // Edit
                const newDiaryEntry = DiaryEntry.clone(entry, {
                    mealId: selectedMeal,
                    planId: planId,
                    amount: newAmount,
                    datetime: value.datetime,
                    ingredientId: value.ingredient,
                    ingredient: selectedIngredient,
                    weightUnitId: selectedUnit?.id ?? null,
                    weightUnit: selectedUnit,
                });
                editDiaryQuery.mutate(newDiaryEntry, closeOnSuccess);
            } else {
                // Add
                addDiaryQuery.mutate(new DiaryEntry({
                    planId: planId,
                    amount: newAmount,
                    datetime: value.datetime,
                    ingredientId: value.ingredient,
                    mealId: selectedMeal,
                    weightUnitId: selectedUnit?.id ?? null,
                    weightUnit: selectedUnit,
                }), closeOnSuccess);
            }
        },
    });

    return (
        <form onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
        }}>
            <Stack spacing={2}>
                <form.Field name="ingredient">
                    {field => {
                        const error = field.state.meta.isTouched
                            ? fieldErrorMessage(field.state.meta.errors)
                            : undefined;
                        return <>
                            <IngredientAutocompleter
                                callback={(value: Ingredient | null) => {
                                    field.handleChange(value?.id ?? null);
                                    setSelectedIngredient(value);
                                    setWeightUnits(value?.weightUnits ?? []);
                                    setSelectedUnit(null);
                                }}
                                initialIngredient={entry ? entry.ingredient : null}
                            />
                            {error !== undefined && (
                                <div style={{ color: 'crimson', fontSize: '0.7rem', marginLeft: '12px' }}>
                                    {error}
                                </div>
                            )}
                        </>;
                    }}
                </form.Field>
                <form.AppField name="amount">
                    {field => <field.WgerTextField
                        title={'amount'}
                        fieldProps={{
                            variant: 'outlined',
                            slotProps: {
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {weightUnits.length > 0 ? (
                                                <Select
                                                    variant="standard"
                                                    disableUnderline
                                                    value={selectedUnit?.id?.toString() ?? GRAM_UNIT_VALUE}
                                                    onChange={(e) => handleUnitChange(e.target.value)}
                                                >
                                                    <MenuItem value={GRAM_UNIT_VALUE}>
                                                        {t('nutrition.gramShort')}
                                                    </MenuItem>
                                                    {weightUnits.map(unit => (
                                                        <MenuItem key={unit.id} value={unit.id.toString()}>
                                                            {unit.name} ({unit.grams}g)
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            ) : (
                                                t('nutrition.gramShort')
                                            )}
                                        </InputAdornment>
                                    )
                                },
                                htmlInput: { inputMode: 'decimal' }
                            },
                        }}
                    />}
                </form.AppField>
                {mealObjs.length > 0 && <Autocomplete
                    value={selectedMeal}
                    options={mealObjs.map(e => e.id)}
                    getOptionLabel={option => mealObjs.find(e => e.id === option)!.displayName!}
                    onChange={(event, newValue) => setSelectedMeal(newValue)}
                    renderInput={params => (
                        <TextField
                            label={t("nutrition.meal")}
                            value={selectedMeal}
                            {...params}
                        />
                    )}
                />}
                <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>

                    <DateTimePicker
                        format="yyyy-MM-dd HH:mm"
                        label={t('date')}
                        value={dateValue}
                        disableFuture={true}
                        onChange={(newValue) => {
                            form.setFieldValue('datetime', newValue?.toJSDate() ?? null);

                            setDateValue(newValue);
                        }}
                        shouldDisableDate={(date) => {

                            // Allow the date of the current weight entry, since we are editing it
                            // @ts-ignore - date is a Luxon DateTime!
                            if (entry && dateToYYYYMMDD(entry.datetime) === dateToYYYYMMDD(date.toJSDate())) {
                                return false;
                            }

                            // all other dates are allowed
                            return false;
                        }}
                    />
                </LocalizationProvider>
                <FormQueryErrors mutationQuery={entry ? editDiaryQuery : addDiaryQuery} />
                <FormQueryErrors mutationQuery={deleteDiaryQuery} />
                <Stack direction="row" spacing={2} sx={{ justifyContent: "end" }}>
                    {(closeFn !== undefined && entry !== undefined)
                        && <Button color="error" variant="outlined" onClick={handleDelete}>
                            {t('delete')}
                        </Button>}

                    {closeFn !== undefined
                        && <Button color="primary" variant="outlined" onClick={() => closeFn()}>
                            {t('close')}
                        </Button>}
                    <Button color="primary" variant="contained" type="submit">
                        {t('submit')}
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
};
