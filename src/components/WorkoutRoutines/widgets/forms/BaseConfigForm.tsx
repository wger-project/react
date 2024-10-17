import { TextField } from "@mui/material";
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
    'weight': { edit: useEditWeightConfigQuery, add: useAddWeightConfigQuery },
    'max-weight': { edit: useEditMaxWeightConfigQuery, add: useAddMaxWeightConfigQuery },
    'reps': { edit: useEditRepsConfigQuery, add: useAddRepsConfigQuery },
    'max-reps': { edit: useEditMaxRepsConfigQuery, add: useAddMaxRepsConfigQuery },
    'sets': { edit: useEditNrOfSetsConfigQuery, add: useAddNrOfSetsConfigQuery },
    'rest': { edit: useEditRestConfigQuery, add: useAddRestConfigQuery },
    'max-rest': { edit: useEditMaxRestConfigQuery, add: useAddMaxRestConfigQuery },
    'rir': { edit: useEditRiRConfigQuery, add: useAddRiRConfigQuery },
};


export const ConfigDetailsField = (props: {
    config: BaseConfig,
    routineId: number,
    slotId: number,
    type: 'weight' | 'max-weight' | 'reps' | 'max-reps' | 'sets' | 'rest' | 'max-rest' | 'rir'
}) => {

    const { edit: editQuery, add: addQuery } = QUERY_MAP[props.type];
    const editQueryHook = editQuery(props.routineId);
    const addQueryHook = addQuery(props.routineId);


    const [value, setValue] = useState(props.config.value);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    const handleData = (value: string) => {

        const data = {
            // eslint-disable-next-line camelcase
            slot_config: props.slotId,
            value: parseFloat(value)
        };

        if (props.config) {
            editQueryHook.mutate({ id: props.config.id, ...data });
        } else {
            addQueryHook.mutate({ slot: props.slotId, ...data });
        }


    };

    const onChange = (text: string) => {
        if (text !== '') {
            setValue(parseFloat(text));
        }

        if (timer) {
            clearTimeout(timer);
        }
        setTimer(setTimeout(() => handleData(text), DEBOUNCE_ROUTINE_FORMS));
    };

    return (<>
        <TextField
            key={props.config.id}
            label={props.type}
            value={value}
            onChange={e => onChange(e.target.value)}
        />
    </>);
};