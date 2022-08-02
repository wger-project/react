import React, { useState } from "react";
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

export const Step4Translations = ({
                                      setNewExerciseData,
                                      newExerciseData,
                                      onContinue,
                                      onBack,
                                  }: StepProps) => {
    const [t] = useTranslation();
    const languageQuery = useLanguageQuery();
    const [translateExercise, setTranslateExercise] = useState<boolean>(newExerciseData!.languageId !== null);
    const [alternativeNames, setAlternativeNames] = React.useState<string[]>(
        newExerciseData!.alternativeNamesTranslation
    );

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
            name: newExerciseData!.nameTranslation,
            alternativeNames: '',
            description: newExerciseData!.descriptionTranslation,
            language: newExerciseData!.languageId === null ? '' : newExerciseData!.languageId,
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
            setNewExerciseData!({
                ...newExerciseData!,
                nameTranslation: values.name,
                alternativeNamesTranslation: alternativeNames,
                descriptionTranslation: values.description,
                languageId: values.language === '' ? null : values.language as unknown as number,
            });

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
                            options={alternativeNames}
                            freeSolo
                            value={alternativeNames}
                            onChange={(event, newValue) => {
                                setAlternativeNames(newValue);
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