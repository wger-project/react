import PhotoIcon from "@mui/icons-material/Photo";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from '@mui/icons-material/Tune';
import {
    Autocomplete,
    Avatar,
    FormControlLabel,
    FormGroup,
    IconButton,
    InputAdornment,
    ListItem,
    ListItemIcon,
    ListItemText,
    Popover,
    Stack,
    Switch,
    TextField,
} from "@mui/material";
import { Ingredient } from "components/Nutrition/models/Ingredient";
import debounce from "lodash/debounce";
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from "react-i18next";
import { searchIngredient } from "services";
import { LANGUAGE_SHORT_ENGLISH } from "utils/consts";

type IngredientAutocompleterProps = {
    callback: (ingredient: Ingredient | null) => void;
    initialIngredient?: Ingredient | null;
};

export function IngredientAutocompleter({ callback, initialIngredient }: IngredientAutocompleterProps) {
    const initialData = initialIngredient ?? null;

    const [searchEnglish, setSearchEnglish] = useState<boolean>(true);
    const [filterVegan, setFilterVegan] = useState<boolean>(false);
    const [filterVegetarian, setFilterVegetarian] = useState<boolean>(false);
    const [filtersAnchorEl, setFiltersAnchorEl] = useState<HTMLElement | null>(null);
    const [value, setValue] = useState<Ingredient | null>(initialData);
    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState<readonly Ingredient[]>([]);
    const [t, i18n] = useTranslation();

    const fetchName = useMemo(
        () =>
            debounce(
                (request: string) =>
                    searchIngredient(
                        request,
                        i18n.language,
                        searchEnglish,
                        filterVegan || undefined,
                        filterVegetarian || undefined,
                    ).then((res) => setOptions(res)),
                200
            ),
        [i18n.language, searchEnglish, filterVegan, filterVegetarian]
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
                            input: {
                                ...params.InputProps,
                                startAdornment: (
                                    <>
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                        {params.InputProps.startAdornment}
                                    </>
                                ),
                                endAdornment: (
                                    <>
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
                    {i18n.language !== LANGUAGE_SHORT_ENGLISH && (
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={searchEnglish}
                                        onChange={(event, checked) => setSearchEnglish(checked)}
                                    />
                                }
                                label={t("alsoSearchEnglish")}
                            />
                        </FormGroup>
                    )}

                    <FormGroup row>
                        <FormControlLabel
                            control={
                                <Switch checked={filterVegan} onChange={(event, checked) => setFilterVegan(checked)} />
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
