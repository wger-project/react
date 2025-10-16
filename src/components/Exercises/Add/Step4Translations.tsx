import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormGroup,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { useLanguageCheckQuery } from "components/Core/queries";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { PaddingBox } from "components/Exercises/Detail/ExerciseDetails";
import { ExerciseAliases } from "components/Exercises/forms/ExerciseAliases";
import { ExerciseDescription } from "components/Exercises/forms/ExerciseDescription";
import { ExerciseName } from "components/Exercises/forms/ExerciseName";
import { ExerciseNotes } from "components/Exercises/forms/ExerciseNotes";
import {
    alternativeNameValidator,
    descriptionValidator,
    nameValidator,
    noteValidator
} from "components/Exercises/forms/yupValidators";
import { useLanguageQuery } from "components/Exercises/queries";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useExerciseSubmissionStateValue } from "state";
import {
    setAlternativeNamesI18n,
    setDescriptionI18n,
    setLanguageId,
    setNameI18n,
    setNotesI18n
} from "state/exerciseSubmissionReducer";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";
import * as yup from "yup";

export const Step4Translations = ({ onContinue, onBack }: StepProps) => {
    const [t] = useTranslation();
    const languageQuery = useLanguageQuery();
    const languageCheckQuery = useLanguageCheckQuery();
    const [state, dispatch] = useExerciseSubmissionStateValue();

    const [translateExercise, setTranslateExercise] = useState<boolean>(state.languageId !== null);


    const validationSchema = yup.object(
        translateExercise ? {
            description: descriptionValidator(),
            name: nameValidator(),
            alternativeNames: alternativeNameValidator(),
            notes: noteValidator(),
            language: yup
                .number()
                .required(),
        } : {}
    );

    return (
        <Formik
            initialValues={{
                name: state.nameI18n,
                alternativeNames: state.alternativeNamesI18n,
                description: state.descriptionI18n,
                language: state.languageId === null ? '' : state.languageId,
                notes: state.notesI18n
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setFieldError }) => {
                let canContinue = true;

                if (values.description !== '') {
                    const validationResult = await languageCheckQuery.mutateAsync({
                        input: values.description,
                        languageId: values.language! as unknown as number
                    });

                    // @ts-ignore - validationResult contains the message from the backend
                    if ("success" in validationResult) {
                        canContinue = true;
                    } else {
                        canContinue = false;

                        // @ts-ignore - validationResult contains the message from the backend
                        setFieldError('description', validationResult.check.message);
                    }
                }


                dispatch(setNameI18n(values.name));
                dispatch(setDescriptionI18n(values.description));
                dispatch(setAlternativeNamesI18n(values.alternativeNames));
                dispatch(setLanguageId(values.language === '' ? null : values.language as unknown as number));
                dispatch(setNotesI18n(values.notes));

                if (canContinue) {
                    onContinue!();
                }
            }}
        >{formik => (
            <Form>
                <Stack spacing={2}>
                    <FormGroup>
                        <FormControlLabel checked={translateExercise}
                                          onClick={() => setTranslateExercise(!translateExercise)}
                                          control={<Switch />}
                                          label={t('exercises.translateExerciseNow')} />
                    </FormGroup>
                    {translateExercise && (
                        <>
                            {languageQuery.isLoading ? (
                                <Box>
                                    <LoadingWidget />
                                </Box>
                            ) : (
                                <FormControl fullWidth>
                                    <InputLabel id="label-language">{t('language')}</InputLabel>
                                    <Select
                                        labelId="label-language"
                                        id="language"
                                        value={formik.getFieldProps("language").value}
                                        onChange={e => {
                                            formik.setFieldValue(
                                                formik.getFieldProps("language").name,
                                                e.target.value
                                            );
                                        }}
                                        label={t('language')}
                                        error={Boolean(
                                            formik.touched.language && formik.errors.language
                                        )}
                                    >
                                        {languageQuery.data!.filter(language => language.id !== ENGLISH_LANGUAGE_ID).map(language => (
                                            <MenuItem key={language.id} value={language.id}>
                                                {language.nameShort} - {language.nameLong}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                            <ExerciseName fieldName={'name'} />

                            <ExerciseAliases fieldName={'alternativeNames'} />

                            <ExerciseDescription fieldName={"description"} />

                            <PaddingBox />
                            <ExerciseNotes fieldName={'notes'} />
                        </>
                    )}
                </Stack>

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
            </Form>
        )}
        </Formik>
    );
};