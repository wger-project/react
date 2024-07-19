import { TextField } from "@mui/material";
import { BaseConfig } from "components/WorkoutRoutines/models/BaseConfig";
import {
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


export const ConfigDetailsField = (props: {
    config: BaseConfig,
    routineId: number,
    type: 'weight' | 'max-weight' | 'reps' | 'max-reps' | 'sets' | 'rest' | 'max-rest' | 'rir'
}) => {

    const editWeightQuery = useEditWeightConfigQuery(props.routineId);
    const editMaxWeightQuery = useEditMaxWeightConfigQuery(props.routineId);
    const editRepsQuery = useEditRepsConfigQuery(props.routineId);
    const editMaxRepsQuery = useEditMaxRepsConfigQuery(props.routineId);
    const editNrOfSetsQuery = useEditNrOfSetsConfigQuery(props.routineId);
    const editRiRQuery = useEditRiRConfigQuery(props.routineId);
    const editRestQuery = useEditRestConfigQuery(props.routineId);
    const editMaxRestQuery = useEditMaxRestConfigQuery(props.routineId);

    const [value, setValue] = useState(props.config.value);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    const handleData = (value: string) => {

        const data = {
            id: props.config.id,
            // eslint-disable-next-line camelcase
            slot_config: props.config.slotConfigId,
            value: parseFloat(value)
        };

        switch (props.type) {
            case 'weight':
                editWeightQuery.mutate(data);
                break;

            case "max-weight":
                editMaxWeightQuery.mutate(data);
                break;

            case 'reps':
                editRepsQuery.mutate(data);
                break;

            case "max-reps":
                editMaxRepsQuery.mutate(data);
                break;

            case 'sets':
                editNrOfSetsQuery.mutate(data);
                break;

            case 'rir':
                editRiRQuery.mutate(data);
                break;

            case 'rest':
                editRestQuery.mutate(data);
                break;

            case "max-rest":
                editMaxRestQuery.mutate(data);
                break;
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

    return (
        <>
            <TextField
                key={props.config.id}
                label={props.type}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </>
    );
};