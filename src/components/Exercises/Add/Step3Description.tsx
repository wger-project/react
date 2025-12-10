import { Box, Button, Stack } from "@mui/material";
import Grid from '@mui/material/Grid';
import { useLanguageCheckQuery } from "components/Core/queries";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { PaddingBox } from "components/Exercises/Detail/ExerciseDetails";
import { MarkdownEditor } from "components/Common/forms/MarkdownEditor";
import { ExerciseNotes } from "components/Exercises/forms/ExerciseNotes";
import { descriptionValidator, noteValidator } from "components/Exercises/forms/yupValidators";
import { Form, Formik } from "formik";
import { useTranslation } from "react-i18next";
import { useExerciseSubmissionStateValue } from "state";
import { setDescriptionEn, setNotesEn } from "state/exerciseSubmissionReducer";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";
import * as yup from "yup";


export const Step3Description = ({ onContinue, onBack }: StepProps) => {
    const [t] = useTranslation();
    const [state, dispatch] = useExerciseSubmissionStateValue();
    const languageCheckQuery = useLanguageCheckQuery();

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
            onSubmit={async (values, { setFieldError }) => {
                let canContinue = false;

                const validationResult = await languageCheckQuery.mutateAsync({
                    input: values.description,
                    languageId: ENGLISH_LANGUAGE_ID
                });

                // @ts-ignore - validationResult contains the message from the backend
                if ("success" in validationResult) {
                    canContinue = true;
                } else {
                    canContinue = false;

                    // @ts-ignore - validationResult contains the message from the backend
                    setFieldError('description', validationResult.check.message);
                }

                dispatch(setDescriptionEn(values.description));
                dispatch(setNotesEn(values.notes));

                if (canContinue) {
                    onContinue!();
                }

            }}
        >
            {({ values, errors, touched, setFieldValue }) => (
                <Form>
                    <Stack>
                        {/* REPLACED ExerciseDescription with MarkdownEditor */}
                        <MarkdownEditor
                            label={t('exercises.description')}
                            value={values.description}
                            onChange={(val) => setFieldValue('description', val)}
                            error={touched.description && Boolean(errors.description)}
                            helperText={touched.description && errors.description}
                        />

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
                                            disabled={languageCheckQuery.isPending}
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
        </Formik>)
    );
};