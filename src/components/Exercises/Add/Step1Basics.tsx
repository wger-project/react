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

export const Step1Basics = (props: { onContinue: React.MouseEventHandler<HTMLButtonElement> | undefined; onBack: React.MouseEventHandler<HTMLButtonElement> | undefined; }) => {
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
        name: yup
            .string()
            .min(5, t('forms.value-too-short'))
            .max(40, t('forms.value-too-long'))
            .required(t('forms.field-required')),
        alternativeNames: yup
            .string(),


    });

    return <Formik
        initialValues={{
            name: '',
            alternativeNames: '',
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {

            console.log('Submitting the form with values: ', values);

            // @ts-ignore
            props.onContinue!(undefined);
        }}
    >
        {formik => (
            <Form>
                <Typography>Help text goes here</Typography>
                <Stack spacing={2}>
                    <TextField
                        id="name"
                        label="Name"
                        variant="standard"
                        error={
                            Boolean(formik.errors.name && formik.touched.name)
                        }
                        helperText={
                            Boolean(formik.errors.name && formik.touched.name)
                                ? formik.errors.name
                                : ''
                        }
                        {...formik.getFieldProps('name')}
                    />
                    <TextField
                        id="alternative-names"
                        label="Alternative names"
                        rows={3}
                        variant="standard"
                        error={
                            Boolean(formik.errors.alternativeNames && formik.touched.alternativeNames)
                        }
                        helperText={
                            Boolean(formik.errors.alternativeNames && formik.touched.alternativeNames)
                                ? formik.errors.alternativeNames
                                : ''
                        }
                        {...formik.getFieldProps('alternativeNames')}
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
                            onClick={props.onBack}
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