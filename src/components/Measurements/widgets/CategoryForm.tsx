import { Button, Stack, TextField, FormControl, InputLabel, MenuItem, Select, CircularProgress, FormControlLabel, Switch } from "@mui/material";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { useAddMeasurementCategoryQuery, useEditMeasurementCategoryQuery, useDynamicCategoriesQuery } from "@/components/Measurements/queries";
import { Form, Formik } from "formik";
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface CategoryFormProps {
    category?: MeasurementCategory,
    closeFn?: () => void,
}

export const CategoryForm = ({ category, closeFn }: CategoryFormProps) => {
    const [t] = useTranslation();
    const addCategoryQuery = useAddMeasurementCategoryQuery();
    const editCategoryQuery = useEditMeasurementCategoryQuery(category?.id || 0);
    
    // Fetch dynamic options from the backend
    const dynamicQuery = useDynamicCategoriesQuery();

    // Track if we are using a preset to disable manual editing
    const [preset, setPreset] = useState<number | string>(
        category?.is_dynamic ? category.id : 'custom'
    );

    const validationSchema = yup.object({
        name: yup
            .string()
            .required(t('forms.fieldRequired'))
            .max(20, t('forms.maxLength', { chars: '20' }))
            .min(3, t('forms.minLength', { chars: '3' })),
        unit: yup
            .string()
            .required(t('forms.fieldRequired'))
            .max(5, t('forms.maxLength', { chars: '5' }))
    });

    return (
        <Formik
            initialValues={{
                name: category ? category.name : "",
                unit: category ? category.unit : "",
                is_dynamic: category ? category.is_dynamic : false,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                if (category) {
                    editCategoryQuery.mutate({ ...values, id: category.id });
                } else {
                    addCategoryQuery.mutate(values);
                }
                if (closeFn) closeFn();
            }}
        >
            {formik => (
                <Form>
                    <Stack spacing={2}>
                        {/* Only show template picker for new categories */}
                        {!category && (
                            <FormControl fullWidth>
                                <InputLabel id="template-select-label">Template</InputLabel>
                                <Select
                                    labelId="template-select-label"
                                    value={preset}
                                    label="Template"
                                    disabled={dynamicQuery.isLoading}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setPreset(val);
                                        
                                        if (val === 'custom') {
                                            formik.setValues({ name: '', unit: '', is_dynamic: false });
                                        } else {
                                            const selected = dynamicQuery.data?.find(d => d.id === val);
                                            if (selected) {
                                                formik.setValues({
                                                    name: selected.name,
                                                    unit: selected.unit,
                                                    is_dynamic: true
                                                });
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="custom">Custom (Manual)</MenuItem>
                                    {dynamicQuery.isLoading && <MenuItem disabled><CircularProgress size={20} /></MenuItem>}
                                    {dynamicQuery.data?.map(cat => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            {cat.name} (Auto)
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <TextField
                            fullWidth
                            id="name"
                            label={t('name')}
                            disabled={preset !== 'custom'}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            {...formik.getFieldProps('name')}
                        />
                        <TextField
                            fullWidth
                            id="unit"
                            label={t('unit')}
                            disabled={preset !== 'custom'}
                            error={formik.touched.unit && Boolean(formik.errors.unit)}
                            helperText={formik.touched.unit && formik.errors.unit}
                            {...formik.getFieldProps('unit')}
                        />
                        
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formik.values.is_dynamic}
                                    disabled={preset !== 'custom'}
                                    onChange={(e) => formik.setFieldValue('is_dynamic', e.target.checked)}
                                />
                            }
                            label="Is Dynamic"
                        />

                        <Stack direction="row" sx={{ justifyContent: "end", mt: 2 }}>
                            <Button color="primary" variant="contained" type="submit">
                                {t('submit')}
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};