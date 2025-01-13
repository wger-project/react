import PhotoIcon from '@mui/icons-material/Photo';
import SearchIcon from '@mui/icons-material/Search';
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
    TextField
} from "@mui/material";
import { SERVER_URL } from "config";
import throttle from 'lodash/throttle';
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getExercise, searchExerciseTranslations } from "services";
import { ExerciseSearchResponse } from "services/responseType";
import { LANGUAGE_SHORT_ENGLISH } from "utils/consts";

type NameAutocompleterProps = {
    callback: (exerciseResponse: ExerciseSearchResponse | null) => void;
    loadExercise?: boolean
}

export function NameAutocompleter({ callback, loadExercise }: NameAutocompleterProps) {
    const [value, setValue] = React.useState<ExerciseSearchResponse | null>(null);
    const [inputValue, setInputValue] = React.useState('');
    const [searchEnglish, setSearchEnglish] = useState<boolean>(true);
    const [options, setOptions] = React.useState<readonly ExerciseSearchResponse[]>([]);
    const [t, i18n] = useTranslation();

    loadExercise = loadExercise === undefined ? false : loadExercise;


    const fetchName = React.useMemo(
        () =>
            throttle(
                (request: string) => searchExerciseTranslations(request, i18n.language, searchEnglish).then(res => setOptions(res)),
                200,
            ),
        [i18n.language, searchEnglish],
    );


    React.useEffect(() => {

        if (inputValue === '') {
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
                getOptionLabel={(option) =>
                    option.value
                }
                data-testid="autocomplete"
                filterOptions={(x) => x}
                options={options}
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={value}
                noOptionsText={t('noResults')}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                onChange={async (event: any, newValue: ExerciseSearchResponse | null) => {
                    setOptions(newValue ? [newValue, ...options] : options);
                    setValue(newValue);
                    if (loadExercise && newValue !== null) {
                        newValue.exercise = await getExercise(newValue.data.base_id);
                    }
                    callback(newValue);
                }}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={t('exercises.searchExerciseName')}
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
                                )
                            }
                        }}
                    />
                )}
                renderOption={(props, option, state) =>
                    <li {...props}
                        key={`exercise-${state.index}-${option.data.id}`}
                        data-testid={`autocompleter-result-${option.data.base_id}`}
                    >
                        <ListItem disablePadding component="div">
                            <ListItemIcon>
                                {option.data.image ?
                                    <Avatar alt="" src={`${SERVER_URL}${option.data.image}`} variant="rounded" />
                                    : <PhotoIcon fontSize="large" />}
                            </ListItemIcon>
                            <ListItemText
                                primary={option.value}
                                primaryTypographyProps={{
                                    style: {
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }
                                }}
                                secondary={option.data.category}
                            />
                        </ListItem>
                    </li>
                }
            />
            {i18n.language !== LANGUAGE_SHORT_ENGLISH && <FormGroup>
                <FormControlLabel
                    control={<Switch checked={searchEnglish}
                                     onChange={(event, checked) => setSearchEnglish(checked)} />}
                    label={t('alsoSearchEnglish')} />
            </FormGroup>}
        </>
    );
}