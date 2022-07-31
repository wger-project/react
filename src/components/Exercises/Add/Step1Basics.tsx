import React, { ChangeEvent, useState } from "react";
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


export const Step1Basics = ({
                                onContinue,
                                setNewExerciseData,
                                newExerciseData,
                            }: StepProps) => {
    const [t] = useTranslation();

    const [alternativeNamesEn, setAlternativeNamesEn] = useState<string[]>(newExerciseData.alternativeNamesEn);
    const [muscles, setMuscles] = useState<number[]>(newExerciseData.muscles);
    const [secondaryMuscles, setSecondaryMuscles] = useState<number[]>(newExerciseData.musclesSecondary);
    const [equipment, setEquipment] = useState<number[]>(newExerciseData.equipment);

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
                nameEn: newExerciseData.nameEn,
                newAlternativeNameEn: "",
                category: newExerciseData.category,
                muscles: newExerciseData.muscles,
                musclesSecondary: newExerciseData.musclesSecondary,
            }}
            validationSchema={validationSchema}
            onSubmit={values => {
                setNewExerciseData({
                    ...newExerciseData,
                    nameEn: values.nameEn,
                    category: values.category,
                    alternativeNamesEn: alternativeNamesEn,
                    muscles: muscles,
                    musclesSecondary: secondaryMuscles,
                    equipment: equipment,
                });

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
                                    value={muscles}
                                    onChange={(event, newValue) => {
                                        setMuscles(newValue);
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
                                        muscles.includes(option)
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
                                        primaryMuscles={muscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                        secondaryMuscles={secondaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                        isFront={true}
                                    />
                                </Grid>
                                <Grid item xs={6} display="flex" justifyContent={"center"}>
                                    <MuscleOverview
                                        primaryMuscles={muscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                        secondaryMuscles={secondaryMuscles.map(m => musclesQuery.data!.find(mq => mq.id === m)!)}
                                        isFront={false}
                                    />
                                </Grid>
                            </Grid>
                        </Stack>

                        <Box sx={{ mb: 2 }}>
                            <div>
                                <Button variant="contained" type="submit" sx={{ mt: 1, mr: 1 }}>
                                    {t("continue")}
                                </Button>
                                <Button disabled={true} sx={{ mt: 1, mr: 1 }}>
                                    {t("goBack")}
                                </Button>
                            </div>
                        </Box>
                    </Form>
                );
            }}
        </Formik>
    );
};
