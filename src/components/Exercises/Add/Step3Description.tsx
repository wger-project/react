import React from "react";
import { Box, Button, Stack, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { addExerciseDataType } from "../models/exerciseBase";

type Step3DescriptionProps = {
    onContinue: () => void;
    onBack: React.MouseEventHandler<HTMLButtonElement>;
    setNewExerciseData: React.Dispatch<React.SetStateAction<addExerciseDataType>>;
    newExerciseData: addExerciseDataType;
};

export const Step3Description = ({
                                     onContinue,
                                     onBack,
                                     setNewExerciseData,
                                     newExerciseData,
                                 }: Step3DescriptionProps) => {
    const [t] = useTranslation();

    const validationSchema = yup.object({
        description: yup
            .string()
            .min(40, t("forms.value-too-short"))
            .required(t("forms.field-required")),
    });

    return (
        <Formik
            initialValues={{
                description: newExerciseData.descriptionEn,
            }}
            validationSchema={validationSchema}
            onSubmit={values => {
                setNewExerciseData({
                    ...newExerciseData,
                    descriptionEn: values.description,
                });

                onContinue();
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
                        <Box sx={{ mb: 2 }}>
                            <div>
                                <Button variant="contained" type="submit" sx={{ mt: 1, mr: 1 }}>
                                    {t("continue")}
                                </Button>
                                <Button disabled={false} onClick={onBack} sx={{ mt: 1, mr: 1 }}>
                                    {t("back")}
                                </Button>
                            </div>
                        </Box>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};
