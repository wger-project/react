import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { CircularProgress, IconButton, MenuItem, Switch, TextField } from "@mui/material";
import { BaseConfig } from "components/WorkoutRoutines/models/BaseConfig";
import {
    useAddMaxRepsConfigQuery,
    useAddMaxRestConfigQuery,
    useAddMaxWeightConfigQuery,
    useAddNrOfSetsConfigQuery,
    useAddRepsConfigQuery,
    useAddRestConfigQuery,
    useAddRiRConfigQuery,
    useAddWeightConfigQuery,
    useDeleteMaxRepsConfigQuery,
    useDeleteMaxRestConfigQuery,
    useDeleteMaxWeightConfigQuery,
    useDeleteNrOfSetsConfigQuery,
    useDeleteRepsConfigQuery,
    useDeleteRestConfigQuery,
    useDeleteRiRConfigQuery,
    useDeleteWeightConfigQuery,
    useEditMaxRepsConfigQuery,
    useEditMaxRestConfigQuery,
    useEditMaxWeightConfigQuery,
    useEditNrOfSetsConfigQuery,
    useEditRepsConfigQuery,
    useEditRestConfigQuery,
    useEditRiRConfigQuery,
    useEditWeightConfigQuery
} from "components/WorkoutRoutines/queries";
import React, { useState } from "react";
import { DEBOUNCE_ROUTINE_FORMS } from "utils/consts";

const QUERY_MAP: { [key: string]: any } = {
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
};


export type ConfigType = 'weight' | 'max-weight' | 'reps' | 'max-reps' | 'sets' | 'rest' | 'max-rest' | 'rir';

export const ConfigDetailsValueField = (props: {
    config?: BaseConfig,
    routineId: number,
    slotConfigId?: number,
    type: ConfigType
}) => {

    const { edit: editQuery, add: addQuery, delete: deleteQuery } = QUERY_MAP[props.type];
    const editQueryHook = editQuery(props.routineId);
    const addQueryHook = addQuery(props.routineId);
    const deleteQueryHook = deleteQuery(props.routineId);


    const [value, setValue] = useState(props.config?.value || '');
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    const handleData = (value: string) => {

        const data = {
            // eslint-disable-next-line camelcase
            slot_config: props.slotConfigId,
            value: parseFloat(value),
        };

        if (value === '') {
            props.config && deleteQueryHook.mutate(props.config.id);
        } else if (props.config) {
            editQueryHook.mutate({ id: props.config.id, ...data });
        } else {
            addQueryHook.mutate({
                slot: props.slotConfigId!,
                iteration: 1,
                replace: true,
                operation: null,
                need_log_to_apply: false,
                ...data
            });
        }
    };

    const onChange = (text: string) => {
        if (text !== '') {
            setValue(parseFloat(text));
        } else {
            setValue('');
        }

        if (timer) {
            clearTimeout(timer);
        }
        setTimer(setTimeout(() => handleData(text), DEBOUNCE_ROUTINE_FORMS));
    };

    const isLoading = editQueryHook.isLoading || addQueryHook.isLoading || deleteQueryHook.isLoading;

    return (<>
        <TextField
            inputProps={{
                "data-testid": `${props.type}-field`,
            }}
            label={props.type}
            value={value}
            fullWidth
            variant="standard"
            disabled={isLoading}
            onChange={e => onChange(e.target.value)}
            InputProps={{
                endAdornment: isLoading && <CircularProgress size={20} />
            }}
        />
    </>);
};


export const AddConfigDetailsButton = (props: {
    iteration: number,
    routineId: number,
    slotConfigId: number,
    type: ConfigType
}) => {

    const { add: addQuery } = QUERY_MAP[props.type];
    const addQueryHook = addQuery(props.routineId);


    const handleData = () => {
        addQueryHook.mutate({
            slot_config: props.slotConfigId!,
            iteration: props.iteration,
            value: 0,
            operation: 'r',
            need_logs_to_apply: false
        });
    };

    return (<>
        <IconButton size="small" onClick={handleData} disabled={addQueryHook.isLoading}>
            <AddIcon />
        </IconButton>
    </>);
};

export const DeleteConfigDetailsButton = (props: {
    configId: number,
    routineId: number,
    type: ConfigType
}) => {

    const { delete: deleteQuery } = QUERY_MAP[props.type];
    const deleteQueryHook = deleteQuery(props.routineId);

    const handleData = () => {
        deleteQueryHook.mutate(props.configId);
    };

    return (
        <IconButton size="small" onClick={handleData} disabled={deleteQueryHook.isLoading}>
            <DeleteIcon />
        </IconButton>
    );
};


export const ConfigDetailsOperationField = (props: {
    config: BaseConfig,
    routineId: number,
    slotConfigId: number,
    type: ConfigType
}) => {

    const options = [
        {
            value: '+',
            label: 'Add',
        },
        {
            value: '-',
            label: 'Substract',
        },
        {
            value: 'r',
            label: 'Replace',
        },
    ];

    const { edit: editQuery } = QUERY_MAP[props.type];
    const editQueryHook = editQuery(props.routineId);

    const handleData = (newValue: string) => {
        editQueryHook.mutate({ id: props.config.id, operation: newValue, });
    };


    const isLoading = editQueryHook.isLoading;
    return (<>
        <TextField
            sx={{ width: 100 }}
            select
            label="Operation"
            value={props.config?.operation}
            variant="standard"
            disabled={isLoading}
            onChange={e => handleData(e.target.value)}
        >
            {options.map((option) => (
                <MenuItem key={option.value} value={option.value} selected={option.value === props.config?.operation}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    </>);
};

export const ConfigDetailsNeedsLogsField = (props: {
    config: BaseConfig,
    routineId: number,
    slotConfigId: number,
    type: ConfigType
}) => {

    const { edit: editQuery } = QUERY_MAP[props.type];
    const editQueryHook = editQuery(props.routineId);

    const [value, setValue] = useState<boolean>(props.config?.needLogToApply);

    const handleData = (newValue: boolean) => {
        setValue(newValue);
        editQueryHook.mutate({ id: props.config.id, need_log_to_apply: newValue, });
    };

    const isLoading = editQueryHook.isLoading;
    return (<>
        <Switch
            checked={value}
            onChange={e => handleData(e.target.checked)}
            disabled={isLoading}

        />
    </>);
};

