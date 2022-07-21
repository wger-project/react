import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import throttle from 'lodash/throttle';
import { ExerciseSearchResponse, searchExerciseTranslations } from "services";
import { Box, Divider, Grid, InputAdornment, Typography } from "@mui/material";
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import { useTranslation } from "react-i18next";
import { truncateLongNames } from "utils/strings";
import SearchIcon from '@mui/icons-material/Search';

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
                (
                    request: string,
                ) => {
                    searchExerciseTranslations(request).then(res => {
                        setOptions(res);
                    });
                },
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
            filterOptions={(x) => x}
            options={options}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={value}
            noOptionsText={t('no-results')}
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
                    label={t('exercises.search-exercise-name')}
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
                    <li {...props}>
                        <Grid container>
                            <Grid item>
                                {option.data.image ?
                                    <Box
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            backgroundImage: `url(${option.data.image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    />
                                    :
                                    <Box
                                        component={InsertPhotoIcon}
                                        sx={{ color: 'text.secondary', mr: 2 }}
                                    />
                                }
                            </Grid>
                            <Grid item xs>
                                {truncateLongNames(option.value)}
                                <Typography variant="body2" color="text.secondary">
                                    {(option.data.category)}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Divider />
                    </li>
                );
            }}
        />
    );
}