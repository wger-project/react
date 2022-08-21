import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { useLanguageQuery } from "components/Exercises/queries";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";
import { useExerciseStateValue } from "state";
import {
    setAlternativeNamesI18n,
    setDescriptionI18n,
    setLanguageId,
    setNameI18n
} from "state/exerciseReducer";
import { ExerciseName } from "components/Exercises/forms/ExerciseName";
import {
    alternativeNameValidator,
    descriptionValidator,
    nameValidator
} from "components/Exercises/forms/yupValidators";
import { ExerciseDescription } from "components/Exercises/forms/ExerciseDescription";
import { ExerciseAliases } from "components/Exercises/forms/ExerciseAliases";

export const Step4Translations = ({onContinue, onBack}: StepProps) => {
    const [t] = useTranslation();
    const languageQuery = useLanguageQuery();
    const [state, dispatch] = useExerciseStateValue();

    const [translateExercise, setTranslateExercise] = useState<boolean>(state.languageId !== null);

    const [localLanguageId, setLocalLanguageId] = useState<number | null>(state.languageId);
    const [localNameI18n, setLocalNameI18n] = useState<string>(state.nameI18n);
    const [localAlternativeNamesI18n, setLocalAlternativeNamesI18n] = useState<string[]>(state.alternativeNamesI18n);
    const [localDescriptionI18n, setLocalDescriptionI18n] = useState<string>(state.descriptionI18n);

    useEffect(() => {
        dispatch(setLanguageId(localLanguageId));
    }, [dispatch, localLanguageId]);

    useEffect(() => {
        dispatch(setNameI18n(localNameI18n));
    }, [dispatch, localNameI18n]);

    useEffect(() => {
        dispatch(setDescriptionI18n(localDescriptionI18n));
    }, [dispatch, localDescriptionI18n]);

    useEffect(() => {
        dispatch(setAlternativeNamesI18n(localAlternativeNamesI18n));
    }, [dispatch, localAlternativeNamesI18n]);

    const validationSchema = yup.object(
        translateExercise ? {
            description: descriptionValidator(t),
            name: nameValidator(t),
            alternativeNames: alternativeNameValidator(t),
            language: yup
                .number()
                .required(),
        } : {}
    );

    return <Formik
        initialValues={{
            name: state.nameI18n,
            alternativeNames: state.alternativeNamesI18n,
            description: state.descriptionI18n,
            language: state.languageId === null ? '' : state.languageId,
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {

            setLocalNameI18n(values.name);
            setLocalDescriptionI18n(values.description);
            setLocalAlternativeNamesI18n(values.alternativeNames);
            setLocalLanguageId(values.language === '' ? null : values.language as unknown as number);

            onContinue!();
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

                        <ExerciseDescription fieldName={'description'} />
                    </>
                )}
            </Stack>

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
        </Form>
    )}
    </Formik>;
};