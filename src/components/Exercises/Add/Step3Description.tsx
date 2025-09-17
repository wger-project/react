import { Box, Button, Stack } from "@mui/material";
import Grid from '@mui/material/Grid';
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { PaddingBox } from "components/Exercises/Detail/ExerciseDetails";
import { ExerciseDescription } from "components/Exercises/forms/ExerciseDescription";
import { ExerciseNotes } from "components/Exercises/forms/ExerciseNotes";
import { descriptionValidator, noteValidator } from "components/Exercises/forms/yupValidators";
import { Form, Formik } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import { useExerciseSubmissionStateValue } from "state";
import { setDescriptionEn, setNotesEn } from "state/exerciseSubmissionReducer";
import * as yup from "yup";


export const Step3Description = ({ onContinue, onBack }: StepProps) => {
    const [t] = useTranslation();
    const [state, dispatch] = useExerciseSubmissionStateValue();

    const validationSchema = yup.object({
        description: descriptionValidator(),
        notes: noteValidator()
    });

    return (
        (<Formik
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
                        <Grid display="flex" justifyContent={"end"} size={12}>
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
        </Formik>)
    );
};
