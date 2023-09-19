import { Autocomplete, Button, InputAdornment, Stack, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { Meal } from "components/Nutrition/models/meal";
import { useAddDiaryEntryQuery, useEditDiaryEntryQuery } from "components/Nutrition/queries";
import { IngredientAutocompleter } from "components/Nutrition/widgets/IngredientAutcompleter";
import { Form, Formik } from "formik";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { IngredientSearchResponse } from "services/responseType";
import { dateToYYYYMMDD } from "utils/date";
import * as yup from "yup";

type NutritionDiaryEntryFormProps = {
    planId: number,
    entry?: DiaryEntry,
    mealId?: number | null,
    meals?: Meal[],
    closeFn?: Function,
}

export const NutritionDiaryEntryForm = ({ planId, entry, mealId, meals, closeFn }: NutritionDiaryEntryFormProps) => {

    const meal = mealId === undefined ? null : mealId;
    const mealObjs = meals === undefined ? [] : meals;

    const [t, i18n] = useTranslation();
    const addDiaryQuery = useAddDiaryEntryQuery(planId);
    const editDiaryQuery = useEditDiaryEntryQuery(planId);
    const [dateValue, setDateValue] = useState<Date | null>(entry ? entry.datetime : new Date());
    const [selectedMeal, setSelectedMeal] = useState<number | null>(meal);
    const validationSchema = yup.object({
        amount: yup
            .number()
            .required(t('forms.fieldRequired'))
            .max(1000, t('forms.maxValue', { value: '1000' }))
            .min(1, t('forms.minValue', { value: '1' })),
        ingredient: yup
            .number()
            .required(t('forms.fieldRequired')),
        datetime: yup
            .date()
            .required(t('forms.fieldRequired')),
    });


    return (
        <Formik
            initialValues={{
                datetime: new Date(),
                amount: 0,
                ingredient: 0,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                const data = {
                    ...values,
                    plan: planId,
                    meal: selectedMeal,
                    // eslint-disable-next-line camelcase
                    weight_unit: null,
                    datetime: values.datetime.toISOString()
                };

                if (entry) {
                    editDiaryQuery.mutate({ ...data, id: entry.id });
                } else {
                    addDiaryQuery.mutate(data);
                }

                // if closeFn is defined, close the modal (this form does not have to be displayed in one)
                if (closeFn) {
                    closeFn();
                }
            }}
        >
            {formik => (
                <Form>
                    <Stack spacing={2}>
                        <IngredientAutocompleter
                            callback={(value: IngredientSearchResponse | null) => formik.setFieldValue('ingredient', value?.data.id)} />
                        <TextField
                            fullWidth
                            id="amount"
                            label={'amount'}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">{t('nutrition.gramShort')}</InputAdornment>
                            }}
                            error={formik.touched.amount && Boolean(formik.errors.amount)}
                            helperText={formik.touched.amount && formik.errors.amount}
                            {...formik.getFieldProps('amount')}
                        />
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
                                inputFormat="yyyy-MM-dd HH:mm"
                                label={t('date')}
                                value={dateValue}
                                renderInput={(params) => <TextField {...params} {...formik.getFieldProps('date')} />}
                                disableFuture={true}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        formik.setFieldValue('date', newValue);
                                    }
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
                        <Stack direction="row" justifyContent="end" spacing={2}>
                            {closeFn !== undefined
                                && <Button color="primary" variant="outlined" onClick={() => closeFn()}>
                                    {t('close')}
                                </Button>}
                            <Button color="primary" variant="contained" type="submit">
                                {t('submit')}
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};
