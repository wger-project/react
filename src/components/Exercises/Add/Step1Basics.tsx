import React, { useEffect, useState } from "react";
import { Autocomplete, Box, Button, Grid, MenuItem, Stack, TextField, } from "@mui/material";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { Form, Formik } from "formik";
import {
    useCategoriesQuery,
    useEquipmentQuery,
    useMusclesQuery,
} from "components/Exercises/queries";
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { getTranslationKey } from "utils/strings";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { MuscleOverview } from "components/Muscles/MuscleOverview";
import { useExerciseStateValue } from "state";
import * as exerciseReducer from "state/exerciseReducer";
import { ExerciseName } from "components/Exercises/forms/ExerciseName";
import {
    alternativeNameValidator,
    categoryValidator,
    nameValidator
} from "components/Exercises/forms/yupValidators";
import { ExerciseAliases } from "components/Exercises/forms/ExerciseAliases";
import { ExerciseSelect } from "components/Exercises/forms/ExerciseSelect";

export const Step1Basics = ({onContinue}: StepProps) => {
    const [t] = useTranslation();
    const [state, dispatch] = useExerciseStateValue();

    const [nameEn, setNameEn] = useState<string>(state.nameEn);
    const [alternativeNamesEn, setAlternativeNamesEn] = useState<string[]>(state.alternativeNamesEn);
    const [category, setCategory] = useState<number | null>(state.category);
    const [primaryMuscles, setPrimaryMuscles] = useState<number[]>(state.muscles);
    const [secondaryMuscles, setSecondaryMuscles] = useState<number[]>(state.musclesSecondary);
    const [equipment, setEquipment] = useState<number[]>(state.equipment);


    useEffect(() => {
        dispatch(exerciseReducer.setNameEn(nameEn));
    }, [dispatch, nameEn]);

    useEffect(() => {
        dispatch(exerciseReducer.setAlternativeNamesEn(alternativeNamesEn));
    }, [dispatch, alternativeNamesEn]);

    useEffect(() => {
        dispatch(exerciseReducer.setCategory(category));
    }, [dispatch, category]);

    useEffect(() => {
        dispatch(exerciseReducer.setEquipment(equipment));
    }, [dispatch, equipment]);

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
        nameEn: nameValidator(t),
        newAlternativeNameEn: alternativeNameValidator(t),
        category: categoryValidator(t),
    });

    return <Formik
        initialValues={{
            nameEn: state.nameEn,
            newAlternativeNameEn: state.alternativeNamesEn,
            category: state.category !== null ? state.category : '',
            muscles: state.muscles,
            equipment: state.equipment,
            musclesSecondary: state.musclesSecondary,
        }}
        validationSchema={validationSchema}
        onSubmit={values => {
            console.log(values);
            setNameEn(values.nameEn);
            setCategory(values.category as number);
            setAlternativeNamesEn(values.newAlternativeNameEn);
            setEquipment(values.equipment);

            onContinue!();
        }}
    >
        {formik => {
            return (
                <Form>
                    <Stack spacing={2}>
                        <ExerciseName fieldName={'nameEn'} />
                        <ExerciseAliases fieldName={'newAlternativeNameEn'} />

                        {categoryQuery.isLoading
                            ? <Box> <LoadingWidget /> </Box>
                            : <ExerciseSelect
                                fieldName={'category'}
                                options={categoryQuery.data!.map(category => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {t(getTranslationKey(category.name))}
                                    </MenuItem>
                                ))}
                            />
                        }

                        {equipmentQuery.isLoading
                            ? <Box> <LoadingWidget /> </Box>
                            :
                            <Autocomplete
                                multiple
                                id="equipment"
                                options={equipmentQuery.data!.map(e => e.id)}
                                value={equipment}
                                getOptionLabel={option => t(getTranslationKey(equipmentQuery.data!.find(e => e.id === option)!.name))}
                                onChange={(event, newValue) => {
                                    setEquipment(newValue);
                                }}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        label={t("exercises.equipment")}
                                        value={formik.getFieldProps("muscles").value}
                                    />
                                )}
                            />
                        }

                        {musclesQuery.isLoading ? (
                            <Box>
                                <LoadingWidget />
                            </Box>
                        ) : (
                            <Autocomplete
                                multiple
                                id="muscles"
                                options={musclesQuery.data!.map(m => m.id)}
                                getOptionDisabled={(option) =>
                                    secondaryMuscles.includes(option)
                                }
                                getOptionLabel={option => musclesQuery.data!.find(m => m.id === option)!.getName(t)}
                                value={primaryMuscles}
                                onChange={(event, newValue) => {
                                    setPrimaryMuscles(newValue);
                                }}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        label={t("exercises.muscles")}
                                        value={formik.getFieldProps("muscles").value}
                                        onChange={e => {
                                            formik.setFieldValue(
                                                formik.getFieldProps("muscles").name,
                                                e.target.value
                                            );
                                        }}
                                    />
                                )}
                            />
                        )}
                        {musclesQuery.isLoading ? (
                            <Box>
                                <LoadingWidget />
                            </Box>
                        ) : (
                            <Autocomplete
                                multiple
                                id="secondary-muscles"
                                options={musclesQuery.data!.map(m => m.id)}
                                getOptionDisabled={(option) =>
                                    primaryMuscles.includes(option)
                                }
                                getOptionLabel={option => musclesQuery.data!.find(m => m.id === option)!.getName(t)}
                                value={secondaryMuscles}
                                onChange={(event, newValue) => {
                                    setSecondaryMuscles(newValue);
                                }}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        label={t("exercises.secondaryMuscles")}
                                        value={formik.getFieldProps("muscles").value}
                                    />
                                )}
                            />
                        )}
                        <Grid container>
                            <Grid item xs={6} display="flex" justifyContent={"center"}>
                                <MuscleOverview
                                    primaryMuscles={primaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                    secondaryMuscles={secondaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                    isFront={true}
                                />
                            </Grid>
                            <Grid item xs={6} display="flex" justifyContent={"center"}>
                                <MuscleOverview
                                    primaryMuscles={primaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                    secondaryMuscles={secondaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                    isFront={false}
                                />
                            </Grid>
                        </Grid>
                    </Stack>

                    <Grid container>
                        <Grid item xs={12} display="flex" justifyContent={"end"}>
                            <Box sx={{mb: 2}}>
                                <div>
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
            );
        }}
    </Formik>;
};
