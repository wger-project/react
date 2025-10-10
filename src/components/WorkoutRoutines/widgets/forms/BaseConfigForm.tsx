import { CheckBoxOutlineBlank } from "@mui/icons-material";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CheckBoxIcon from '@mui/icons-material/CheckBox';


import SettingsIcon from '@mui/icons-material/Settings';
import { Button, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, TextField } from "@mui/material";
import { LoadingProgressIcon } from "components/Core/LoadingWidget/LoadingWidget";
import {
    BaseConfig,
    OPERATION_REPLACE,
    REQUIREMENTS_VALUES,
    RequirementsType,
    RIR_VALUES_SELECT
} from "components/WorkoutRoutines/models/BaseConfig";
import {
    useAddMaxRepsConfigQuery,
    useAddMaxRestConfigQuery,
    useAddMaxRiRConfigQuery,
    useAddMaxWeightConfigQuery,
    useAddNrOfSetsConfigQuery,
    useAddRepsConfigQuery,
    useAddRestConfigQuery,
    useAddRiRConfigQuery,
    useAddWeightConfigQuery,
    useDeleteMaxRepsConfigQuery,
    useDeleteMaxRestConfigQuery,
    useDeleteMaxRiRConfigQuery,
    useDeleteMaxWeightConfigQuery,
    useDeleteNrOfSetsConfigQuery,
    useDeleteRepsConfigQuery,
    useDeleteRestConfigQuery,
    useDeleteRiRConfigQuery,
    useDeleteWeightConfigQuery,
    useEditMaxRepsConfigQuery,
    useEditMaxRestConfigQuery,
    useEditMaxRiRConfigQuery,
    useEditMaxWeightConfigQuery,
    useEditNrOfSetsConfigQuery,
    useEditRepsConfigQuery,
    useEditRestConfigQuery,
    useEditRiRConfigQuery,
    useEditWeightConfigQuery
} from "components/WorkoutRoutines/queries";
import {
    useAddMaxNrOfSetsConfigQuery,
    useEditMaxNrOfSetsConfigQuery
} from "components/WorkoutRoutines/queries/configs";
import { useFormikContext } from "formik";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DEBOUNCE_ROUTINE_FORMS } from "utils/consts";
import { errorsToString } from "utils/forms";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const QUERY_MAP: { [key: string]: any } = {
    'weight': {
        edit: useEditWeightConfigQuery,
        add: useAddWeightConfigQuery,
        delete: useDeleteWeightConfigQuery
    },
    'max-weight': {
        edit: useEditMaxWeightConfigQuery,
        add: useAddMaxWeightConfigQuery,
        delete: useDeleteMaxWeightConfigQuery
    },
    'reps': {
        edit: useEditRepsConfigQuery,
        add: useAddRepsConfigQuery,
        delete: useDeleteRepsConfigQuery
    },
    'max-reps': {
        edit: useEditMaxRepsConfigQuery,
        add: useAddMaxRepsConfigQuery,
        delete: useDeleteMaxRepsConfigQuery
    },
    'sets': {
        edit: useEditNrOfSetsConfigQuery,
        add: useAddNrOfSetsConfigQuery,
        delete: useDeleteNrOfSetsConfigQuery
    },
    'max-sets': {
        edit: useEditMaxNrOfSetsConfigQuery,
        add: useAddMaxNrOfSetsConfigQuery,
        delete: useAddMaxRepsConfigQuery
    },
    'rest': {
        edit: useEditRestConfigQuery,
        add: useAddRestConfigQuery,
        delete: useDeleteRestConfigQuery
    },
    'max-rest': {
        edit: useEditMaxRestConfigQuery,
        add: useAddMaxRestConfigQuery,
        delete: useDeleteMaxRestConfigQuery
    },
    'rir': {
        edit: useEditRiRConfigQuery,
        add: useAddRiRConfigQuery,
        delete: useDeleteRiRConfigQuery
    },
    'max-rir': {
        edit: useEditMaxRiRConfigQuery,
        add: useAddMaxRiRConfigQuery,
        delete: useDeleteMaxRiRConfigQuery
    },
};


export type ConfigType =
    'weight'
    | 'max-weight'
    | 'reps'
    | 'max-reps'
    | 'sets'
    | 'max-sets'
    | 'rest'
    | 'max-rest'
    | 'rir'
    | 'max-rir';

export const SlotBaseConfigValueField = (props: {
    config?: BaseConfig,
    routineId: number,
    slotEntryId?: number,
    type: ConfigType,
}) => {
    const { t } = useTranslation();
    const { edit: editQuery, add: addQuery, delete: deleteQuery } = QUERY_MAP[props.type];
    const editQueryHook = editQuery(props.routineId);
    const addQueryHook = addQuery(props.routineId);
    const deleteQueryHook = deleteQuery(props.routineId);

    const [value, setValue] = useState(props.config?.value || '');
    const [manualValidationError, setManualValidationError] = useState<string | null>(null);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    const isInt = ['sets', 'max-sets', 'rest', 'max-rest'].includes(props.type);
    const parseFunction = isInt ? parseInt : parseFloat;

    let title = '';
    switch (props.type) {
        case "weight":
            title = t('weight');
            break;
        case "max-weight":
            title = 'max ' + t('weight');
            break;
        case "reps":
            title = t('server.repetitions');
            break;
        case "max-reps":
            title = t('server.max_reps');
            break;
        case "sets":
            title = t('routines.sets');
            break;
        case "max-sets":
            title = 'max ' + t('routines.sets');
            break;
        case "rest":
            title = t('routines.restTime');
            break;
        case "max-rest":
            title = 'max ' + t('routines.restTime');
            break;
        case "rir":
            title = t('routines.rir');
            break;
        case "max-rir":
            title = 'max ' + t('routines.rir');
            break;
    }

    const handleData = (value: string) => {

        const data = {
            // eslint-disable-next-line camelcase
            slot_entry: props.slotEntryId,
            value: parseFunction(value),
        };

        if (value === '' && props.config) {
            deleteQueryHook.mutate(props.config.id);
        } else if (props.config) {
            editQueryHook.mutate({ id: props.config.id, ...data });
        } else {
            addQueryHook.mutate({
                iteration: 1,
                operation: OPERATION_REPLACE,
                step: 'abs',
                requirements: null,
                ...data
            });
        }
    };

    const onChange = (text: string) => {
        setValue(text);

        if (text !== '' && Number.isNaN(parseFunction(text))) {
            setManualValidationError(t(isInt ? 'forms.enterInteger' : 'forms.enterNumber'));
            return;
        } else {
            setManualValidationError(null);
        }

        if (timer) {
            clearTimeout(timer);
        }
        setTimer(setTimeout(() => handleData(text), DEBOUNCE_ROUTINE_FORMS));
    };

    const isPending = editQueryHook.isPending || addQueryHook.isPending || deleteQueryHook.isPending;
    const isError = editQueryHook.isError || addQueryHook.isError || deleteQueryHook.isError;
    const errorMessage = errorsToString(editQueryHook.error?.response?.data) || errorsToString(addQueryHook.error?.response?.data) || errorsToString(deleteQueryHook.error?.response?.data);

    return (
        <TextField
            slotProps={{
                input: { endAdornment: isPending && <LoadingProgressIcon /> }
            }}
            inputProps={{
                "data-testid": `${props.type}-field`,
            }}
            label={title}
            value={value}
            fullWidth
            variant="standard"
            disabled={isPending}
            onChange={e => onChange(e.target.value)}
            error={!!manualValidationError || isError}
            helperText={manualValidationError || errorMessage}
        />
    );
};


export const ConfigDetailsRequirementsField = (props: {
    fieldName: string,
    values: RequirementsType[],
    disabled?: boolean
}) => {

    const { setFieldValue } = useFormikContext();
    const { t } = useTranslation();
    const disable = props.disabled ?? false;

    const [selectedElements, setSelectedElements] = useState<RequirementsType[]>(props.values);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleSelection = (value: RequirementsType) => {
        // if the value is not in selectedElements, add it
        if (!selectedElements.includes(value)) {
            setSelectedElements([...selectedElements, value]);
        } else {
            setSelectedElements(selectedElements.filter((e) => e !== value));
        }
    };

    const handleSubmit = async () => {
        await setFieldValue(props.fieldName, selectedElements);
        setAnchorEl(null);
    };


    return <>
        <IconButton
            disabled={disable}
            onClick={(event) => setAnchorEl(event.currentTarget)}
        >
            {anchorEl ? <ArrowDropUpIcon fontSize="small" /> : <SettingsIcon fontSize="small" />}
        </IconButton>
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
        >
            {...REQUIREMENTS_VALUES.map((e, index) => <MenuItem
                key={index}
                onClick={() => handleSelection(e as unknown as RequirementsType)}>
                <ListItemIcon>
                    {selectedElements.includes(e as unknown as RequirementsType)
                        ? <CheckBoxIcon fontSize="small" />
                        : <CheckBoxOutlineBlank fontSize="small" />
                    }
                </ListItemIcon>
                <ListItemText>
                    {e}
                </ListItemText>
            </MenuItem>)}
            <Divider />
            <MenuItem>

                <Button color="primary" variant="contained" type="submit" size="small" onClick={handleSubmit}>
                    {t('save')}
                </Button>
            </MenuItem>
        </Menu></>;
};


export const ConfigDetailsRiRField = (props: { config?: BaseConfig, slotEntryId?: number, routineId: number }) => {

    const editRiRQuery = useEditRiRConfigQuery(props.routineId);
    const deleteRiRQuery = useDeleteRiRConfigQuery(props.routineId);
    const addRiRQuery = useAddRiRConfigQuery(props.routineId);

    const handleData = (value: string) => {

        const data = {
            value: parseFloat(value),
        };

        if (value === '' && props.config) {
            deleteRiRQuery.mutate(props.config.id);
        } else if (props.config !== undefined) {
            editRiRQuery.mutate({ id: props.config.id, ...data });
        } else {
            addRiRQuery.mutate({
                // eslint-disable-next-line camelcase
                slot_entry: props.slotEntryId!,
                iteration: 1,
                operation: OPERATION_REPLACE,
                ...data
            });
        }
    };

    return <TextField
        fullWidth
        select
        label="RiR"
        variant="standard"
        defaultValue=""
        value={props.config?.value}
        disabled={editRiRQuery.isPending}
        onChange={e => handleData(e.target.value)}
    >
        {RIR_VALUES_SELECT.map((option) => (
            <MenuItem key={option.value} value={option.value}>
                {option.label}
            </MenuItem>
        ))}
    </TextField>;
};


/*
 *  ---> These components are not needed anymore but are kept here in case we need
 *       to edit these fields individually in the future
 */

/*
export const AddEntryDetailsButton = (props: {
    iteration: number,
    routineId: number,
    slotEntryId: number,
    type: ConfigType
}) => {

    const { add: addQuery } = QUERY_MAP[props.type];
    const addQueryHook = addQuery(props.routineId);


    const handleData = () => {
        addQueryHook.mutate({
            slot_entry: props.slotEntryId!,
            iteration: props.iteration,
            value: 0,
            operation: OPERATION_REPLACE,
        });
    };

    return (<>
        <IconButton size="small" onClick={handleData} disabled={addQueryHook.isPending}>
            <AddIcon />
        </IconButton>
    </>);
};

export const DeleteEntryDetailsButton = (props: {
    configId: number,
    routineId: number,
    type: ConfigType,
    disable?: boolean
}) => {
    const disable = props.disable ?? false;
    const { delete: deleteQuery } = QUERY_MAP[props.type];
    const deleteQueryHook = deleteQuery(props.routineId);

    const handleData = () => {
        deleteQueryHook.mutate(props.configId);
    };

    return (
        <IconButton size="small" onClick={handleData} disabled={disable || deleteQueryHook.isPending}>
            <DeleteIcon />
        </IconButton>
    );
};


export const EntryDetailsOperationField = (props: {
    config: BaseConfig,
    routineId: number,
    slotEntryId: number,
    type: ConfigType,
    disable?: boolean
}) => {

    const disable = props.disable ?? false;
    const options = [
        {
            value: '+',
            label: 'Add',
        },
        {
            value: '-',
            label: 'Subtract',
        },
        {
            value: OPERATION_REPLACE,
            label: 'Replace',
        },
    ];

    const { edit: editQuery } = QUERY_MAP[props.type];
    const editQueryHook = editQuery(props.routineId);

    const handleData = (newValue: string) => {
        editQueryHook.mutate({ id: props.config.id, operation: newValue, });
    };

    return (<>
        <TextField
            sx={{ width: 100 }}
            select
            label="Operation"
            value={props.config?.operation}
            variant="standard"
            disabled={disable || editQueryHook.isPending}
            onChange={e => handleData(e.target.value)}
        >
            {options.map((option) => (
                <MenuItem key={option.value} value={option.value} selected={option.value === props.config.operation}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    </>);
};

export const EntryDetailsStepField = (props: {
    config: BaseConfig,
    routineId: number,
    slotEntryId: number,
    type: ConfigType,
    disable?: boolean
}) => {

    const disable = props.disable ?? false;

    const options = [
        {
            value: 'abs',
            label: 'absolute',
        },
        {
            value: 'percent',
            label: 'percent',
        },
    ];

    if (props.config.iteration === 1) {
        options.push({
            value: 'na',
            label: 'n/a',
        });
    }

    const { edit: editQuery } = QUERY_MAP[props.type];
    const editQueryHook = editQuery(props.routineId);

    const handleData = (newValue: string) => {
        editQueryHook.mutate({ id: props.config.id, step: newValue, });
    };

    return (<>
        <TextField
            sx={{ width: 100 }}
            select
            // label="Operation"
            value={props.config?.step}
            variant="standard"
            disabled={disable || editQueryHook.isPending}
            onChange={e => handleData(e.target.value)}
        >
            {options.map((option) => (
                <MenuItem key={option.value} value={option.value} selected={option.value === props.config.step}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    </>);
};

*/