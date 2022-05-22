import React from "react";
import {
    Autocomplete,
    Box,
    Button,
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
import { Muscle } from "components/Exercises/models/muscle";
import { addExerciseDataType } from "components/Exercises/models/exerciseBase";


type Step1BasicsProps = {
    onContinue: React.MouseEventHandler<HTMLButtonElement>;
    setNewExerciseData: React.Dispatch<React.SetStateAction<addExerciseDataType>>;
    newExerciseData: addExerciseDataType;
}


export const Step1Basics = ({ onContinue, setNewExerciseData, newExerciseData }: Step1BasicsProps) => {
    const [t] = useTranslation();

    const [category, setCategory] = React.useState<string>('');
    const handleCategoryChange = (event: SelectChangeEvent) => {
        setCategory(event.target.value);
    };

    const muscles = [
        new Muscle(1, "muscle 1", true),
        new Muscle(2, "muscle 2", false),
        new Muscle(3, "muscle 3", false),
        new Muscle(4, "muscle 4", false),
    ];


    const validationSchema = yup.object({
        nameEn: yup
            .string()
            .min(5, t('forms.value-too-short'))
            .max(40, t('forms.value-too-long'))
            .required(t('forms.field-required')),
        alternativeNamesEn: yup
            .string(),


    });

    return <Formik
        initialValues={{
            nameEn: '',
            alternativeNamesEn: '',
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {

            console.log('Submitting the form with values: ', values);

            setNewExerciseData({
                ...newExerciseData,
                nameEn: values.nameEn,
                alternativeNamesEn: values.alternativeNamesEn.split(',').map(name => name.trim()),
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
                    <TextField
                        id="alternative-names"
                        label="Alternative names"
                        rows={3}
                        variant="standard"
                        error={
                            Boolean(formik.errors.alternativeNamesEn && formik.touched.alternativeNamesEn)
                        }
                        helperText={
                            Boolean(formik.errors.alternativeNamesEn && formik.touched.alternativeNamesEn)
                                ? formik.errors.alternativeNamesEn
                                : ''
                        }
                        {...formik.getFieldProps('alternativeNamesEn')}
                    />
                    <FormControl fullWidth>
                        <InputLabel id="label-category">Category</InputLabel>
                        <Select
                            labelId="label-category"
                            id="category"
                            value={category}
                            onChange={handleCategoryChange}
                            label="Category"
                        >
                            <MenuItem value={1}>Abs</MenuItem>
                            <MenuItem value={2}>Chest</MenuItem>
                            <MenuItem value={3}>Legs</MenuItem>
                        </Select>

                    </FormControl>
                    <Autocomplete
                        multiple
                        id="tags-standard"
                        options={muscles}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                label={t('exercises.muscles')}
                            />
                        )}
                    />
                    <Autocomplete
                        multiple
                        id="tags-standard"
                        options={muscles}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                label={t('exercises.secondaryMuscles')}
                            />
                        )}
                    />

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