import {
    availableChartTypes,
    ChartType,
    isComponentMetricType,
    isGroupMetricType,
    isOfficialMetricType,
    MeasurementCategory,
    METRIC_TYPES,
    MetricType
} from "@/components/Measurements/models/Category";
import {
    useAddMeasurementCategoryQuery,
    useEditMeasurementCategoryQuery,
    useMeasurementsCategoryQuery
} from "@/components/Measurements/queries";
import { Button, MenuItem, Stack, TextField } from "@mui/material";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import { Form, Formik } from "formik";
import React from 'react';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface CategoryFormProps {
    category?: MeasurementCategory,
    closeFn?: () => void,
}

/** What the chart type picker offers: no override, plus what the type allows */
const chartTypeChoices = (metricType: MetricType): ChartType[] =>
    ['auto', ...availableChartTypes(metricType)];

export const CategoryForm = ({ category, closeFn }: CategoryFormProps) => {

    const [t] = useTranslation();
    const useAddCategoryQuery = useAddMeasurementCategoryQuery();
    const useEditCategoryQuery = useEditMeasurementCategoryQuery(category?.id || '');
    const categoryQuery = useMeasurementsCategoryQuery();

    // Official metric types are reserved for the server-managed categories,
    // components are a structural type: they only exist as the children of
    // their group, which the server creates them with
    const metricTypeChoices = METRIC_TYPES.filter(m =>
        (!isOfficialMetricType(m) && !isComponentMetricType(m)) || m === category?.metricType);

    // Multi-value groups, e.g. blood pressure. Mirrors the server rules: only
    // top-level, entry-free categories can be parents, a category that already
    // has children cannot be nested, a typed category stays top-level, and a
    // group takes only its own components. The current parent always stays
    // selectable so editing something else doesn't silently drop it.
    const categories = categoryQuery.data ?? [];
    const hasChildren = category?.id != null && categories.some(c => c.parentId === category.id);
    const parentCandidates = categories.filter(c =>
        c.parentId === null
        && c.id !== category?.id
        && !isGroupMetricType(c.metricType)
        && (c.entries.length === 0 || c.id === category?.parentId)
    );
    // Match the backend column limits. We do NOT enforce a minimum length:
    // many users have legitimate 1-2 char names (e.g. CJK abbreviations
    // like 体重 / 体脂), and the backend allows them.
    const validationSchema = yup.object({
        name: yup
            .string()
            .required(t('forms.fieldRequired'))
            .max(100, t('forms.maxLength', { chars: '100' })),
        unit: yup
            .string()
            .required(t('forms.fieldRequired'))
            .max(30, t('forms.maxLength', { chars: '30' }))
    });


    return (
        <Formik
            initialValues={{
                name: category ? category.name : "",
                unit: category ? category.unit : "",
                metricType: category ? category.metricType : 'custom' as MetricType,
                chartType: category ? category.chartType : 'auto' as ChartType,
                // the empty string stands in for "no group", MUI selects
                // don't accept null values
                parentId: category?.parentId ?? "",
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                const parentId = values.parentId === "" ? null : values.parentId;
                // The form closes only once the server took the category, so a
                // rejected write is shown instead of disappearing with it
                const options = { onSuccess: () => closeFn?.() };

                // Edit existing category
                if (category) {
                    useEditCategoryQuery.mutate(MeasurementCategory.clone(category, {
                        name: values.name,
                        unit: values.unit,
                        metricType: values.metricType,
                        chartType: values.chartType,
                        parentId: parentId,
                    }), options);
                } else {
                    useAddCategoryQuery.mutate(new MeasurementCategory(
                        null,
                        values.name,
                        values.unit,
                        undefined,
                        values.metricType,
                        false,
                        parentId,
                        0,
                        values.chartType,
                    ), options);
                }
            }}
        >
            {formik => (
                <Form>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            id="name"
                            label={t('name')}
                            error={formik.touched.name && Boolean(formik.touched.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            {...formik.getFieldProps('name')}
                        />
                        <TextField
                            fullWidth
                            id="unit"
                            label={t('unit')}
                            error={formik.touched.unit && Boolean(formik.errors.unit)}
                            helperText={
                                formik.touched.unit && formik.errors.unit
                                    ? formik.errors.unit
                                    : t('measurements.unitFormHelpText')
                            }
                            {...formik.getFieldProps('unit')}
                        />
                        <TextField
                            select
                            fullWidth
                            id="metricType"
                            label={t('measurements.metricType')}
                            disabled={category?.isOfficial}
                            {...formik.getFieldProps('metricType')}
                            onChange={event => {
                                const metricType = event.target.value as MetricType;
                                formik.setFieldValue('metricType', metricType);
                                // Bars are no choice for a sample type and a
                                // line is none for a summed one, so a pick that
                                // the new type cannot be drawn as goes back to
                                // being derived
                                if (!chartTypeChoices(metricType).includes(formik.values.chartType)) {
                                    formik.setFieldValue('chartType', 'auto');
                                }
                            }}
                        >
                            {metricTypeChoices.map(metricType =>
                                <MenuItem key={metricType} value={metricType}>
                                    {t(`measurements.metricTypes.${metricType}`)}
                                </MenuItem>
                            )}
                        </TextField>
                        {/*
                          * Only the shapes that are a matter of taste are
                          * offered, and only those the metric type can be drawn
                          * as. A group gets no picker at all, its chart follows
                          * from what its components are to each other; a
                          * category with children is one whatever its metric
                          * type says, which is also how the charts decide
                          */}
                        {!hasChildren && availableChartTypes(formik.values.metricType).length > 0 &&
                            <TextField
                                select
                                fullWidth
                                id="chartType"
                                label={t('measurements.chartType')}
                                {...formik.getFieldProps('chartType')}
                            >
                                {chartTypeChoices(formik.values.metricType).map(chartType =>
                                    <MenuItem key={chartType} value={chartType}>
                                        {t(`measurements.chartTypes.${chartType}`)}
                                    </MenuItem>
                                )}
                            </TextField>
                        }
                        {!hasChildren && formik.values.metricType === 'custom'
                            && parentCandidates.length > 0 &&
                            <TextField
                                select
                                fullWidth
                                id="parentId"
                                label={t('measurements.partOfGroup')}
                                {...formik.getFieldProps('parentId')}
                            >
                                <MenuItem value="">{t('measurements.noGroup')}</MenuItem>
                                {parentCandidates.map(candidate =>
                                    <MenuItem key={candidate.id} value={candidate.id!}>
                                        {candidate.name}
                                    </MenuItem>
                                )}
                            </TextField>
                        }
                        <FormQueryErrors
                            mutationQuery={category ? useEditCategoryQuery : useAddCategoryQuery} />
                        <Stack direction="row" sx={{ justifyContent: "end", mt: 2 }}>
                            <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                                {t('submit')}
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};
