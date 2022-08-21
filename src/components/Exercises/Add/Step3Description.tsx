import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { useExerciseStateValue } from "state";
import { setDescriptionEn } from "state/exerciseReducer";
import { descriptionValidator } from "components/Exercises/forms/yupValidators";
import { ExerciseDescription } from "components/Exercises/forms/ExerciseDescription";


export const Step3Description = ({onContinue, onBack}: StepProps) => {
    const [t] = useTranslation();
    const [state, dispatch] = useExerciseStateValue();
    const [localDescriptionEn, setLocalDescriptionEn] = useState<string>(state.descriptionEn);

    useEffect(() => {
        dispatch(setDescriptionEn(localDescriptionEn));
    }, [dispatch, localDescriptionEn]);

    const validationSchema = yup.object({
        description: descriptionValidator(t),
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
            <Form>
                <Stack>
                    <ExerciseDescription fieldName={"description"} />

                    <Grid container>
                        <Grid item xs={12} display="flex" justifyContent={"end"}>
                            <Box sx={{mb: 2}}>
                                <div>
                                    <Button
                                        onClick={onBack}
                                        sx={{mt: 1, mr: 1}}
                                    >
                                        {t('goBack')}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        sx={{mt: 1, mr: 1}}
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
