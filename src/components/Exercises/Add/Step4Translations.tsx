import React, { useState } from "react";
import { Box, Button, FormControlLabel, FormGroup, Stack, Switch, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { addExerciseDataType } from "components/Exercises/models/exerciseBase";


type Step4BasicsProps = {
    onContinue: () => void;
    onBack: () => void;
    setNewExerciseData: React.Dispatch<React.SetStateAction<addExerciseDataType>>;
    newExerciseData: addExerciseDataType;
};

export const Step4Translations = ({
                                      setNewExerciseData,
                                      newExerciseData,
                                      onContinue,
                                      onBack,
                                  }: Step4BasicsProps) => {
    const [t] = useTranslation();
    const [translateExercise, setTranslateExercise] = useState<boolean>(false);

    const validationSchema = yup.object({
        description: yup
            .string()
            .min(40, t('forms.value-too-short'))
            .required(t('forms.field-required')),
        name: yup
            .string()
            .min(5, t('forms.value-too-short'))
            .max(40, t('forms.value-too-long'))
            .required(t('forms.field-required')),
        alternativeNames: yup
            .string(),
    });


    return <Formik
        initialValues={{
            name: '',
            alternativeNames: '',
            description: '',
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
            console.log('Submitting the form with values: ', values);
            onContinue();
        }}
    >{formik => (
        <Form>
            <Stack spacing={2}>
                <FormGroup>
                    <FormControlLabel checked={translateExercise}
                                      onClick={() => setTranslateExercise(!translateExercise)}
                                      control={<Switch />}
                                      label="Translate this exercise now" />
                </FormGroup>
                {translateExercise && (
                    <>
                        <TextField
                            id="name"
                            label="Name"
                            variant="standard"
                            error={
                                Boolean(formik.errors.name && formik.touched.name)
                            }
                            helperText={
                                Boolean(formik.errors.name && formik.touched.name)
                                    ? formik.errors.name
                                    : ''
                            }
                            {...formik.getFieldProps('name')}
                        />
                        <TextField
                            id="alternative-names"
                            label="Alternative names"
                            rows={3}
                            variant="standard"
                            error={
                                Boolean(formik.errors.alternativeNames && formik.touched.alternativeNames)
                            }
                            helperText={
                                Boolean(formik.errors.alternativeNames && formik.touched.alternativeNames)
                                    ? formik.errors.alternativeNames
                                    : ''
                            }
                            {...formik.getFieldProps('alternativeNames')}
                        />
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
                    </>
                )}
            </Stack>
            <Box sx={{ mb: 2 }}>
                <div>
                    <Button
                        variant="contained"
                        onClick={onContinue}
                        sx={{ mt: 1, mr: 1 }}
                    >
                        {t('continue')}
                    </Button>
                    <Button
                        disabled={false}
                        onClick={onBack}
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