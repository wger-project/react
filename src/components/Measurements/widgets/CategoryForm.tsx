import {
    availableChartTypes,
    AVERAGE_WINDOWS,
    averageWindowOf,
    ChartType,
    isGroupMetricType,
    MeasurementCategory,
    MetricType,
    resolveChartType,
    TREND_CHARACTERS,
    TrendCharacter,
    trendOf
} from "@/components/Measurements/models/Category";
import { getExercisesByUuids } from "@/components/Exercises";
import {
    BIG_THREE_UUIDS,
    CALCULATION_NONE,
    calculationType,
    CalculationSlug,
    CalculationType,
    defaultParams,
    missingParams
} from "@/components/Measurements/models/Calculation";
import {
    useAddMeasurementCategoryQuery,
    useCategoryEntryFlagsQuery,
    useEditMeasurementCategoryQuery
} from "@/components/Measurements/queries";
import { CalculationSection } from "@/components/Measurements/widgets/CalculationSection";
import {
    Button,
    MenuItem,
    Stack,
    TextField
} from "@mui/material";
import { FormQueryErrors } from "@/core/ui/Widgets/FormError";
import { QueryKey } from "@/core/lib/consts";
import { useQueryClient } from "@tanstack/react-query";
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

/**
 * Whether the category can be drawn as a line at all, which is what the trend
 * and the average settings belong to. A summed type is drawn as bars whatever
 * is picked, and a group by what its components are.
 */
const canDrawLine = (metricType: MetricType, hasChildren: boolean): boolean =>
    !hasChildren && availableChartTypes(metricType).includes('line');

/** Whether it is drawn as one right now, i.e. whether those settings apply */
const drawsLine = (values: { metricType: MetricType, chartType: ChartType }): boolean =>
    resolveChartType(values.metricType, values.chartType) === 'line';

export const CategoryForm = ({ category, closeFn }: CategoryFormProps) => {

    const [t] = useTranslation();
    const useAddCategoryQuery = useAddMeasurementCategoryQuery();
    const useEditCategoryQuery = useEditMeasurementCategoryQuery(category?.id || '');
    // The categories are read only to offer the groups this one can join, of
    // which an entry-free one is one, so that is all that is asked of them
    const categoryQuery = useCategoryEntryFlagsQuery();

    // Name and unit belong to the user only for a free-form category. A typed
    // one takes both from its metric type, which is also what is shown for it
    const isCustom = (category?.metricType ?? 'custom') === 'custom';

    // Asked of the category itself, which carries its components: the query
    // returns the top-level ones only, so looking for a row whose parent is
    // this one never finds anything
    const hasChildren = category?.isGroup ?? false;
    // Multi-value groups, e.g. blood pressure. Mirrors the server rules: only
    // top-level, entry-free categories can be parents, a category that already
    // has children cannot be nested, a typed category stays top-level, and a
    // group takes only its own components. The current parent always stays
    // selectable so editing something else doesn't silently drop it.
    const parentCandidates = (categoryQuery.data ?? [])
        .filter(({ category: c, hasEntries }) =>
            c.parentId === null
            && c.id !== category?.id
            && !isGroupMetricType(c.metricType)
            && (!hasEntries || c.id === category?.parentId)
        )
        .map(({ category: c }) => c);
    // Match the backend column limits. We do NOT enforce a minimum length:
    // many users have legitimate 1-2 char names (e.g. CJK abbreviations
    // like 体重 / 体脂), and the backend allows them.
    const validationSchema = yup.object({
        name: yup
            .string()
            .required(t('forms.fieldRequired'))
            .max(100, t('forms.maxLength', { chars: '100' })),
        // Required only where the field is offered: a typed category takes
        // its unit from the metric type (a step count has none at all), and a
        // calculation defines what the number is, which may be a bare ratio
        unit: isCustom
            ? yup
                .string()
                .max(30, t('forms.maxLength', { chars: '30' }))
                .when('calculation', {
                    is: CALCULATION_NONE,
                    then: schema => schema.required(t('forms.fieldRequired')),
                })
            : yup.string(),
        // The parameters belong to the schema like every other field, so a
        // fixed one clears its error by itself
        params: yup.mixed().test(
            'calculation-params',
            t('measurements.calculations.paramsIncomplete'),
            function (value) {
                const picked = calculationType(this.parent.calculation);
                return picked === undefined
                    || missingParams(picked, (value ?? {}) as Record<string, unknown>).length === 0;
            },
        ),
    });


    // What the two chart settings were seeded with, which is also what decides
    // whether the user changed them
    const seededTrend = trendOf(category?.chartConfig ?? {});
    const seededWindow = averageWindowOf(category?.chartConfig ?? {});

    const storedCalculation = category?.dynamicType ?? CALCULATION_NONE;

    /** What the form holds, named so that a whole-form update can be typed */
    interface CategoryFormValues {
        name: string;
        unit: string;
        metricType: MetricType;
        chartType: ChartType;
        trend: TrendCharacter;
        averageWindow: number;
        parentId: string;
        calculation: string;
        params: Record<string, unknown>;
    }

    // Group children are in this list as well, and they are categories like
    // any other here: one can hold the entries that block a calculation, and
    // one can be the source of a ratio
    const allCategories = (categoryQuery.data ?? []).map(flag => flag.category);

    const queryClient = useQueryClient();
    // Which calculation the last pick was for, see prefillBigThree
    const pickedRef = React.useRef('');

    const [nameEdited, setNameEdited] = React.useState(category !== undefined);
    const [unitEdited, setUnitEdited] = React.useState(category !== undefined);


    /**
     * Switches the form to a calculation: its parameters start at their
     * defaults, and name and unit are prefilled as long as the user has not
     * written their own.
     */
    const pickCalculation = (
        formik: {
            values: CategoryFormValues,
            setValues: (values: CategoryFormValues) => unknown,
            setFieldValue: (field: string, value: unknown) => unknown,
        },
        type?: CalculationType,
    ) => {
        if (type === undefined) {
            return;
        }
        pickedRef.current = type.slug;

        // One update, not one per field: each validates on its own and would
        // check the new parameters against the calculation before them
        formik.setValues({
            ...formik.values,
            calculation: type.slug,
            params: defaultParams(type),
            ...(nameEdited
                ? {}
                : { name: t(`measurements.calculations.names.${type.slug as CalculationSlug}`) }),
            ...(unitEdited ? {} : { unit: type.unit }),
        });
        prefillBigThree(formik, type);
    };

    /**
     * A total of several exercises means bench press, squat and deadlift for
     * most people, so that is what a fresh one starts with. The chips stay
     * removable, and an instance that never synced them prefills nothing.
     */
    const prefillBigThree = async (
        formik: { setFieldValue: (field: string, value: unknown) => unknown },
        type: CalculationType,
    ) => {
        const param = type.params.find(candidate => candidate.kind === 'exercises');
        if (param === undefined) {
            return;
        }

        try {
            const exercises = await queryClient.ensureQueryData({
                queryKey: [QueryKey.EXERCISES, 'big-three'],
                queryFn: () => getExercisesByUuids(BIG_THREE_UUIDS),
                staleTime: Infinity,
            });
            const ids = exercises
                .map(exercise => exercise.id)
                .filter((id): id is number => id !== null);

            // The chips read an exercise under this key, and the whole record
            // is already here, so they do not have to fetch it again
            for (const exercise of exercises) {
                queryClient.setQueryData([QueryKey.EXERCISE_DETAIL, exercise.id], exercise);
            }

            // The user may have picked something else while this was loading
            if (ids.length === BIG_THREE_UUIDS.length && pickedRef.current === type.slug) {
                formik.setFieldValue('params', { ...defaultParams(type), [param.key]: ids });
            }
        } catch {
            // Nothing to prefill, the user picks the exercises themselves
        }
    };

    return (
        <Formik
            initialValues={{
                name: category ? category.name : "",
                unit: category ? category.unit : "",
                metricType: category ? category.metricType : 'custom' as MetricType,
                chartType: category ? category.chartType : 'auto' as ChartType,
                trend: seededTrend,
                averageWindow: seededWindow,
                // the empty string stands in for "no group", MUI selects
                // don't accept null values
                parentId: category?.parentId ?? "",
                calculation: storedCalculation,
                params: (category?.dynamicParams ?? {}) as Record<string, unknown>,
            } as CategoryFormValues}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                const parentId = values.parentId === "" ? null : values.parentId;

                /**
                 * Applies the chart settings the user actually changed.
                 *
                 * Only a changed one is written, so renaming a category leaves
                 * its configuration exactly as it was: a value another client
                 * wrote and this one does not know reads as the default here,
                 * and writing that default back would drop it.
                 */
                const withSettings = (target: MeasurementCategory): MeasurementCategory => {
                    let out = target;
                    if (values.trend !== seededTrend) {
                        out = out.withChartSetting('trend', values.trend);
                    }
                    if (values.averageWindow !== seededWindow) {
                        out = out.withChartSetting('average_window', values.averageWindow);
                    }

                    return out;
                };

                // The form closes only once the server took the category, so a
                // rejected write is shown instead of disappearing with it
                const options = { onSuccess: () => closeFn?.() };

                // Edit existing category
                if (category) {
                    const edited = MeasurementCategory.clone(category, {
                        name: values.name,
                        unit: values.unit,
                        metricType: values.metricType,
                        chartType: values.chartType,
                        parentId: parentId,
                    });
                    edited.dynamicType = values.calculation;
                    edited.dynamicParams = values.calculation === CALCULATION_NONE
                        ? {}
                        : values.params;
                    useEditCategoryQuery.mutate(withSettings(edited), options);
                } else {
                    useAddCategoryQuery.mutate(withSettings(new MeasurementCategory(
                        null,
                        values.name,
                        values.unit,
                        values.metricType,
                        false,
                        parentId,
                        0,
                        values.chartType,
                        {},
                        values.calculation,
                        values.calculation === CALCULATION_NONE ? {} : values.params,
                    )), options);
                }
            }}
        >
            {formik => (
                <Form>
                    <Stack spacing={2}>
                        {isCustom && <TextField
                            fullWidth
                            id="name"
                            label={t('name')}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            {...formik.getFieldProps('name')}
                            onChange={event => {
                                setNameEdited(true);
                                formik.handleChange(event);
                            }}
                        />}
                        {isCustom && <TextField
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
                            onChange={event => {
                                setUnitEdited(true);
                                formik.handleChange(event);
                            }}
                        />}
                        {/* What a category computes is set when it is created:
                          * the server refuses a change afterwards, so an
                          * existing one only shows what it already does */}
                        {isCustom && !hasChildren
                            && (category === undefined || category.isCalculated)
                            && <CalculationSection
                                category={category}
                                categories={allCategories}
                                onPick={(type?: CalculationType) => pickCalculation(formik, type)}
                            />}
                        {/* The metric type is picked when the category is
                          * created (see NewCategoryPicker) and fixed from then
                          * on: the key of a typed category is derived from it,
                          * and the server refuses a change
                          */}
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
                        {/* The trend line and the moving average are parts of
                          * the line chart: a category that can never be drawn
                          * as one is not offered them at all, and one that is
                          * currently drawn as something else keeps its
                          * settings but cannot change them
                          */}
                        {canDrawLine(formik.values.metricType, hasChildren) &&
                            /* The two settings of the line share a row: they
                             * belong together and the form is long enough
                             */
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField
                                    select
                                    fullWidth
                                    id="trend"
                                    label={t('measurements.chartTrend')}
                                    disabled={!drawsLine(formik.values)}
                                    {...formik.getFieldProps('trend')}
                                >
                                    {TREND_CHARACTERS.map((trend: TrendCharacter) =>
                                        <MenuItem key={trend} value={trend}>
                                            {t(`measurements.trends.${trend}`)}
                                        </MenuItem>
                                    )}
                                </TextField>
                                <TextField
                                    select
                                    fullWidth
                                    id="averageWindow"
                                    label={t('measurements.chartAverageWindow')}
                                    disabled={!drawsLine(formik.values)}
                                    {...formik.getFieldProps('averageWindow')}
                                >
                                    {AVERAGE_WINDOWS.map(days =>
                                        <MenuItem key={days} value={days}>
                                            {t('measurements.chartAverageWindowDays', { count: days })}
                                        </MenuItem>
                                    )}
                                </TextField>
                            </Stack>}
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
