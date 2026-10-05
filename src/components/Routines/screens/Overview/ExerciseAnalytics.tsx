import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import {
    Alert, Autocomplete, Box, Button, FormControl, IconButton, InputLabel, MenuItem, Select, Stack,
    TextField, Tooltip, Typography,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { getLanguageByShortName, useLanguageQuery } from "@/components/Exercises";
import { ChartRange, ChartRangeSelector } from "@/components/Measurements";
import {
    aggregateAnalytics, analyticsDateFilter, AnalyticsMetric, AnalyticsUnit,
} from "@/components/Routines/models/analytics";
import { WorkoutLog } from "@/components/Routines/models/WorkoutLog";
import { useExerciseAnalyticsQuery } from "@/components/Routines/queries/analytics";
import { ExerciseAnalyticsChart } from "@/components/Routines/widgets/ExerciseAnalyticsChart";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { WgerContainerFullWidth } from "@/core/ui/Widgets/Container";
import { makeLink, WgerLink } from "@/core/lib/url";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type Option = { id: number, name: string };
const EMPTY_LOGS: WorkoutLog[] = [];
const UNITS: AnalyticsUnit[] = ['kg', 'kgReps', 'reps', 'seconds'];

// A selected exercise/muscle remains clearable even when a shorter range has no logs for it.
const withSelection = (options: Option[], selected: Option | null): Option[] =>
    selected && !options.some(option => option.id === selected.id) ? [selected, ...options] : options;

export const ExerciseAnalytics = () => {
    const [t, i18n] = useTranslation();
    const [metric, setMetric] = useState<AnalyticsMetric>('weight');
    const [range, setRange] = useState<ChartRange>('all');
    const [exercise, setExercise] = useState<Option | null>(null);
    const [muscle, setMuscle] = useState<Option | null>(null);
    const [table, setTable] = useState(false);
    const query = useExerciseAnalyticsQuery(analyticsDateFilter(range));
    const languages = useLanguageQuery();
    const logs = query.data ?? EMPTY_LOGS;

    const options = useMemo(() => {
        const language = getLanguageByShortName(i18n.language, languages.data ?? []);
        const exercises = new Map<number, Option>();
        const muscles = new Map<number, Option>();
        for (const log of logs) {
            exercises.set(log.exerciseId, {
                id: log.exerciseId,
                name: log.exerciseObj?.getTranslation(language)?.name
                    ?? t('routines.analytics.unknownExercise', { id: log.exerciseId }),
            });
            for (const item of [...log.exerciseObj?.muscles ?? [], ...log.exerciseObj?.musclesSecondary ?? []]) {
                muscles.set(item.id, { id: item.id, name: item.getName() });
            }
        }
        const byName = (a: Option, b: Option) => a.name.localeCompare(b.name, i18n.language);
        return { exercises: [...exercises.values()].sort(byName), muscles: [...muscles.values()].sort(byName) };
    }, [logs, languages.data, i18n.language, t]);

    const result = useMemo(() => aggregateAnalytics(logs, metric, {
        exerciseId: exercise?.id ?? null, muscleId: muscle?.id ?? null,
    }), [logs, metric, exercise?.id, muscle?.id]);
    const names = new Map(options.exercises.map(option => [option.id, option.name]));
    const series = result.series.map(item => ({
        ...item,
        name: item.exerciseId === null ? muscle?.name ?? ''
            : names.get(item.exerciseId) ?? t('routines.analytics.unknownExercise', { id: item.exerciseId }),
    }));
    const viewLabel = t(table ? 'routines.analytics.chartView' : 'routines.analytics.tableView');

    return <WgerContainerFullWidth
        title={t('routines.analytics.title')}
        maxWidth="lg"
        backToUrl={makeLink(WgerLink.ROUTINE_OVERVIEW, i18n.language)}
        backToTitle={t('routines.routines')}
        optionsMenu={<Tooltip title={viewLabel}>
            <IconButton aria-label={viewLabel} onClick={() => setTable(!table)}>
                {table ? <BarChartIcon /> : <TableChartIcon />}
            </IconButton>
        </Tooltip>}>
        <Stack spacing={3}>
            <Typography color="text.secondary">{t('routines.analytics.description')}</Typography>
            <Box sx={{ overflowX: 'auto' }}>
                <ChartRangeSelector value={range} onChange={setRange} />
            </Box>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 5 }}>
                    <Autocomplete
                        options={withSelection(options.exercises, exercise)}
                        value={exercise}
                        onChange={(_, value) => setExercise(value)}
                        getOptionLabel={option => option.name}
                        getOptionKey={option => option.id}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        loading={query.isFetching}
                        renderInput={params => <TextField {...params}
                            label={t('routines.analytics.exercise')} placeholder={t('all')} />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Autocomplete
                        options={withSelection(options.muscles, muscle)}
                        value={muscle}
                        onChange={(_, value) => setMuscle(value)}
                        getOptionLabel={option => option.name}
                        getOptionKey={option => option.id}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        loading={query.isFetching}
                        renderInput={params => <TextField {...params}
                            label={t('routines.analytics.muscle')} placeholder={t('all')} />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel id="analytics-metric-label">{t('routines.analytics.metric')}</InputLabel>
                        <Select
                            labelId="analytics-metric-label"
                            label={t('routines.analytics.metric')}
                            value={metric}
                            onChange={event => setMetric(event.target.value as AnalyticsMetric)}>
                            <MenuItem value="weight">{t('weight')}</MenuItem>
                            <MenuItem value="volume">{t('routines.volume')}</MenuItem>
                            <MenuItem value="reps">{t('routines.reps')}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Typography variant="body2" color="text.secondary">
                {metric === 'weight' ? t('routines.analytics.weightHelp')
                    : metric === 'volume' ? t('routines.analytics.volumeHelp') : t('routines.analytics.repsHelp')}
                {' '}{t('routines.analytics.muscleHelp')}
            </Typography>
            {query.isPending ? <LoadingPlaceholder /> : query.isError ? <Alert severity="error"
                action={<Button color="inherit" onClick={() => void query.refetch()}>
                    {t('routines.analytics.retry')}
                </Button>}>
                {t('routines.analytics.loadError')}
            </Alert> : <>
                {result.skipped > 0 && <Alert severity="info">
                    {t('routines.analytics.skipped', { count: result.skipped })}
                </Alert>}
                {series.length === 0 ? <Alert severity="info">{t('routines.analytics.empty')}</Alert>
                    : UNITS.map(unit => {
                        const matching = series.filter(item => item.unit === unit);
                        return matching.length > 0 ? <ExerciseAnalyticsChart
                            key={unit} unit={unit} series={matching} table={table} /> : null;
                    })}
            </>}
        </Stack>
    </WgerContainerFullWidth>;
};
