import { Box, Button, Stack } from "@mui/material";
import Grid from '@mui/material/Grid';
import { useLanguageCheckQuery } from "@/core/queries";
import type { StepProps } from "@/components/Exercises/screens/Add/AddExerciseStepper";
import { PaddingBox } from "@/components/Exercises/widgets/PaddingBox";
import { MarkdownEditor } from "@/core/forms/MarkdownEditor";
import { ExerciseNotes } from "@/components/Exercises/forms/ExerciseNotes";
import { descriptionValidator, noteValidator } from "@/components/Exercises/forms/yupValidators";
import { useAppForm } from "@/core/forms/appForm";
import { yupSchema, fieldError, setServerError, submitHandler } from "@/core/forms/formUtils";
import { useTranslation } from "react-i18next";
import { useExerciseSubmissionStateValue } from "@/components/Exercises/screens/Add/state";
import { setDescriptionEn, setNotesEn } from "@/components/Exercises/screens/Add/state/exerciseSubmissionReducer";
import { ENGLISH_LANGUAGE_ID } from "@/core/lib/consts";
import * as yup from "yup";

interface Step3Values {
    description: string,
    notes: string[],
}

export const Step3Description = ({ onContinue, onBack }: StepProps) => {
    const [t] = useTranslation();
    const [state, dispatch] = useExerciseSubmissionStateValue();
    const languageCheckQuery = useLanguageCheckQuery();

    const validationSchema = yup.object({
        description: descriptionValidator(),
        notes: noteValidator()
    });

    const defaultValues: Step3Values = {
        description: state.descriptionEn,
        notes: state.notesEn,
    };

    const form = useAppForm({
        defaultValues,
        validators: { onChange: yupSchema<Step3Values>(validationSchema) },
        onSubmit: async ({ value }) => {
            let canContinue: boolean;

            const validationResult = await languageCheckQuery.mutateAsync({
                input: value.description,
                languageId: ENGLISH_LANGUAGE_ID
            });

            // @ts-ignore - validationResult contains the message from the backend
            if ("success" in validationResult) {
                canContinue = true;
            } else {
                canContinue = false;

                // @ts-ignore - validationResult contains the message from the backend
                setServerError(form, 'description', validationResult.check.message);
            }

            dispatch(setDescriptionEn(value.description));
            dispatch(setNotesEn(value.notes));

            if (canContinue) {
                onContinue!();
            }
        },
    });

    return (
        <form onSubmit={submitHandler(form)}>
            <Stack>
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
        </form>
    );
};
