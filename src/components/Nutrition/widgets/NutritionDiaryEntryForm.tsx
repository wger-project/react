import React from 'react';
import * as yup from 'yup';
import { Form, Formik } from "formik";
import { Button, Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { NutritionalPlan } from "components/Nutrition/models/nutritionalPlan";

import { useAddDiaryEntryQuery, useEditDiaryEntryQuery } from "components/Nutrition/queries";
import { DiaryEntry } from "components/Nutrition/models/diaryEntry";
import { IngredientAutocompleter } from "components/Nutrition/widgets/IngredientAutcompleter";
import { IngredientSearchResponse } from "services/responseType";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { dateToYYYYMMDD } from "utils/date";

type NutritionDiaryEntryFormProps = {
    plan: NutritionalPlan,
    entry?: DiaryEntry,
    meal?: number,
    closeFn?: Function,
}

export const NutritionDiaryEntryForm = ({ plan, entry, meal, closeFn }: NutritionDiaryEntryFormProps) => {

    const [t, i18n] = useTranslation();
    const useAddDiaryQuery = useAddDiaryEntryQuery(plan.id!);
    const useEditDiaryQuery = useEditDiaryEntryQuery(plan.id!);
    const [dateValue, setDateValue] = React.useState<Date | null>(entry ? entry.weightEntry.date : new Date());
    const validationSchema = yup.object({
        amount: yup
            .number()
            .required(t('forms.fieldRequired'))
            .max(1000, t('forms.maxValue', { chars: '1000' }))
            .min(1, t('forms.minValue', { chars: '1' })),
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
                amount: undefined,
                ingredient: undefined
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                // eslint-disable-next-line camelcase
                const data = { ...values, plan: plan.id, meal: meal, weight_unit: null };

                if (entry) {
                    useEditDiaryQuery.mutate({ ...data, id: entry.id });
                } else {
                    useAddDiaryQuery.mutate(data);
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
                        <IngredientAutocompleter callback={(value: IngredientSearchResponse) => console.log(value)} />
                        <TextField
                            fullWidth
                            id="amount"
                            label={'amount'}
                            error={
                                Boolean(formik.errors.amount && formik.touched.amount)
                            }
                            helperText={
                                Boolean(formik.errors.amount && formik.touched.amount)
                                    ? formik.errors.amount
                                    : ''
                            }
                            {...formik.getFieldProps('amount')}
                        />
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
                        <Stack direction="row" justifyContent="end" sx={{ mt: 2 }}>
                            <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                                {t('submit')}
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};
