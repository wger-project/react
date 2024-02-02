import { Box, Button, Grid, Stack, TextField } from "@mui/material";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { PaddingBox } from "components/Exercises/Detail/ExerciseDetails";
import { ExerciseNotes } from "components/Exercises/forms/ExerciseNotes";
import { descriptionValidator, noteValidator } from "components/Exercises/forms/yupValidators";
import { Form, Formik, useField } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import { useExerciseStateValue } from "state";
import { setDescriptionEn, setNotesEn } from "state/exerciseReducer";
import * as yup from "yup";


export function ExerciseTempDescription(props: { fieldName: string }) {
    const [t] = useTranslation();
    const [field, meta] = useField(props.fieldName);

    return <TextField
        fullWidth
        id={props.fieldName}
        label={t("description")}
        variant="standard"
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error}
        multiline
        rows={4}
        {...field}
    />;
}

export const Step3Description = ({ onContinue, onBack }: StepProps) => {
    const [t] = useTranslation();
    const [state, dispatch] = useExerciseStateValue();

    const validationSchema = yup.object({
        description: descriptionValidator(t),
        notes: noteValidator(t)
    });

    return (
        <Formik
            initialValues={{
                description: state.descriptionEn,
                notes: state.notesEn,
            }}
            validationSchema={validationSchema}
            onSubmit={values => {
                dispatch(setDescriptionEn(values.description));
                dispatch(setNotesEn(values.notes));
                onContinue!();
            }}
        >
            <Form>
                <Stack>
                    <ExerciseTempDescription fieldName={'description'} />
                    {/*<ExerciseDescription fieldName={"description"} /> */}

                    <PaddingBox />
                    <ExerciseNotes fieldName={'notes'} />

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
        </Formik>
    );
};
