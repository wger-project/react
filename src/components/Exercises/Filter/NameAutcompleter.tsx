import PhotoIcon from "@mui/icons-material/Photo";
import SearchIcon from "@mui/icons-material/Search";
import {
    Autocomplete,
    Avatar,
    FormControlLabel,
    FormGroup,
    InputAdornment,
    ListItem,
    ListItemIcon,
    ListItemText,
    Switch,
    TextField,
} from "@mui/material";
import { Exercise } from "components/Exercises/models/exercise";
import { SERVER_URL } from "config";
import debounce from "lodash/debounce";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { searchExerciseTranslations } from "services";
import { LANGUAGE_SHORT_ENGLISH } from "utils/consts";

type NameAutocompleterProps = {
    callback: (exercise: Exercise | null) => void;
    loadExercise?: boolean;
};

export function NameAutocompleter({ callback, loadExercise }: NameAutocompleterProps) {
    const [value, setValue] = React.useState<Exercise | null>(null);
    const [inputValue, setInputValue] = React.useState("");
    const [searchEnglish, setSearchEnglish] = useState<boolean>(true);
    const [options, setOptions] = React.useState<readonly Exercise[]>([]);
    const [t, i18n] = useTranslation();

    loadExercise = loadExercise === undefined ? false : loadExercise;

    const fetchName = React.useMemo(
        () =>
            debounce(
                (request: string) =>
                    searchExerciseTranslations(request, i18n.language, searchEnglish).then((res) => setOptions(res)),
                200
            ),
        [i18n.language, searchEnglish]
    );

    React.useEffect(() => {
        if (inputValue === "") {
            setOptions(value ? [value] : []);
            return undefined;
        }

        fetchName(inputValue);

        return () => {
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
                onChange={async (event: any, newValue: Exercise | null) => {
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
                                    slotProps={{
                                        primary: {
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        },
                                    }}
                                    secondary={option.category.name}
                                />
                            </ListItem>
                        </li>
                    );
                }}
            />
            {i18n.language !== LANGUAGE_SHORT_ENGLISH && (
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Switch checked={searchEnglish} onChange={(event, checked) => setSearchEnglish(checked)} />
                        }
                        label={t("alsoSearchEnglish")}
                    />
                </FormGroup>
            )}
        </>
    );
}
