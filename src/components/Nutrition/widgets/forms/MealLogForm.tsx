import { Meal } from "../../models/meal";
import { MealItem } from "../../models/mealItem";
import type { useAddDiaryEntriesQuery } from "../../queries/diary";
import { MacrosSummary } from "./IngredientAmountFields";
import { useAppForm } from "@/core/forms/appForm";
import { fieldError, submitHandler, yupSchema } from "@/core/forms/formUtils";
import { dateLocale } from "@/core/lib/date";
import { numberPercentLocale } from "@/core/lib/numbers";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import { Alert, Box, Button, FormHelperText, InputAdornment, Slider, Stack, Typography } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateTime } from "luxon";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import * as yup from "yup";

interface MealLogFormProps {
    meal: Meal,
    planId: string,
    addDiaryEntriesQuery: ReturnType<typeof useAddDiaryEntriesQuery>,
    closeFn: () => void,
    onSuccess?: () => void,
}

interface MealLogValues {
    amounts: string[],
    datetime: Date | null,
}

export const MealLogForm = ({ meal, planId, addDiaryEntriesQuery, closeFn, onSuccess }: MealLogFormProps) => {
    const [t, i18n] = useTranslation();
    // Keep the draft attached to its original ingredients through background refetches.
    const [draftMeal] = useState(() => Meal.clone(meal, { items: meal.items.map(item => MealItem.clone(item)) }));
    const [defaultValues] = useState<MealLogValues>(() => ({
        amounts: draftMeal.items.map(item => String(item.amount)),
        datetime: new Date(),
    }));

    // Match the diary API's 1–1000 range and two decimal places. Zero omits
    // an ingredient instead of posting a diary entry the backend would reject.
    const amountsSchema = yup.array().of(yup.number()
        .typeError(t('forms.enterNumber'))
        .required(t('forms.fieldRequired'))
        .test('finite', t('forms.enterNumber'), value => Number.isFinite(value))
        .test('minimum', t('forms.minValue', { value: '1' }), value => value === 0 || value >= 1)
        .max(1000, t('forms.maxValue', { value: '1000' }))
        .test('precision', t('nutrition.amountPrecision'), value => value === Number(value.toFixed(2)))
    ).required().min(1).test('nonzero', t('nutrition.mealAmountRequired'), values =>
        values.some(value => value !== undefined && value > 0 && Number.isFinite(value)));

    const form = useAppForm({
        defaultValues,
        validators: {
            onChange: yupSchema<MealLogValues>(yup.object({
                amounts: amountsSchema,
                datetime: yup.date().typeError(t('forms.fieldRequired')).required(t('forms.fieldRequired'))
                    .test('notFuture', t('nutrition.pastDateRequired'), value => value.getTime() <= Date.now()),
            })),
        },
        onSubmit: ({ value }) => {
            const datetime = value.datetime;
            if (datetime === null || addDiaryEntriesQuery.isPending) {
                return;
            }
            const entries = draftMeal.items.flatMap((item, index) => {
                const amount = Number(value.amounts[index]);
                return amount === 0 ? [] : [MealItem.clone(item, { amount }).diaryEntry(planId, datetime)];
            });
            addDiaryEntriesQuery.mutate(entries, {
                onSuccess: () => {
                    closeFn();
                    onSuccess?.();
                },
            });
        },
    });

    return <form noValidate onSubmit={submitHandler(form)}>
        <Stack spacing={3} sx={{ fontVariantNumeric: 'tabular-nums' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('nutrition.adjustMealHelp')}
            </Typography>
            {draftMeal.items.length === 0 && <Alert severity="info">{t('nutrition.noIngredientsDefined')}</Alert>}
            <form.Subscribe selector={state => state.values.amounts}>
                {amounts => <Stack spacing={3}>
                    {amounts.map((_, index) => {
                        const item = draftMeal.items[index];
                        return <form.AppField key={item.id} name={`amounts[${index}]`}>
                        {field => {
                            const amount = Number(field.state.value);
                            const percentage = item.amount > 0 && Number.isFinite(amount) && amount <= 1000
                                ? Math.max(0, amount / item.amount * 100) : 0;
                            return <Box>
                                <field.WgerTextField
                                    title={item.ingredient?.name ?? t('nutrition.ingredient')}
                                    helperText={t('nutrition.mealAmountHelp')}
                                    fieldProps={{
                                        type: 'number',
                                        disabled: addDiaryEntriesQuery.isPending,
                                        slotProps: {
                                            input: {
                                                endAdornment: <InputAdornment position="end">
                                                    {item.weightUnit ? `× ${item.weightUnit.name}` : t('nutrition.gramShort')}
                                                </InputAdornment>,
                                            },
                                            htmlInput: { min: 0, max: 1000, step: 0.01, inputMode: 'decimal' },
                                        },
                                    }}
                                />
                                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', px: 1 }}>
                                    <Slider
                                        aria-label={t('nutrition.portionFor', { name: item.ingredient?.name ?? t('nutrition.ingredient') })}
                                        min={0}
                                        max={150}
                                        step={5}
                                        value={Math.min(150, percentage)}
                                        valueLabelDisplay="auto"
                                        getAriaValueText={value => numberPercentLocale(value, i18n.language)}
                                        valueLabelFormat={value => numberPercentLocale(value, i18n.language)}
                                        disabled={addDiaryEntriesQuery.isPending || item.amount <= 0}
                                        onChange={(_, value) => field.handleChange(
                                            String(Number((item.amount * value / 100).toFixed(2)))
                                        )}
                                    />
                                    <Typography variant="body2" sx={{ minWidth: '4em', textAlign: 'right' }}>
                                        {numberPercentLocale(percentage, i18n.language)}
                                    </Typography>
                                </Stack>
                            </Box>;
                        }}
                        </form.AppField>;
                    })}
                    <form.Field name="amounts">
                        {field => fieldError(field) && <FormHelperText error>{fieldError(field)}</FormHelperText>}
                    </form.Field>
                </Stack>}
            </form.Subscribe>

            <form.Subscribe selector={state => state.values.amounts}>
                {amounts => amountsSchema.isValidSync(amounts) && <Box aria-label={t('nutrition.adjustedNutrition')}>
                    <MacrosSummary values={Meal.clone(draftMeal, {
                        items: draftMeal.items.map((item, index) => MealItem.clone(item, { amount: Number(amounts[index]) })),
                    }).plannedNutritionalValues} grams={null} />
                </Box>}
            </form.Subscribe>

            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={dateLocale(i18n.language)}>
                <form.Field name="datetime">
                    {field => <DateTimePicker
                        label={t('date')}
                        disableFuture
                        disabled={addDiaryEntriesQuery.isPending}
                        value={field.state.value ? DateTime.fromJSDate(field.state.value) : null}
                        onChange={value => field.handleChange(value?.toJSDate() ?? null)}
                        slotProps={{ textField: { error: Boolean(fieldError(field)), helperText: fieldError(field) } }}
                    />}
                </form.Field>
            </LocalizationProvider>
            <FormQueryErrors mutationQuery={addDiaryEntriesQuery} />
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'end' }}>
                <Button variant="outlined" onClick={closeFn} disabled={addDiaryEntriesQuery.isPending}>{t('cancel')}</Button>
                <Button variant="contained" type="submit" loading={addDiaryEntriesQuery.isPending}
                        disabled={addDiaryEntriesQuery.isPending || draftMeal.items.length === 0}>
                    {t('nutrition.adjustAndLog')}
                </Button>
            </Stack>
        </Stack>
    </form>;
};
