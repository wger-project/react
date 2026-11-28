import { NutritionalValues } from "@/components/Nutrition/helpers/nutritionalValues";
import { Ingredient } from "@/components/Nutrition/models/Ingredient";
import { NutritionWeightUnit } from "@/components/Nutrition/models/weightUnit";
import { IngredientAutocompleter } from "@/components/Nutrition/widgets/IngredientAutocompleter";
import { generateChartColors } from "@/core/lib/colors";
import { numberGramLocale, numberLocale } from "@/core/lib/numbers";
import { makeLink, WgerLink } from "@/core/lib/url";
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PhotoIcon from "@mui/icons-material/Photo";
import { Avatar, Box, Chip, IconButton, InputAdornment, Stack, Typography } from "@mui/material";
import React from 'react';
import { useTranslation } from "react-i18next";

type IngredientAmountFieldsProps = {
    ingredient: Ingredient | null,
    onIngredientChange: (ingredient: Ingredient | null) => void,
    weightUnit: NutritionWeightUnit | null,
    onWeightUnitChange: (unit: NutritionWeightUnit | null) => void,
    amount: number,
    ingredientError?: string,

    /** Renders the form's bound amount field with the given end adornment */
    renderAmountField: (endAdornment: React.ReactNode) => React.ReactNode,
}

/**
 * The ingredient, amount and weight unit part of the forms that log or plan an
 * ingredient, with a preview of the resulting energy and macronutrients.
 *
 * Changing the ingredient resets the weight unit, since units belong to one ingredient.
 */
export const IngredientAmountFields = (props: IngredientAmountFieldsProps) => {
    const [t] = useTranslation();
    const { ingredient, weightUnit, onWeightUnitChange } = props;
    const weightUnits = ingredient?.weightUnits ?? [];

    const changeIngredient = (value: Ingredient | null) => {
        props.onIngredientChange(value);
        onWeightUnitChange(null);
    };

    const endAdornment = <InputAdornment position="end">
        {weightUnit === null ? t('nutrition.gramShort') : `× ${weightUnit.name}`}
    </InputAdornment>;

    return <>
        {ingredient === null
            ? <>
                <IngredientAutocompleter callback={changeIngredient} />
                {props.ingredientError !== undefined && (
                    <div style={{ color: 'crimson', fontSize: '0.7rem', marginLeft: '12px' }}>
                        {props.ingredientError}
                    </div>
                )}
            </>
            : <SelectedIngredient ingredient={ingredient} onClear={() => changeIngredient(null)} />
        }

        {props.renderAmountField(endAdornment)}

        {weightUnits.length > 0 && (
            <Stack direction="row" useFlexGap sx={{ gap: 1, overflowX: 'auto', pb: 0.5 }}>
                <Chip
                    label={t('nutrition.gramShort')}
                    aria-pressed={weightUnit === null}
                    color={weightUnit === null ? 'primary' : 'default'}
                    variant={weightUnit === null ? 'filled' : 'outlined'}
                    onClick={() => onWeightUnitChange(null)}
                />
                {weightUnits.map(unit => {
                    const selected = weightUnit?.id === unit.id;
                    return <Chip
                        key={unit.id}
                        label={`${unit.name} (${unit.grams}g)`}
                        aria-pressed={selected}
                        color={selected ? 'primary' : 'default'}
                        variant={selected ? 'filled' : 'outlined'}
                        onClick={() => onWeightUnitChange(unit)}
                    />;
                })}
            </Stack>
        )}

        {ingredient !== null && props.amount > 0 && (
            <MacrosSummary
                values={NutritionalValues.fromIngredient(ingredient, props.amount, weightUnit)}
                grams={weightUnit === null ? null : props.amount * weightUnit.grams}
            />
        )}
    </>;
};

const SelectedIngredient = (props: { ingredient: Ingredient, onClear: () => void }) => {
    const [t, i18n] = useTranslation();
    const { ingredient } = props;

    return <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }} data-testid="selected-ingredient">
        <Avatar alt="" src={ingredient.thumbnails?.medium ?? undefined} sx={{ width: 64, height: 64 }}>
            <PhotoIcon />
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6">{ingredient.name}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('nutrition.valueEnergyKcal', { value: numberLocale(ingredient.energy, i18n.language) })}
                {' / 100 '}
                {t('nutrition.gramShort')}
            </Typography>
        </Box>
        <IconButton
            aria-label={t('seeDetails')}
            href={makeLink(WgerLink.INGREDIENT_DETAIL, i18n.language, { id: ingredient.id })}
            target="_blank"
            rel="noopener"
        >
            <InfoOutlinedIcon />
        </IconButton>
        <IconButton aria-label={t('nutrition.changeIngredient')} onClick={props.onClear}>
            <CloseIcon />
        </IconButton>
    </Stack>;
};

/** Energy of an entry and how it splits into the macronutrients */
const MacrosSummary = (props: { values: NutritionalValues, grams: number | null }) => {
    const [t, i18n] = useTranslation();
    const { values } = props;

    // Same color mapping as MacrosPieChart
    const [carbsColor, proteinColor, fatColor] = [...generateChartColors(3)];
    const macros = [
        { key: 'protein', label: t('nutrition.protein'), amount: values.protein, color: proteinColor },
        { key: 'carbohydrates', label: t('nutrition.carbohydrates'), amount: values.carbohydrates, color: carbsColor },
        { key: 'fat', label: t('nutrition.fat'), amount: values.fat, color: fatColor },
    ] as const;
    const percent = values.percent;

    return <Stack spacing={1} data-testid="macros-summary">
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline' }}>
            <Typography variant="h5" component="span">{numberLocale(values.energy, i18n.language)}</Typography>
            <Typography variant="body2" component="span">{t('nutrition.kcal')}</Typography>
            {props.grams !== null && (
                <Typography variant="body2" component="span">
                    · {numberGramLocale(props.grams, i18n.language)}
                </Typography>
            )}
        </Stack>
        <Stack direction="row" useFlexGap aria-hidden
               sx={{ gap: '2px', height: 8, borderRadius: 1, overflow: 'hidden' }}>
            {macros.filter(m => percent[m.key] > 0).map(m =>
                <Box key={m.key} sx={{ flex: `${percent[m.key]} 1 0`, bgcolor: m.color }} />
            )}
        </Stack>
        <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', columnGap: 2, rowGap: 0.5 }}>
            {macros.map(m =>
                <Stack key={m.key} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: m.color }} />
                    <Typography variant="body2">{m.label} {numberGramLocale(m.amount, i18n.language)}</Typography>
                </Stack>
            )}
        </Stack>
    </Stack>;
};
