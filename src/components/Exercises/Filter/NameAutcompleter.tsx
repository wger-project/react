import PhotoIcon from "@mui/icons-material/Photo";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import {
    Autocomplete,
    Avatar,
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
import { SearchLanguageFilter } from "components/Core/Widgets/SearchLanguageFilter";
import { Exercise } from "components/Exercises/models/exercise";
import { SERVER_URL } from "config";
import debounce from "lodash/debounce";
import * as React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchExerciseTranslations } from "services";
import { LANGUAGE_SHORT_ENGLISH } from "utils/consts";


export const STORAGE_KEY_EXERCISE_LANGUAGE = "wger.exerciseSearch.languageFilter";
export const STORAGE_KEY_EXERCISE_EXACT_MATCH = "wger.exerciseSearch.exactMatch";

type NameAutocompleterProps = {
    callback: (exercise: Exercise | null) => void;
    loadExercise?: boolean;
};

export function NameAutocompleter({ callback, loadExercise }: NameAutocompleterProps) {
    const [value, setValue] = React.useState<Exercise | null>(null);
    const [t, i18n] = useTranslation();
    const [inputValue, setInputValue] = React.useState("");
    const defaultLanguageFilter: SearchLanguageFilter = i18n.language === LANGUAGE_SHORT_ENGLISH
        ? "current"
        : "current_english";

    const [languageFilter, setLanguageFilter] = useState<SearchLanguageFilter>(() => {
        return localStorage.getItem(STORAGE_KEY_EXERCISE_LANGUAGE) as SearchLanguageFilter ?? defaultLanguageFilter as SearchLanguageFilter;
    });

    const [filtersAnchorEl, setFiltersAnchorEl] = useState<HTMLElement | null>(null);
    const isFiltersOpen = Boolean(filtersAnchorEl);
    const filtersPopoverId = isFiltersOpen ? "exercise-filters-popover" : undefined;

    const [exactMatch, setExactMatch] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEY_EXERCISE_EXACT_MATCH) === "true";
    });

    const languageOptions = useMemo(() => {
        const displayLang = i18n.language?.split('-')[0] ?? 'en';
        const opts: Array<{ value: SearchLanguageFilter; label: string }> = [
            {
                value: "current",
                label: t("nutrition.languageFilterCurrentOnly", { lang: displayLang })
            },
            {
                value: "current_english",
                label: t("nutrition.languageFilterCurrentAndEnglish", { lang: displayLang }),
            },
            {
                value: "all",
                label: t("nutrition.languageFilterAll")
            },
        ];
        return opts;
    }, [i18n.language, t]);
    const [options, setOptions] = React.useState<readonly Exercise[]>([]);


    loadExercise = loadExercise === undefined ? false : loadExercise;

    const fetchName = React.useMemo(
        () =>
            debounce(
                (request: string) =>
                    searchExerciseTranslations(request, i18n.language, languageFilter, exactMatch).then((res) => setOptions(res)),
                400
            ),
        [i18n.language, languageFilter, exactMatch]
    );

    React.useEffect(() => {
        if (inputValue === "") {
            setOptions(value ? [value] : []);
            return undefined;
        }

        fetchName(inputValue);

        return () => {
            fetchName.cancel();
        };
    }, [value, inputValue, fetchName]);

    return (
        <>
            <Autocomplete
                id="exercise-name-autocomplete"
                getOptionLabel={(option) => option.getTranslation().name}
                data-testid="autocomplete"
                filterOptions={(x) => x}
                options={options}
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={value}
                noOptionsText={t("noResults")}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={async (event: React.SyntheticEvent, newValue: Exercise | null) => {
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
                        label={t("exercises.searchExerciseName")}
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
                                        {params.slotProps.input.endAdornment}
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="Toggle filters"
                                                aria-describedby={filtersPopoverId}
                                                aria-expanded={isFiltersOpen}
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={(e) =>
                                                    setFiltersAnchorEl((current) =>
                                                        current ? null : e.currentTarget
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
                renderOption={(props, option, state) => {
                    const translation = option.getTranslation();
                    const mainImage = option.mainImage;

                    return (
                        <li
                            {...props}
                            key={`exercise-${state.index}-${option.id}`}
                            data-testid={`autocompleter-result-${option.id}`}
                        >
                            <ListItem disablePadding component="div">
                                <ListItemIcon>
                                    {mainImage ? (
                                        <Avatar alt="" src={`${SERVER_URL}${mainImage.url}`} variant="rounded" />
                                    ) : (
                                        <PhotoIcon fontSize="large" />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={translation.name}
                                    sx={{
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                    secondary={option.category.name}
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
                <Stack sx={{ padding: 1, minWidth: 200 }} spacing={1}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="exercise-language-filter-label">
                            {t("language")}
                        </InputLabel>
                        <Select
                            labelId="exercise-language-filter-label"
                            value={languageFilter}
                            label={t("language")}
                            onChange={(e) => {
                                setLanguageFilter(e.target.value as SearchLanguageFilter);
                                localStorage.setItem(STORAGE_KEY_EXERCISE_LANGUAGE, e.target.value);
                            }}
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
                                    checked={exactMatch}
                                    onChange={(e, checked) => {
                                        setExactMatch(checked);
                                        localStorage.setItem(STORAGE_KEY_EXERCISE_EXACT_MATCH, String(checked));
                                    }}
                                />
                            }
                            label={t("exercises.exactMatch")}
                        />
                    </FormGroup>
                </Stack>
            </Popover>
        </>
    );
}
