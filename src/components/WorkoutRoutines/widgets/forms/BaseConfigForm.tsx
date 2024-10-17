import { CircularProgress, TextField } from "@mui/material";
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


export const ConfigDetailsField = (props: {
    config?: BaseConfig,
    routineId: number,
    slotId?: number,
    type: 'weight' | 'max-weight' | 'reps' | 'max-reps' | 'sets' | 'rest' | 'max-rest' | 'rir'
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
            slot_config: props.slotId,
            value: parseFloat(value),
            iteration: 1,
            operation: null,
            replace: true,
            need_log_to_apply: false
        };

        if (value === '') {
            props.config && deleteQueryHook.mutate(props.config.id);
        } else if (props.config) {
            editQueryHook.mutate({ id: props.config.id, ...data });
        } else {
            addQueryHook.mutate({ slot: props.slotId!, ...data });
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

    return (<>
        <TextField
            inputProps={{
                "data-testid": `${props.type}-field`,
            }}
            label={props.type}
            value={value}
            fullWidth
            onChange={e => onChange(e.target.value)}
            InputProps={{
                endAdornment: (editQueryHook.isLoading || addQueryHook.isLoading) && <CircularProgress size={20} />
            }}
        />
    </>);
};