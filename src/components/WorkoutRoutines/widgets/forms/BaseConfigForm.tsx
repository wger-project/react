import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, MenuItem, Switch, TextField } from "@mui/material";
import { LoadingProgressIcon } from "components/Core/LoadingWidget/LoadingWidget";
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

export const SlotBaseConfigValueField = (props: {
    config?: BaseConfig,
    routineId: number,
    slotEntryId?: number,
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
            slot_entry: props.slotEntryId,
            value: parseFloat(value),
        };

        if (value === '') {
            props.config && deleteQueryHook.mutate(props.config.id);
        } else if (props.config) {
            editQueryHook.mutate({ id: props.config.id, ...data });
        } else {
            addQueryHook.mutate({
                iteration: 1,
                operation: 'r',
                step: 'abs',
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

    const isPending = editQueryHook.isPending || addQueryHook.isPending || deleteQueryHook.isPending;

    return (<>
        <TextField
            inputProps={{
                "data-testid": `${props.type}-field`,
            }}
            label={props.type}
            value={value}
            fullWidth
            variant="standard"
            disabled={isPending}
            onChange={e => onChange(e.target.value)}
            InputProps={{
                endAdornment: isPending && <LoadingProgressIcon />
            }}
        />
    </>);
};


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
            operation: 'r',
            need_log_to_apply: false
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
    type: ConfigType
}) => {

    const { delete: deleteQuery } = QUERY_MAP[props.type];
    const deleteQueryHook = deleteQuery(props.routineId);

    const handleData = () => {
        deleteQueryHook.mutate(props.configId);
    };

    return (
        <IconButton size="small" onClick={handleData} disabled={deleteQueryHook.isPending}>
            <DeleteIcon />
        </IconButton>
    );
};


export const EntryDetailsOperationField = (props: {
    config: BaseConfig,
    routineId: number,
    slotEntryId: number,
    type: ConfigType
}) => {

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
            value: 'r',
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
            disabled={editQueryHook.isPending}
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

export const ConfigDetailsNeedsLogsField = (props: {
    config: BaseConfig,
    routineId: number,
    slotEntryId: number,
    type: ConfigType
}) => {

    const { edit: editQuery } = QUERY_MAP[props.type];
    const editQueryHook = editQuery(props.routineId);

    const [value, setValue] = useState<boolean>(props.config?.needLogToApply);

    const handleData = (newValue: boolean) => {
        setValue(newValue);
        editQueryHook.mutate({ id: props.config.id, need_log_to_apply: newValue, });
    };

    const isPending = editQueryHook.isPending;
    return (<>
        <Switch
            checked={value}
            onChange={e => handleData(e.target.checked)}
            disabled={isPending}
        />
    </>);
};


export const ConfigDetailsRiRField = (props: { config?: BaseConfig, slotEntryId?: number, routineId: number }) => {

    const editRiRQuery = useEditRiRConfigQuery(props.routineId);
    const deleteRiRQuery = useDeleteRiRConfigQuery(props.routineId);
    const addRiRQuery = useAddRiRConfigQuery(props.routineId);

    const options = [
        {
            value: '',
            label: '-/-',
        },
        ...[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map(value => ({ value: value.toString(), label: value.toString() })),
        {
            value: '4.5',
            label: '4+'
        }
    ] as const;

    const handleData = (value: string) => {

        const data = {
            value: parseFloat(value),
        };

        if (value === '') {
            props.config && deleteRiRQuery.mutate(props.config.id);
        } else if (props.config !== undefined) {
            editRiRQuery.mutate({ id: props.config.id, ...data });
        } else {
            addRiRQuery.mutate({
                // eslint-disable-next-line camelcase
                slot_entry: props.slotEntryId!,
                iteration: 1,
                operation: 'r',
                need_log_to_apply: false,
                ...data
            });
        }
    };

    return <>
        <TextField
            fullWidth
            select
            label="RiR"
            variant="standard"
            defaultValue=""
            value={props.config?.value}
            disabled={editRiRQuery.isPending}
            onChange={e => handleData(e.target.value)}
        >
            {options!.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    </>;
};