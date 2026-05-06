import PhotoIcon from "@mui/icons-material/Photo";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from '@mui/icons-material/Tune';
import {
    Autocomplete,
    Avatar,
    Box,
    Chip,
    FormControl,
    FormControlLabel,
    FormGroup,
    IconButton,
    InputAdornment,
    InputLabel,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Popover,
    Select,
    Slider,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { Ingredient } from "@/components/Nutrition/models/Ingredient";
import { NutriScoreBadge } from "@/components/Nutrition/widgets/NutriScoreBadge";
import debounce from "lodash/debounce";
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from "react-i18next";
import { searchIngredient } from "@/services";
import { NUTRI_SCORES, NutriScoreValue } from "@/types";
import { SearchLanguageFilter } from "@/components/Core/Widgets/SearchLanguageFilter";
import { LANGUAGE_SHORT_ENGLISH } from "@/utils/consts";

type IngredientAutocompleterProps = {
    callback: (ingredient: Ingredient | null) => void;
    initialIngredient?: Ingredient | null;
};

export const STORAGE_KEY_LANGUAGE_FILTER = "wger.ingredientSearch.languageFilter";
export const STORAGE_KEY_VEGAN = "wger.ingredientSearch.filterVegan";
export const STORAGE_KEY_VEGETARIAN = "wger.ingredientSearch.filterVegetarian";
export const STORAGE_KEY_NUTRISCORE_MAX = "wger.ingredientSearch.filterNutriscoreMax";
export const SEARCH_DEBOUNCE_MS = 400;

const NUTRISCORE_OFF_INDEX = 0;

const isNutriScoreValue = (value: string | null): value is NutriScoreValue =>
    value !== null && (NUTRI_SCORES as readonly string[]).includes(value);

const sliderIndexToNutriscore = (index: number): NutriScoreValue | null =>
    index === NUTRISCORE_OFF_INDEX ? null : NUTRI_SCORES[index - 1];

const nutriscoreToSliderIndex = (value: NutriScoreValue | null): number =>
    value === null ? NUTRISCORE_OFF_INDEX : NUTRI_SCORES.indexOf(value) + 1;

export function IngredientAutocompleter({ callback, initialIngredient }: IngredientAutocompleterProps) {
    const initialData = initialIngredient ?? null;
    const [t, i18n] = useTranslation();

    const defaultLanguageFilter: SearchLanguageFilter =
        i18n.language === LANGUAGE_SHORT_ENGLISH ? "current" : "current_english";

    const [languageFilter, setLanguageFilter] = useState<SearchLanguageFilter>(() => {
        const stored = localStorage.getItem(STORAGE_KEY_LANGUAGE_FILTER);
        return (stored as SearchLanguageFilter | null) ?? defaultLanguageFilter;
    });
    const [filterVegan, setFilterVegan] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEY_VEGAN) === "true";
    });
    const [filterVegetarian, setFilterVegetarian] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEY_VEGETARIAN) === "true";
    });
    const [nutriscoreMax, setNutriscoreMax] = useState<NutriScoreValue | null>(() => {
        const stored = localStorage.getItem(STORAGE_KEY_NUTRISCORE_MAX);
        return isNutriScoreValue(stored) ? stored : null;
    });
    const [filtersAnchorEl, setFiltersAnchorEl] = useState<HTMLElement | null>(null);
    const [value, setValue] = useState<Ingredient | null>(initialData);
    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState<readonly Ingredient[]>([]);

    useEffect(() => {
        if (i18n.language === LANGUAGE_SHORT_ENGLISH && languageFilter === "current_english") {
            setLanguageFilter("current");
        }
    }, [i18n.language, languageFilter]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_LANGUAGE_FILTER, languageFilter);
    }, [languageFilter]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_VEGAN, String(filterVegan));
    }, [filterVegan]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_VEGETARIAN, String(filterVegetarian));
    }, [filterVegetarian]);

    useEffect(() => {
        if (nutriscoreMax === null) {
            localStorage.removeItem(STORAGE_KEY_NUTRISCORE_MAX);
        } else {
            localStorage.setItem(STORAGE_KEY_NUTRISCORE_MAX, nutriscoreMax);
        }
    }, [nutriscoreMax]);

    const languageOptions = useMemo(() => {
        const options: Array<{ value: SearchLanguageFilter; label: string }> = [
            {
                value: "current",
                label: t("nutrition.languageFilterCurrentOnly", { lang: i18n.language }),
            },
        ];

        if (i18n.language !== LANGUAGE_SHORT_ENGLISH) {
            options.push({
                value: "current_english",
                label: t("nutrition.languageFilterCurrentAndEnglish", { lang: i18n.language }),
            });
        }

        options.push({
            value: "all",
            label: t("nutrition.languageFilterAll"),
        });

        return options;
    }, [i18n.language, t]);

    const fetchName = useMemo(
        () =>
            debounce(
                (request: string) =>
                    searchIngredient(request, {
                        languageCode: i18n.language,
                        languageFilter,
                        isVegan: filterVegan || undefined,
                        isVegetarian: filterVegetarian || undefined,
                        nutriscoreMax: nutriscoreMax ?? undefined,
                    }).then((res) => setOptions(res)),
                SEARCH_DEBOUNCE_MS
            ),
        [i18n.language, languageFilter, filterVegan, filterVegetarian, nutriscoreMax]
    );

    useEffect(() => {
        if (inputValue === "") {
            setOptions(value ? [value] : []);
            return undefined;
        }

        fetchName(inputValue);

        return () => {
            fetchName.cancel();
        };
    }, [value, inputValue, fetchName]);

    const isFiltersOpen = Boolean(filtersAnchorEl);
    const filtersPopoverId = isFiltersOpen ? "ingredient-filters-popover" : undefined;

    return (
        <Stack>
            <Autocomplete
                id="ingredient-autocomplete"
                getOptionLabel={(option) => option.name}
                data-testid="autocomplete"
                filterOptions={(x) => x}
                options={options}
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={value}
                noOptionsText={t("noResults")}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event: unknown, newValue: Ingredient | null) => {
                    setOptions(newValue ? [newValue, ...options] : options);
                    setValue(newValue);
                    callback(newValue);
                }}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={t("nutrition.searchIngredientName")}
                        fullWidth
                        slotProps={{
                            ...params.slotProps,
                            input: {
                                ...params.slotProps?.input,
                                startAdornment: (
                                    <>
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                        {params.slotProps?.input?.startAdornment}
                                    </>
                                ),
                                endAdornment: (
                                    <>
                                        {params.slotProps?.input?.endAdornment}
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="Toggle filters"
                                                aria-describedby={filtersPopoverId}
                                                aria-expanded={isFiltersOpen}
                                                onMouseDown={(event) => event.preventDefault()}
                                                onClick={(event) =>
                                                    setFiltersAnchorEl((current) =>
                                                        current ? null : (event.currentTarget as HTMLElement)
                                                    )
                                                }
                                                edge="end"
                                                size="small"
                                            >
                                                <TuneIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    </>
                                ),
                            },
                        }}
                    />
                )}
                renderOption={(props, ingredient) => {
                    return (
                        <li {...props} key={`ingredient-${ingredient.id}`}>
                            <ListItem disablePadding component="div">
                                <ListItemIcon>
                                    <Avatar alt="" src={ingredient.thumbnails?.medium ?? ''}
                                            variant="rounded">
                                        <PhotoIcon />
                                    </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                    primary={ingredient.name}
                                    slotProps={{
                                        primary: {
                                            sx: {
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            },
                                        },
                                    }}
                                />
                                {ingredient.isVegan === true && (
                                    <Chip
                                        label={t("nutrition.filterVegan")}
                                        color="success"
                                        size="small"
                                    />
                                )}
                                {ingredient.isVegetarian === true && !ingredient.isVegan && (
                                    <Chip
                                        label={t("nutrition.filterVegetarian")}
                                        color="success"
                                        size="small"
                                        sx={{ ml: 1 }}
                                    />
                                )}
                                {ingredient.nutriscore !== null && (
                                    <Box sx={{ ml: 1 }}>
                                        <NutriScoreBadge score={ingredient.nutriscore} size="small" />
                                    </Box>
                                )}
                            </ListItem>
                        </li>
                    );
                }}
            />
            <Popover
                id={filtersPopoverId}
                open={isFiltersOpen}
                anchorEl={filtersAnchorEl}
                onClose={() => setFiltersAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Stack sx={{ padding: 2 }} spacing={1}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="ingredient-language-filter-label">
                            {t("language")}
                        </InputLabel>
                        <Select
                            labelId="ingredient-language-filter-label"
                            value={languageFilter}
                            label={t("language")}
                            onChange={(event) => setLanguageFilter(event.target.value as SearchLanguageFilter)}
                        >
                            {languageOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormGroup row>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={filterVegan}
                                    onChange={(event, checked) => setFilterVegan(checked)}
                                />
                            }
                            label={t("nutrition.filterVegan")}
                        />
                    </FormGroup>

                    <FormGroup row>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={filterVegetarian}
                                    onChange={(event, checked) => setFilterVegetarian(checked)}
                                />
                            }
                            label={t("nutrition.filterVegetarian")}
                        />
                    </FormGroup>

                    <Box sx={{ px: 2, pt: 1, minWidth: 240 }}>
                        <Typography id="ingredient-nutriscore-slider-label" variant="body2">
                            {t("nutrition.filterNutriscore")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                            {nutriscoreMax === null
                                ? t("nutrition.filterNutriscoreNoFilter")
                                : t("nutrition.filterNutriscoreOrBetter", { grade: nutriscoreMax.toUpperCase() })}
                        </Typography>
                        <Slider
                            aria-labelledby="ingredient-nutriscore-slider-label"
                            value={nutriscoreToSliderIndex(nutriscoreMax)}
                            onChange={(event, value) =>
                                setNutriscoreMax(sliderIndexToNutriscore(value as number))
                            }
                            getAriaValueText={(value) =>
                                value === NUTRISCORE_OFF_INDEX
                                    ? t("nutrition.filterNutriscoreNoFilter")
                                    : t("nutrition.filterNutriscoreOrBetter", { grade: NUTRI_SCORES[value - 1].toUpperCase() })
                            }
                            step={1}
                            min={0}
                            max={NUTRI_SCORES.length}
                            marks={[
                                { value: NUTRISCORE_OFF_INDEX, label: t("nutrition.filterNutriscoreOff") },
                                ...NUTRI_SCORES.map((score, index) => ({
                                    value: index + 1,
                                    label: score.toUpperCase(),
                                })),
                            ]}
                        />
                    </Box>
                </Stack>
            </Popover>
        </Stack>
    );
}
