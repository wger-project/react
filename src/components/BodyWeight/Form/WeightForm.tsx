import React from 'react';
import { WeightAdapter, WeightEntry } from "components/BodyWeight/model";
import * as yup from 'yup';
import { Form, Formik } from "formik";
import { Button, TextField } from "@mui/material";
import { Trans } from "react-i18next";
import { t } from "i18next";

interface WeightFormProps {
    weightEntry: WeightEntry
}

export const WeightForm = ({ weightEntry }: WeightFormProps) => {


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
                weight: weightEntry.weight,
                date: weightEntry.date.toISOString().split('T')[0],
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {

                weightEntry.weight = values.weight;
                weightEntry.date = new Date(values.date);
                const adapter = new WeightAdapter();

                // Patch object on server
                // ...

            }}
        >
            {formik => (
                <Form>
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


                    <TextField
                        fullWidth
                        id="date"
                        type={'date'}
                        label={t('date')}
                        sx={{ mt: 2 }}
                        {...formik.getFieldProps('date')}
                    />
                    <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                        <Trans i18nKey={'submit'} />
                    </Button>
                </Form>
            )}
        </Formik>
    );
};
