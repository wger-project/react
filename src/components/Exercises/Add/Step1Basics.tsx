import React from "react";
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { Form, Formik } from "formik";
import { addExerciseDataType } from "components/Exercises/models/exerciseBase";
import { useCategoriesQuery, useMusclesQuery } from "components/Exercises/queries";
import { LoadingWidget } from "components/Core/LoadingWidget/LoadingWidget";
import { getTranslationKey } from "utils/strings";


type Step1BasicsProps = {
    onContinue: React.MouseEventHandler<HTMLButtonElement>;
    setNewExerciseData: React.Dispatch<React.SetStateAction<addExerciseDataType>>;
    newExerciseData: addExerciseDataType;
}


export const Step1Basics = ({ onContinue, setNewExerciseData, newExerciseData }: Step1BasicsProps) => {
    const [t] = useTranslation();

    const [category, setCategory] = React.useState<string>('');
    const [alternativeNamesEn, setAlternativeNamesEn] = React.useState<string[]>(newExerciseData.alternativeNamesEn);
    const handleCategoryChange = (event: SelectChangeEvent) => {
        setCategory(event.target.value);
    };

    const categoryQuery = useCategoriesQuery();
    const musclesQuery = useMusclesQuery();

    const validationSchema = yup.object({
        nameEn: yup
            .string()
            .min(5, t('forms.value-too-short'))
            .max(40, t('forms.value-too-long'))
            .required(t('forms.field-required')),
    });

    return <Formik
        initialValues={{
            nameEn: newExerciseData.nameEn,
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
            console.log('Submitting the form with values: ', values);

            setNewExerciseData({
                ...newExerciseData,
                nameEn: values.nameEn,
                alternativeNamesEn: alternativeNamesEn,
                category: parseInt(category),
            });

            // @ts-ignore
            onContinue!(undefined);
        }}
    >
        {formik => (
            <Form>
                <Typography>Help text goes here</Typography>
                <Stack spacing={2}>
                    <TextField
                        id="nameEn"
                        label="Name"
                        variant="standard"
                        error={
                            Boolean(formik.errors.nameEn && formik.touched.nameEn)
                        }
                        helperText={
                            Boolean(formik.errors.nameEn && formik.touched.nameEn)
                                ? formik.errors.nameEn
                                : ''
                        }
                        {...formik.getFieldProps('nameEn')}
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
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                label="Alternative names"
                            />
                        )}
                    />
                    {categoryQuery.isLoading ? (
                        <Box>
                            <LoadingWidget />
                        </Box>
                    ) : (
                        <FormControl fullWidth>
                            <InputLabel id="label-category">Category</InputLabel>
                            <Select
                                labelId="label-category"
                                id="category"
                                value={category}
                                onChange={handleCategoryChange}
                                label="Category"
                            >
                                <MenuItem value=''></MenuItem>
                                {categoryQuery.data!.map(category => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {t(getTranslationKey(category.name))}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {musclesQuery.isLoading ? (
                        <Box>
                            <LoadingWidget />
                        </Box>
                    ) : (
                        <Autocomplete
                            multiple
                            id="tags-standard"
                            options={musclesQuery.data!}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label={t('exercises.muscles')}
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
                            id="tags-standard"
                            options={musclesQuery.data!}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label={t('exercises.secondaryMuscles')}
                                />
                            )}
                        />
                    )}
                </Stack>

                <Box sx={{ mb: 2 }}>
                    <div>
                        <Button
                            variant="contained"
                            type="submit"
                            sx={{ mt: 1, mr: 1 }}
                        >
                            {t('continue')}
                        </Button>
                        <Button
                            disabled={true}
                            sx={{ mt: 1, mr: 1 }}
                        >
                            {t('back')}
                        </Button>
                    </div>
                </Box>
            </Form>
        )}
    </Formik>;
};