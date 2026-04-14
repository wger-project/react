import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { VariationSelect } from "components/Exercises/forms/VariationSelect";
import React from "react";
import { useTranslation } from "react-i18next";
import { useExerciseSubmissionStateValue } from "state";
import { setNewBaseVariationId, setVariationId } from "state/exerciseSubmissionReducer";


export const Step2Variations = ({ onContinue, onBack }: StepProps) => {
    const [t] = useTranslation();
    const [state, dispatch] = useExerciseSubmissionStateValue();

    return <>
        <Grid container>
            <Grid size={{ xs: 12, sm: 6 }}>
                <Typography>{t('exercises.whatVariationsExist')}</Typography>
            </Grid>
            <Grid
                sx={{ display: "flex", justifyContent: "end" }}
                size={{
                    xs: 12,
                    sm: 6
                }}>
                <TextField
                    label={t('name')}
                    helperText={t('exercises.filterVariations')}
                    // defaultValue={state.nameEn}
                    variant="standard"
                    onChange={(event) => setSearchTerms(event.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }
                    }}
                />
            </Grid>
        </Grid>

        <VariationSelect
            selectedVariationId={state.variationGroup}
            selectedNewVariationExerciseId={state.newVariationExerciseId}
            onChangeVariationId={(id) => dispatch(setVariationId(id))}
            onChangeNewVariationExerciseId={(id) => dispatch(setNewBaseVariationId(id))}
        />

        <Alert severity="info" variant="filled" sx={{ mt: 2 }}>
            <AlertTitle>{t("exercises.identicalExercise")}</AlertTitle>
            {t('exercises.identicalExercisePleaseDiscard')}
        </Alert>

        <Grid container>
            <Grid sx={{ display: "flex", justifyContent: "end" }} size={12}>
                <Box sx={{ mb: 2 }}>
                    <div>
                        <Button
                            disabled={false}
                            onClick={onBack}
                            sx={{ mt: 1, mr: 1 }}
                        >
                            {t('goBack')}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={onContinue}
                            sx={{ mt: 1, mr: 1 }}
                        >
                            {t('continue')}
                        </Button>
                    </div>
                </Box>
            </Grid>
        </Grid>
    </>;
};
