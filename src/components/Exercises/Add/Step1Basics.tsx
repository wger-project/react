import React, { ChangeEvent, useEffect, useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { Form, Formik } from "formik";
import { useCategoriesQuery, useEquipmentQuery, useMusclesQuery, } from "components/Exercises/queries";
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { getTranslationKey } from "utils/strings";
import { StepProps } from "components/Exercises/Add/AddExerciseStepper";
import { MuscleOverview } from "components/Muscles/MuscleOverview";
import { useExerciseStateValue } from "state";
import * as exerciseReducer from "state/exerciseReducer";


export const Step1Basics = ({ onContinue }: StepProps) => {
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
        nameEn: yup
            .string()
            .min(5, t("forms.valueTooShort"))
            .max(40, t("forms.valueTooLong"))
            .required(t("forms.fieldRequired")),
        newAlternativeNameEn: yup
            .string()
            .min(5, t("forms.valueTooShort"))
            .max(40, t("forms.valueTooLong")),
        category: yup.number().required(),
    });

    return (
        <Formik
            initialValues={{
                nameEn: state.nameEn,
                newAlternativeNameEn: "",
                category: state.category !== null ? state.category : '',
                muscles: state.muscles,
                musclesSecondary: state.musclesSecondary,
            }}
            validationSchema={validationSchema}
            onSubmit={values => {

                // The other values are set in the respective onChange handlers
                setNameEn(values.nameEn);
                setCategory(values.category as number);

                onContinue!();
            }}
        >
            {formik => {
                return (
                    <Form>
                        <Stack spacing={2}>
                            <TextField
                                id="nameEn"
                                label={t("name")}
                                variant="standard"
                                error={Boolean(formik.errors.nameEn && formik.touched.nameEn)}
                                helperText={
                                    Boolean(formik.errors.nameEn && formik.touched.nameEn)
                                        ? formik.errors.nameEn
                                        : ""
                                }
                                {...formik.getFieldProps("nameEn")}
                            />

                            <Autocomplete
                                multiple
                                id="tags-filled"
                                options={alternativeNamesEn}
                                freeSolo
                                value={alternativeNamesEn}
                                onChange={(event, newValue) => {
                                    setAlternativeNamesEn(newValue);
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
                                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                            formik.setFieldValue(
                                                formik.getFieldProps("newAlternativeNameEn").name,
                                                event.target.value
                                            );
                                        }}
                                        error={Boolean(
                                            formik.touched.newAlternativeNameEn &&
                                            formik.errors.newAlternativeNameEn
                                        )}
                                        helperText={
                                            Boolean(
                                                formik.errors.newAlternativeNameEn &&
                                                formik.touched.newAlternativeNameEn
                                            )
                                                ? formik.errors.newAlternativeNameEn
                                                : ""
                                        }
                                    />
                                )}
                            />

                            {categoryQuery.isLoading ? (
                                <Box>
                                    <LoadingWidget />
                                </Box>
                            ) : (
                                <FormControl fullWidth>
                                    <InputLabel id="label-category">{t("category")}</InputLabel>
                                    <Select
                                        labelId="label-category"
                                        id="category"
                                        value={formik.getFieldProps("category").value}
                                        onChange={e => {
                                            formik.setFieldValue(
                                                formik.getFieldProps("category").name,
                                                e.target.value
                                            );
                                            // setCategory(e.target.value);
                                        }}
                                        label={t("category")}
                                        error={Boolean(
                                            formik.touched.category && formik.errors.category
                                        )}
                                    >
                                        {categoryQuery.data!.map(category => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {t(getTranslationKey(category.name))}
                                            </MenuItem>
                                        ))}

                                    </Select>
                                    {Boolean(
                                            formik.errors.category && formik.touched.category
                                        ) &&
                                        <FormHelperText>{t("forms.fieldRequired")}</FormHelperText>
                                    }

                                </FormControl>
                            )}
                            {equipmentQuery.isLoading ? (
                                <Box>
                                    <LoadingWidget />
                                </Box>
                            ) : (
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
                            )}
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
                    </Form>
                );
            }}
        </Formik>
    );
};
