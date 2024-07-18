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
    Stack,
    Switch,
    TextField
} from "@mui/material";
import throttle from 'lodash/throttle';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from "react-i18next";
import { searchIngredient } from "services";
import { IngredientSearchResponse } from "services/responseType";
import { LANGUAGE_SHORT_ENGLISH } from "utils/consts";
import { SERVER_URL } from "utils/url";

type IngredientAutocompleterProps = {
    callback: Function;
    initialIngredient?: string | null;
}

export function IngredientAutocompleter({ callback, initialIngredient }: IngredientAutocompleterProps) {


    const initialData = initialIngredient
        ? {
            value: initialIngredient,
            data: {
                id: -1,
                name: initialIngredient,
                image: null,
                // eslint-disable-next-line camelcase
                image_thumbnail: null,
            }
        }
        : null;


    const [searchEnglish, setSearchEnglish] = useState<boolean>(true);
    const [value, setValue] = useState<IngredientSearchResponse | null>(initialData);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<readonly IngredientSearchResponse[]>([]);
    const [t, i18n] = useTranslation();

    const fetchName = useMemo(
        () => throttle(
            (request: string) => searchIngredient(request, i18n.language, searchEnglish).then(res => setOptions(res)),
            200,
        ),
        [i18n.language, searchEnglish],
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


    return <Stack>
        <Autocomplete
            id="ingredient-autocomplete"
            getOptionLabel={(option) => option.value}
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
                    <li {...props} key={`ingredient-${option.data.id}`}>
                        <ListItem disablePadding component="div">
                            <ListItemIcon>
                                <Avatar alt="" src={`${SERVER_URL}${option.data.image}`} variant="rounded">
                                    <PhotoIcon />
                                </Avatar>


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
        {i18n.language !== LANGUAGE_SHORT_ENGLISH && <FormGroup>
            <FormControlLabel
                control={<Switch checked={searchEnglish} onChange={(event, checked) => setSearchEnglish(checked)} />}
                label={t('alsoSearchEnglish')} />
        </FormGroup>}
    </Stack>;
}