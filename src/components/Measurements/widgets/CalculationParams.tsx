import {
    Exercise,
    getExercise,
    getLanguageByShortName,
    NameAutocompleter,
    useLanguageQuery
} from "@/components/Exercises";
import { CalculationParam, CalculationType, unitMatches } from "@/components/Measurements/models/Calculation";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { QueryKey } from "@/core/lib/consts";
import { Alert, Box, Chip, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useTranslation } from "react-i18next";

type Params = Record<string, unknown>;

interface CalculationParamsProps {
    type: CalculationType;
    params: Params;
    onChange: (params: Params) => void;
    /** The user's categories, for the pickers that read one */
    categories: MeasurementCategory[];
    /** The category being edited, which cannot be its own source */
    categoryId?: string | null;
}

/** The ids a parameter holds, as a list, whether it takes one or several */
const idsOf = (param: CalculationParam, params: Params): number[] => {
    const value = params[param.key];
    if (Array.isArray(value)) {
        return value as number[];
    }
    return typeof value === 'number' ? [value] : [];
};

/**
 * The parameter block of a calculation, between the type select and the rest
 * of the form. Which fields appear follows from the type.
 */
export const CalculationParams = ({
                                      type,
                                      params,
                                      onChange,
                                      categories,
                                      categoryId,
                                  }: CalculationParamsProps) => {

    const [t, i18n] = useTranslation();
    const languageQuery = useLanguageQuery();
    const language = languageQuery.isSuccess
        ? getLanguageByShortName(i18n.language, languageQuery.data)
        : undefined;

    // Every exercise the parameters point at, so an existing configuration
    // shows names rather than the ids it is stored as
    const exerciseIds = type.params.flatMap(param =>
        param.kind === 'exercise' || param.kind === 'exercises' ? idsOf(param, params) : []
    );
    // The same key the rest of the app reads an exercise under, so a detail
    // page that already loaded one answers for the chip as well
    const exerciseQueries = useQueries({
        queries: exerciseIds.map(id => ({
            queryKey: [QueryKey.EXERCISE_DETAIL, id],
            queryFn: () => getExercise(id),
            // An exercise record does not change while a form is open, and
            // without this a seeded one would be refetched right away
            staleTime: Infinity,
        })),
    });
    const queryClient = useQueryClient();
    const exerciseName = (id: number): string => {
        const exercise = exerciseQueries
            .map(query => query.data)
            .find(data => data?.id === id);
        return exercise ? exercise.getTranslation(language).name : `#${id}`;
    };

    const set = (key: string, value: unknown) => onChange({ ...params, [key]: value });

    const renderCategoryPicker = (param: CalculationParam & { kind: 'category' }) => {
        // A calculated category cannot feed another one, and nothing can feed
        // itself; the server refuses both
        const candidates = categories.filter(candidate =>
            candidate.id !== categoryId && !candidate.isCalculated
        );

        if (candidates.length === 0) {
            return <Alert severity="info" key={param.key}>
                {t('measurements.calculations.noSourceCategory')}
            </Alert>;
        }

        // A category whose unit this calculation cannot read is shown rather
        // than hidden: the unit next to it is what the user has to change, and
        // a silently short list explains nothing
        return <TextField
            select
            fullWidth
            key={param.key}
            id={param.key}
            label={t(`measurements.calculations.params.${param.key}`)}
            value={params[param.key] ?? ''}
            onChange={event => set(param.key, event.target.value)}
        >
            {candidates.map(candidate =>
                <MenuItem
                    key={candidate.id}
                    value={candidate.id!}
                    disabled={!unitMatches(param, candidate.unit)}
                >
                    {candidate.name} ({candidate.unit})
                </MenuItem>
            )}
        </TextField>;
    };

    const renderExercisePicker = (param: CalculationParam & { kind: 'exercise' | 'exercises' }) => {
        const selected = idsOf(param, params);
        const isMulti = param.kind === 'exercises';
        const full = isMulti && selected.length >= param.maxItems;

        const add = (exercise: Exercise | null) => {
            if (exercise === null || exercise.id === null) {
                return;
            }
            // The autocompleter hands over the full record, so the chip does
            // not have to fetch what is already here
            queryClient.setQueryData([QueryKey.EXERCISE_DETAIL, exercise.id], exercise);
            if (!isMulti) {
                set(param.key, exercise.id);
                return;
            }
            if (selected.includes(exercise.id) || full) {
                return;
            }
            set(param.key, [...selected, exercise.id]);
        };

        const remove = (id: number) => set(
            param.key,
            isMulti ? selected.filter(current => current !== id) : null,
        );

        return <Box key={param.key}>
            {selected.length > 0 && <Stack direction="row" spacing={1} sx={{ my: 1, flexWrap: 'wrap' }}>
                {selected.map(id =>
                    <Chip key={id} label={exerciseName(id)} onDelete={() => remove(id)} />
                )}
            </Stack>}
            {!full && <NameAutocompleter callback={add} />}
            {isMulti && <Typography variant="caption" color="text.secondary">
                {t('measurements.calculations.paramsHelp.exercise_ids', {
                    min: param.minItems,
                    max: param.maxItems,
                    count: selected.length,
                })}
            </Typography>}
        </Box>;
    };

    /** A bounded number. Kept as typed: an emptied field means the default */
    const renderNumber = (param: CalculationParam & { kind: 'int' }) => <TextField
        fullWidth
        key={param.key}
        id={param.key}
        type="number"
        label={t(`measurements.calculations.params.${param.key}`)}
        helperText={t(`measurements.calculations.paramsHelp.${param.key}`, {
            min: param.min,
            max: param.max,
        })}
        placeholder={String(param.fallback)}
        slotProps={{ htmlInput: { min: param.min, max: param.max, step: 1 } }}
        value={params[param.key] ?? ''}
        onChange={event => {
            const raw = event.target.value;
            if (raw === '') {
                const rest = { ...params };
                delete rest[param.key];
                onChange(rest);
                return;
            }
            // Number() also swallows '5.5', which the server refuses as an
            // integer, so what is not whole is kept as typed and rejected
            const parsed = Number(raw);
            set(param.key, Number.isInteger(parsed) ? parsed : raw);
        }}
    />;

    return <Stack spacing={2}>
        {type.params.map(param => {
            switch (param.kind) {
                case 'category':
                    return renderCategoryPicker(param);
                case 'exercise':
                case 'exercises':
                    return renderExercisePicker(param);
                case 'int':
                    return renderNumber(param);
            }
        })}
    </Stack>;
};
