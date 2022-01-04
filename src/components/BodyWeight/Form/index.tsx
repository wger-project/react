import React from 'react';
import { WeightEntry } from "components/BodyWeight/model";
import * as yup from 'yup';
import { useFormik } from "formik";
import { Button, TextField } from "@mui/material";
import { Trans } from "react-i18next";
import { t } from "i18next";


//{ weight }: WeightEntry
export const WeightForm = () => {

    const weight = new WeightEntry(new Date('2020-01-01'), 100, 1);

    const validationSchema = yup.object({
        weight: yup
            .number()
            .min(30, 'Min weight is 30 kg')
            .max(300, 'Max weight is 300 kg')
            .required('Weight field is required'),
    });

    const formik = useFormik({
        initialValues: {
            weight: weight.weight,
            date: weight.date.toISOString().split('T')[0],
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            console.log(JSON.stringify(values, null, 2));
        },
    });

    return (
        <div>
            <form onSubmit={formik.handleSubmit}>

                <TextField
                    fullWidth
                    id="weight"
                    label={t('weight')}
                    {...formik.getFieldProps('weight')}
                />

                <TextField
                    sx={{ mt: 2 }}
                    fullWidth
                    id="date"
                    type={'date'}
                    label={t('date')}
                    {...formik.getFieldProps('date')}
                />
                <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                    <Trans i18nKey={'submit'} />
                </Button>
            </form>
        </div>
    );
};
