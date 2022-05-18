import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Form, Formik } from "formik";
import * as yup from "yup";

export const Step3Description = (props: { onContinue: React.MouseEventHandler<HTMLButtonElement> | undefined; onBack: React.MouseEventHandler<HTMLButtonElement> | undefined; }) => {
    const [t] = useTranslation();

    const validationSchema = yup.object({
        description: yup
            .string()
            .min(40, t('forms.value-too-short'))
            .required(t('forms.field-required')),
    });

    return <Formik
        initialValues={{
            description: '',
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {

            console.log('Submitting the form with values: ', values);

            // @ts-ignore
            props.onContinue!(undefined);
        }}
    >{formik => (
        <Form>
            <Typography>12345</Typography>
            <TextField
                id="description"
                label={t('description')}
                variant="standard"
                rows={3}
                error={
                    Boolean(formik.errors.description && formik.touched.description)
                }
                helperText={
                    Boolean(formik.errors.description && formik.touched.description)
                        ? formik.errors.description
                        : ''
                }
                {...formik.getFieldProps('description')}
            />
            <Box sx={{ mb: 2 }}>
                <div>
                    <Button
                        variant="contained"
                        onClick={props.onContinue}
                        sx={{ mt: 1, mr: 1 }}
                    >
                        {t('continue')}
                    </Button>
                    <Button
                        disabled={false}
                        onClick={props.onBack}
                        sx={{ mt: 1, mr: 1 }}
                    >
                        {t('back')}
                    </Button>
                </div>
            </Box>
        </Form>
    )}
    </Formik>;
};