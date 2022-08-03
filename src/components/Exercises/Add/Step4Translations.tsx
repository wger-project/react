import React, { useEffect, useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    FormControl,
    FormControlLabel,
    FormGroup,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { useLanguageQuery } from "components/Exercises/queries";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";
import { useExerciseStateValue } from "state";
import { setAlternativeNamesI18n, setDescriptionI18n, setLanguageId, setNameI18n } from "state/exerciseReducer";

export const Step4Translations = ({ onContinue, onBack }: StepProps) => {
    const [t] = useTranslation();
    const languageQuery = useLanguageQuery();
    const [state, dispatch] = useExerciseStateValue();

    const [translateExercise, setTranslateExercise] = useState<boolean>(state.languageId !== null);

    const [localLanguageId, setLocalLanguageId] = React.useState<number | null>(state.languageId);
    const [LocalNameI18n, setLocalNameI18n] = React.useState<string>(state.nameI18n);
    const [localDescriptionI18n, setLocalDescriptionI18n] = React.useState<string>(state.descriptionI18n);
    const [localAlternativeNamesI18n, setLocalAlternativeNamesI18n] = React.useState<string[]>(state.alternativeNamesI18n);

    useEffect(() => {
        dispatch(setLanguageId(localLanguageId));
    }, [dispatch, localLanguageId]);

    useEffect(() => {
        dispatch(setNameI18n(LocalNameI18n));
    }, [dispatch, LocalNameI18n]);

    useEffect(() => {
        dispatch(setDescriptionI18n(localDescriptionI18n));
    }, [dispatch, localDescriptionI18n]);

    useEffect(() => {
        dispatch(setAlternativeNamesI18n(localAlternativeNamesI18n));
    }, [dispatch, localAlternativeNamesI18n]);

    const validationSchema = yup.object(
        translateExercise ? {
            description: yup
                .string()
                .min(40, t('forms.valueTooShort'))
                .required(t('forms.fieldRequired')),
            name: yup
                .string()
                .min(5, t('forms.valueTooShort'))
                .max(40, t('forms.valueTooLong'))
                .required(t('forms.fieldRequired')),
            alternativeNames: yup
                .string(),
            language: yup.number().required(),
        } : {}
    );


    return <Formik
        initialValues={{
            name: state.nameI18n,
            alternativeNames: '',
            description: state.descriptionI18n,
            language: state.languageId === null ? '' : state.languageId,
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {

            setLocalNameI18n(values.name);
            setLocalDescriptionI18n(values.description);
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
                                        // setCategory(e.target.value);
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
                        <TextField
                            id="name"
                            label={t("name")}
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
                        <Autocomplete
                            multiple
                            id="tags-filled"
                            options={localAlternativeNamesI18n}
                            freeSolo
                            value={localAlternativeNamesI18n}
                            onChange={(event, newValue) => {
                                setLocalAlternativeNamesI18n(newValue);
                            }}
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <Chip label={option} {...getTagProps({ index })} />
                                ))
                            }
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    id="newAlternativeNameEn"
                                    variant="standard"
                                    label={t("exercises.alternativeNames")}
                                    value={formik.getFieldProps("newAlternativeNameEn").value}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        formik.setFieldValue(
                                            formik.getFieldProps("newAlternativeNameEn").name,
                                            event.target.value
                                        );
                                    }}
                                    error={Boolean(
                                        formik.touched.alternativeNames &&
                                        formik.errors.alternativeNames
                                    )}
                                    helperText={
                                        Boolean(
                                            formik.errors.alternativeNames &&
                                            formik.touched.alternativeNames
                                        )
                                            ? formik.errors.alternativeNames
                                            : ""
                                    }
                                />
                            )}
                        />
                        <TextField
                            id="description"
                            label={t('description')}
                            variant="standard"
                            multiline
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
                    <Button variant="contained" type="submit" sx={{ mt: 1, mr: 1 }}>
                        {t("continue")}
                    </Button>
                    <Button
                        disabled={false}
                        onClick={onBack}
                        sx={{ mt: 1, mr: 1 }}
                    >
                        {t('goBack')}
                    </Button>
                </div>
            </Box>
        </Form>
    )}
    </Formik>;
};