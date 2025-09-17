import { Autocomplete, Box, Button, MenuItem, Stack, TextField, } from "@mui/material";
import Grid from '@mui/material/Grid';
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { ExerciseAliases } from "components/Exercises/forms/ExerciseAliases";
import { ExerciseEquipmentSelect } from "components/Exercises/forms/ExerciseEquipmentSelect";
import { ExerciseName } from "components/Exercises/forms/ExerciseName";
import { ExerciseSelect } from "components/Exercises/forms/ExerciseSelect";
import { alternativeNameValidator, categoryValidator, nameValidator } from "components/Exercises/forms/yupValidators";
import { useCategoriesQuery, useEquipmentQuery, useMusclesQuery, } from "components/Exercises/queries";
import { MuscleOverview } from "components/Muscles/MuscleOverview";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useExerciseSubmissionStateValue } from "state";
import * as exerciseReducer from "state/exerciseSubmissionReducer";
import * as yup from "yup";

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

    return (
        <Formik
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
                dispatch(exerciseReducer.setNameEn(values.nameEn));
                dispatch(exerciseReducer.setCategory(values.category as number));
                dispatch(exerciseReducer.setAlternativeNamesEn(values.newAlternativeNameEn));
                dispatch(exerciseReducer.setEquipment(values.equipment));

                onContinue!();
            }}
        >
            {formik => {
                return (
                    (<Form>
                        <Stack spacing={2}>
                            <ExerciseName fieldName={'nameEn'} />
                            <ExerciseAliases fieldName={'newAlternativeNameEn'} />

                            {categoryQuery.isLoading
                                ? <Box> <LoadingWidget /> </Box>
                                : <ExerciseSelect
                                    fieldName={'category'}
                                    options={categoryQuery.data!.map(category => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.translatedName}
                                        </MenuItem>
                                    ))}
                                />
                            }

                            {equipmentQuery.isLoading
                                ? <Box> <LoadingWidget /> </Box>
                                : <ExerciseEquipmentSelect fieldName={'equipment'} options={equipmentQuery.data!} />
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
                                                value={formik.getFieldProps("muscles").value}
                                            />
                                        )}
                                    />
                                </>
                            }
                            <Grid container>
                                <Grid display="flex" justifyContent={"center"} size={6}>
                                    <MuscleOverview
                                        primaryMuscles={primaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                        secondaryMuscles={secondaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                        isFront={true}
                                    />
                                </Grid>
                                <Grid display="flex" justifyContent={"center"} size={6}>
                                    <MuscleOverview
                                        primaryMuscles={primaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                        secondaryMuscles={secondaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                        isFront={false}
                                    />
                                </Grid>
                            </Grid>
                        </Stack>
                        <Grid container>
                            <Grid display="flex" justifyContent={"end"} size={12}>
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
                    </Form>)
                );
            }}
        </Formik>
    );
};
