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
    Stack,
    Switch,
    TextField,
} from "@mui/material";
import { Ingredient } from "components/Nutrition/models/Ingredient";
import { NutriScoreBadge } from "components/Nutrition/widgets/NutriScoreBadge";
import debounce from "lodash/debounce";
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from "react-i18next";
import { IngredientLanguageFilter, searchIngredient } from "services";
import { LANGUAGE_SHORT_ENGLISH } from "utils/consts";

type IngredientAutocompleterProps = {
    callback: (ingredient: Ingredient | null) => void;
    initialIngredient?: Ingredient | null;
};

export const STORAGE_KEY_LANGUAGE_FILTER = "wger.ingredientSearch.languageFilter";
export const STORAGE_KEY_VEGAN = "wger.ingredientSearch.filterVegan";
export const STORAGE_KEY_VEGETARIAN = "wger.ingredientSearch.filterVegetarian";

export function IngredientAutocompleter({ callback, initialIngredient }: IngredientAutocompleterProps) {
    const initialData = initialIngredient ?? null;
    const [t, i18n] = useTranslation();

    const defaultLanguageFilter: IngredientLanguageFilter =
        i18n.language === LANGUAGE_SHORT_ENGLISH ? "current" : "current_english";

    const [languageFilter, setLanguageFilter] = useState<IngredientLanguageFilter>(() => {
        const stored = localStorage.getItem(STORAGE_KEY_LANGUAGE_FILTER);
        return (stored as IngredientLanguageFilter | null) ?? defaultLanguageFilter;
    });
    const [filterVegan, setFilterVegan] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEY_VEGAN) === "true";
    });
    const [filterVegetarian, setFilterVegetarian] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEY_VEGETARIAN) === "true";
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

    const languageOptions = useMemo(() => {
        const options: Array<{ value: IngredientLanguageFilter; label: string }> = [
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
                    searchIngredient(
                        request,
                        i18n.language,
                        languageFilter,
                        filterVegan || undefined,
                        filterVegetarian || undefined,
                    ).then((res) => setOptions(res)),
                200
            ),
        [i18n.language, languageFilter, filterVegan, filterVegetarian]
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
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
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
                <Stack padding={2} spacing={1}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="ingredient-language-filter-label">
                            {t("language")}
                        </InputLabel>
                        <Select
                            labelId="ingredient-language-filter-label"
                            value={languageFilter}
                            label={t("language")}
                            onChange={(event) => setLanguageFilter(event.target.value as IngredientLanguageFilter)}
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
                </Stack>
            </Popover>
        </Stack>
    );
}
