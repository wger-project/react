import React, { useCallback } from 'react';
import { WeightEntry } from "components/BodyWeight/model";
import * as yup from 'yup';
import { Form, Formik } from "formik";
import { Button, Stack, TextField } from "@mui/material";
import { Trans } from "react-i18next";
import i18n, { t } from "i18next";
import { SetState, useStateValue, setNotification } from "state";
import { createWeight, updateWeight } from "services/weight";
import AdapterLuxon from "@mui/lab/AdapterLuxon";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { DatePicker } from "@mui/lab";
import { DateTime } from "luxon";
import { dateToYYYYMMDD } from "utils/date";

interface WeightFormProps {
    weightEntry?: WeightEntry,
    closeFn?: Function,
}

export const WeightForm = ({ weightEntry, closeFn }: WeightFormProps) => {

    const [state, dispatch] = useStateValue();
    const [dateValue, setDateValue] = React.useState<Date | null>(weightEntry ? weightEntry.date : new Date());

    const updateWeightEntry = useCallback(async (entry: WeightEntry) => {
        const action = { type: SetState.UPDATE_WEIGHT, payload: entry };
        dispatch(action);
        dispatch(setNotification(
            {
                notify: true,
                message: "Weight updated Successfully",
                success: true
            }
        ));
        // clear out the notifications after some times
        setTimeout(() => {
            dispatch(setNotification({notify: false, message: "", success: false}));
        }, 5000);
    }, [dispatch]);

    const createWeightEntry = useCallback(async (entry: WeightEntry) => {
        const action = { type: SetState.ADD_WEIGHT, payload: entry };
        dispatch(action);
        dispatch(setNotification(
            {
                notify: true,
                message: "Weight Created Successfully",
                success: true
            }
        ));
        // clear out the notifications after some times
        setTimeout(() => {
            dispatch(setNotification({notify: false, message: "", success: false}));
        }, 5000);
    }, [dispatch]);

    const validationSchema = yup.object({
        weight: yup
            .number()
            .min(30, 'Min weight is 30 kg')
            .max(300, 'Max weight is 300 kg')
            .required('Weight field is required'),
    });


    return (
        <Formik
            initialValues={{
                weight: weightEntry ? weightEntry.weight : 0,
                date: weightEntry ? dateToYYYYMMDD(weightEntry.date) : dateToYYYYMMDD(new Date()),
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                if (weightEntry) {
                    // Edit existing weight entry
                    weightEntry.weight = values.weight;
                    weightEntry.date = new Date(values.date);
                    const editedWeightEntry = await updateWeight(weightEntry);
                    await updateWeightEntry(editedWeightEntry);

                } else {
                    // Create new weight entry
                    weightEntry = new WeightEntry(new Date(values.date), values.weight);
                    const newWeightEntry = await createWeight(weightEntry);
                    await createWeightEntry(newWeightEntry);
                }

                // if closeFn is defined, close the modal (this form does not have to
                // be displayed in a modal)
                if (closeFn) {
                    closeFn();
                }
            }}
        >
            {formik => (
                <Form>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            id="weight"
                            label={t('weight')}
                            error={
                                Boolean(formik.errors.weight && formik.touched.weight)
                            }
                            helperText={
                                Boolean(formik.errors.weight && formik.touched.weight)
                                    ? formik.errors.weight
                                    : ''
                            }
                            {...formik.getFieldProps('weight')}
                        />

                        <LocalizationProvider dateAdapter={AdapterLuxon} locale={i18n.language}>
                            <DatePicker
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
                                    if (weightEntry && dateToYYYYMMDD(weightEntry.date) === (date as unknown as DateTime).toISODate()) {
                                        return false;
                                    }

                                    // if date is in list of weight entries, disable it
                                    if (date) {
                                        return state.weights.some(entry => dateToYYYYMMDD(entry.date) === (date as unknown as DateTime).toISODate());
                                    }

                                    // all other dates are allowed
                                    return false;
                                }}
                            />
                        </LocalizationProvider>
                        <Stack direction="row" justifyContent="end" sx={{ mt: 2 }}>
                            <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                                <Trans i18nKey={'submit'} />
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};
