import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { useExerciseStateValue } from "state";
import { setDescriptionEn } from "state/exerciseReducer";


export const Step3Description = ({ onContinue, onBack }: StepProps) => {
    const [t] = useTranslation();
    const [state, dispatch] = useExerciseStateValue();
    const [localDescriptionEn, setLocalDescriptionEn] = useState<string>(state.descriptionEn);

    useEffect(() => {
        dispatch(setDescriptionEn(localDescriptionEn));
    }, [dispatch, localDescriptionEn]);

    const validationSchema = yup.object({
        description: yup
            .string()
            .min(40, t("forms.valueTooShort"))
            .required(t("forms.fieldRequired")),
    });

    return (
        <Formik
            initialValues={{
                description: state.descriptionEn,
            }}
            validationSchema={validationSchema}
            onSubmit={values => {
                setLocalDescriptionEn(values.description as string);
                onContinue!();
            }}
        >
            {formik => (
                <Form>
                    <Stack>
                        <TextField
                            id="description"
                            label={t("description")}
                            variant="standard"
                            name="description"
                            multiline
                            rows={3}
                            value={formik.getFieldProps("description").value}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                formik.setFieldValue(
                                    formik.getFieldProps("description").name,
                                    event.target.value
                                );
                            }}
                            error={Boolean(
                                formik.errors.description && formik.touched.description
                            )}
                            helperText={
                                Boolean(formik.errors.description && formik.touched.description)
                                    ? formik.errors.description
                                    : ""
                            }
                            // {...formik.getFieldProps("description")}
                        />

                        <Grid container>
                            <Grid item xs={12} display="flex" justifyContent={"end"}>
                                <Box sx={{ mb: 2 }}>
                                    <div>
                                        <Button
                                            onClick={onBack}
                                            sx={{ mt: 1, mr: 1 }}
                                        >
                                            {t('goBack')}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            type="submit"
                                            sx={{ mt: 1, mr: 1 }}
                                        >
                                            {t('continue')}
                                        </Button>
                                    </div>
                                </Box>
                            </Grid>
                        </Grid>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};
