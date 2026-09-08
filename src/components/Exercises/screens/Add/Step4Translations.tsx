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
import { MarkdownEditor } from "@/core/forms/MarkdownEditor";
import { LoadingWidget } from "@/core/ui/LoadingWidget/LoadingWidget";
import { useLanguageCheckQuery } from "@/core/queries";
import type { StepProps } from "@/components/Exercises/screens/Add/AddExerciseStepper";
import { PaddingBox } from "@/components/Exercises/widgets/PaddingBox";
import { AliasItem, ExerciseAliases } from "@/components/Exercises/forms/ExerciseAliases";
import { ExerciseName } from "@/components/Exercises/forms/ExerciseName";
import { ExerciseNotes } from "@/components/Exercises/forms/ExerciseNotes";
import {
    alternativeNameValidator,
    descriptionValidator,
    nameValidator,
    noteValidator
} from "@/components/Exercises/forms/yupValidators";
import { useLanguageQuery } from "@/components/Exercises/queries";
import { useAppForm } from "@/core/forms/appForm";
import { yupSchema, fieldError, setServerError, submitHandler } from "@/core/forms/formUtils";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useExerciseSubmissionStateValue } from "@/components/Exercises/screens/Add/state";
import {
    setAlternativeNamesI18n,
    setDescriptionI18n,
    setLanguageId,
    setNameI18n,
    setNotesI18n
} from "@/components/Exercises/screens/Add/state/exerciseSubmissionReducer";
import { ENGLISH_LANGUAGE_ID } from "@/core/lib/consts";
import * as yup from "yup";

interface Step4Values {
    name: string,
    alternativeNames: AliasItem[],
    description: string,
    // the empty string stands in for "not picked yet", MUI selects don't accept null
    language: number | '',
    notes: string[],
}

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

    const defaultValues: Step4Values = {
        name: state.nameI18n,
        // The alias field and its validator work with objects, the state keeps plain strings
        alternativeNames: state.alternativeNamesI18n.map(alias => ({ alias })),
        description: state.descriptionI18n,
        language: state.languageId === null ? '' : state.languageId,
        notes: state.notesI18n
    };

    const form = useAppForm({
        defaultValues,
        // The schema follows the switch, TanStack picks up the new one on every render
        validators: { onChange: yupSchema<Step4Values>(validationSchema) },
        onSubmit: async ({ value }) => {
            let canContinue = true;

            if (value.description !== '') {
                const validationResult = await languageCheckQuery.mutateAsync({
                    input: value.description,
                    languageId: value.language as number
                });

                // @ts-ignore - validationResult contains the message from the backend
                if ("success" in validationResult) {
                    canContinue = true;
                } else {
                    canContinue = false;

                    // @ts-ignore - validationResult contains the message from the backend
                    setServerError(form, 'description', validationResult.check.message);
                }
            }


            dispatch(setNameI18n(value.name));
            dispatch(setDescriptionI18n(value.description));
            dispatch(setAlternativeNamesI18n(value.alternativeNames.map(item => item.alias)));
            dispatch(setLanguageId(value.language === '' ? null : value.language));
            dispatch(setNotesI18n(value.notes));

            if (canContinue) {
                onContinue!();
            }
        },
    });

    return (
        <form onSubmit={submitHandler(form)}>
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
                            <form.Field name="language">
                                {field => <FormControl fullWidth>
                                    <InputLabel id="label-language">{t('language')}</InputLabel>
                                    <Select
                                        labelId="label-language"
                                        id="language"
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={e => field.handleChange(e.target.value as number | '')}
                                        onBlur={field.handleBlur}
                                        label={t('language')}
                                        error={fieldError(field) !== undefined}
                                    >
                                        {languageQuery.data!.filter(language => language.id !== ENGLISH_LANGUAGE_ID).map(language => (
                                            <MenuItem key={language.id} value={language.id}>
                                                {language.nameShort} - {language.nameLong}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>}
                            </form.Field>
                        )}
                        <form.AppField name="name">{() => <ExerciseName />}</form.AppField>

                        <form.AppField name="alternativeNames">{() => <ExerciseAliases />}</form.AppField>

                        <form.Field name="description">
                            {field => {
                                const error = fieldError(field);
                                return <MarkdownEditor
                                    label={t('exercises.description')}
                                    value={field.state.value}
                                    onChange={(val) => {
                                        // The server's verdict was about the old text
                                        setServerError(form, 'description', undefined);
                                        field.handleChange(val);
                                    }}
                                    error={error !== undefined}
                                    helperText={error}
                                />;
                            }}
                        </form.Field>

                        <PaddingBox />
                        <form.AppField name="notes">{() => <ExerciseNotes />}</form.AppField>
                    </>
                )}
            </Stack>

            <Grid container>
                <Grid sx={{ display: "flex", justifyContent: "end" }} size={12}>
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
        </form>
    );
};
