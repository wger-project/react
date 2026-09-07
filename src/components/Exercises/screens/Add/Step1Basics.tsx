import { Autocomplete, Box, Button, MenuItem, Stack, TextField, } from "@mui/material";
import Grid from '@mui/material/Grid';
import { LoadingWidget } from "@/core/ui/LoadingWidget/LoadingWidget";
import type { StepProps } from "@/components/Exercises/screens/Add/AddExerciseStepper";
import { AliasItem, ExerciseAliases } from "@/components/Exercises/forms/ExerciseAliases";
import { ExerciseEquipmentSelect } from "@/components/Exercises/forms/ExerciseEquipmentSelect";
import { ExerciseName } from "@/components/Exercises/forms/ExerciseName";
import { ExerciseSelect } from "@/components/Exercises/forms/ExerciseSelect";
import { alternativeNameValidator, categoryValidator, nameValidator } from "@/components/Exercises/forms/yupValidators";
import { useCategoriesQuery, useEquipmentQuery, useMusclesQuery, } from "@/components/Exercises/queries";
import { MuscleOverview } from "@/components/Muscles/MuscleOverview";
import { useAppForm } from "@/core/forms/appForm";
import { yupSchema } from "@/core/forms/formUtils";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useExerciseSubmissionStateValue } from "@/components/Exercises/screens/Add/state";
import * as exerciseReducer from "@/components/Exercises/screens/Add/state/exerciseSubmissionReducer";
import * as yup from "yup";

interface Step1Values {
    nameEn: string,
    newAlternativeNameEn: AliasItem[],
    // the empty string stands in for "not picked yet", MUI selects don't accept null
    category: number | '',
    equipment: number[],
}

export const Step1Basics = ({ onContinue }: StepProps) => {
    const [t] = useTranslation();
    const [state, dispatch] = useExerciseSubmissionStateValue();
    const [primaryMuscles, setPrimaryMuscles] = useState<number[]>(state.muscles);
    const [secondaryMuscles, setSecondaryMuscles] = useState<number[]>(state.musclesSecondary);

    useEffect(() => {
        dispatch(exerciseReducer.setPrimaryMuscles(primaryMuscles));
    }, [dispatch, primaryMuscles]);

    useEffect(() => {
        dispatch(exerciseReducer.setSecondaryMuscles(secondaryMuscles));
    }, [dispatch, secondaryMuscles]);


    // Load data from server
    const categoryQuery = useCategoriesQuery();
    const musclesQuery = useMusclesQuery();
    const equipmentQuery = useEquipmentQuery();

    const validationSchema = yup.object({
        nameEn: nameValidator(),
        newAlternativeNameEn: alternativeNameValidator(),
        category: categoryValidator(),
    });

    const defaultValues: Step1Values = {
        nameEn: state.nameEn,
        // The alias field and its validator work with objects, the state keeps plain strings
        newAlternativeNameEn: state.alternativeNamesEn.map(alias => ({ alias })),
        category: state.category !== null ? state.category : '',
        equipment: state.equipment,
    };

    const form = useAppForm({
        defaultValues,
        validators: { onChange: yupSchema<Step1Values>(validationSchema) },
        onSubmit: async ({ value }) => {
            dispatch(exerciseReducer.setNameEn(value.nameEn));
            dispatch(exerciseReducer.setCategory(value.category as number));
            dispatch(exerciseReducer.setAlternativeNamesEn(value.newAlternativeNameEn.map(item => item.alias)));
            dispatch(exerciseReducer.setEquipment(value.equipment));

            onContinue!();
        },
    });

    return (
        <form onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
        }}>
            <Stack spacing={2}>
                <form.AppField name="nameEn">{() => <ExerciseName />}</form.AppField>
                <form.AppField name="newAlternativeNameEn">{() => <ExerciseAliases />}</form.AppField>

                {categoryQuery.isLoading
                    ? <Box> <LoadingWidget /> </Box>
                    : <form.AppField name="category">
                        {() => <ExerciseSelect
                            options={categoryQuery.data!.map(category => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.translatedName}
                                </MenuItem>
                            ))}
                        />}
                    </form.AppField>
                }

                {equipmentQuery.isLoading
                    ? <Box> <LoadingWidget /> </Box>
                    : <form.AppField name="equipment">
                        {() => <ExerciseEquipmentSelect options={equipmentQuery.data!} />}
                    </form.AppField>
                }

                {musclesQuery.isLoading
                    ? <Box> <LoadingWidget /> </Box>
                    : <>
                        <Autocomplete
                            multiple
                            id="muscles"
                            options={musclesQuery.data!.map(m => m.id)}
                            getOptionDisabled={(option) =>
                                secondaryMuscles.includes(option)
                            }
                            getOptionLabel={option => musclesQuery.data!.find(m => m.id === option)!.getName()}
                            value={primaryMuscles}
                            onChange={(event, newValue) => {
                                setPrimaryMuscles(newValue);
                            }}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label={t("exercises.muscles")}
                                />
                            )}
                        />
                        <Autocomplete
                            multiple
                            id="secondary-muscles"
                            options={musclesQuery.data!.map(m => m.id)}
                            getOptionDisabled={(option) =>
                                primaryMuscles.includes(option)
                            }
                            getOptionLabel={option => musclesQuery.data!.find(m => m.id === option)!.getName()}
                            value={secondaryMuscles}
                            onChange={(event, newValue) => {
                                setSecondaryMuscles(newValue);
                            }}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label={t("exercises.secondaryMuscles")}
                                />
                            )}
                        />
                        <Grid container>
                            <Grid sx={{ display: "flex", justifyContent: "center" }} size={6}>
                                <MuscleOverview
                                    primaryMuscles={primaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                    secondaryMuscles={secondaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                    isFront={true}
                                />
                            </Grid>
                            <Grid sx={{ display: "flex", justifyContent: "center" }} size={6}>
                                <MuscleOverview
                                    primaryMuscles={primaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                    secondaryMuscles={secondaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                    isFront={false}
                                />
                            </Grid>
                        </Grid>
                    </>
                }
            </Stack>
            <Grid container>
                <Grid sx={{ display: "flex", justifyContent: "end" }} size={12}>
                    <Box sx={{ mb: 2 }}>
                        <div>
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
