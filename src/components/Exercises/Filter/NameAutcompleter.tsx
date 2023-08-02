import PhotoIcon from '@mui/icons-material/Photo';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, Avatar, InputAdornment, ListItem, ListItemIcon, ListItemText, TextField } from "@mui/material";
import throttle from 'lodash/throttle';
import * as React from 'react';
import { useTranslation } from "react-i18next";
import { searchExerciseTranslations } from "services";
import { ExerciseSearchResponse } from "services/responseType";
import { SERVER_URL } from "utils/url";

type NameAutocompleterProps = {
    callback: Function;
}

export function NameAutocompleter({ callback }: NameAutocompleterProps) {
    const [value, setValue] = React.useState<ExerciseSearchResponse | null>(null);
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState<readonly ExerciseSearchResponse[]>([]);
    const [t] = useTranslation();

    const fetchName = React.useMemo(
        () =>
            throttle(
                (request: string) => searchExerciseTranslations(request).then(res => setOptions(res)),
                200,
            ),
        [],
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
            onChange={(event: any, newValue: ExerciseSearchResponse | null) => {
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
                    label={t('exercises.searchExerciseName')}
                    fullWidth
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <>
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                            </>
                        )
                    }}
                />
            )}
            renderOption={(props, option) => {
                return (
                    <li {...props} key={`exercise${option.data.id}`}>
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
                );
            }}
        />
    );
}