import PhotoIcon from '@mui/icons-material/Photo';
import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, Avatar, InputAdornment, ListItem, ListItemIcon, ListItemText, TextField } from "@mui/material";
import throttle from 'lodash/throttle';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from "react-i18next";
import { searchIngredient } from "services";
import { IngredientSearchResponse } from "services/responseType";
import { SERVER_URL } from "utils/url";

type IngredientAutocompleterProps = {
    callback: Function;
}

export function IngredientAutocompleter({ callback }: IngredientAutocompleterProps) {
    const [value, setValue] = useState<IngredientSearchResponse | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<readonly IngredientSearchResponse[]>([]);
    const [t] = useTranslation();

    const fetchName = useMemo(
        () =>
            throttle(
                (request: string) => searchIngredient(request).then(res => setOptions(res)),
                200,
            ),
        [],
    );


    useEffect(() => {

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
            id="ingredient-autocomplete"
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
            onChange={(event: any, newValue: IngredientSearchResponse | null) => {
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
                    label={t('nutrition.searchIngredientName')}
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
                    <li {...props} id={`ingredient-${option.data.id}`}>
                        <ListItem disablePadding component="div">
                            <ListItemIcon>
                                {option.data.image
                                    ? <Avatar alt="" src={`${SERVER_URL}${option.data.image}`} variant="rounded" />
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
                            />
                        </ListItem>
                    </li>
                );
            }}
        />
    );
}