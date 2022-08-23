import React from "react";
import { Box, Button, Grid, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { useExerciseStateValue } from "state";
import { setDescriptionEn, setNotesEn } from "state/exerciseReducer";
import { descriptionValidator, noteValidator } from "components/Exercises/forms/yupValidators";
import { ExerciseDescription } from "components/Exercises/forms/ExerciseDescription";
import { ExerciseNotes } from "components/Exercises/forms/ExerciseNotes";
import { PaddingBox } from "components/Exercises/Detail/ExerciseDetails";


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
                    <ExerciseDescription fieldName={"description"} />

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
