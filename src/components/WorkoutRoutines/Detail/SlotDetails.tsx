import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from '@mui/icons-material/EditOff';
import { Grid, IconButton, Typography } from "@mui/material";
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import { BaseConfig } from "components/WorkoutRoutines/models/BaseConfig";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { SlotConfig } from "components/WorkoutRoutines/models/SlotConfig";
import { useEditSlotConfigQuery } from "components/WorkoutRoutines/queries";
import { ConfigDetailsField } from "components/WorkoutRoutines/widgets/forms/BaseConfigForm";
import React, { useState } from "react";
import { ExerciseSearchResponse } from "services/responseType";

const configTypes = ["weight", "max-weight", "reps", "max-reps", "sets", "rest", "max-rest", "rir"] as const;
type ConfigType = typeof configTypes[number];

const getConfigComponent = (type: ConfigType, configs: BaseConfig[], routineId: number, slotId: number) => {
    return configs.length > 0
        ?
        <ConfigDetailsField
            config={configs[0]}
            type={type}
            routineId={routineId} />

        : <ConfigDetailsField
            type={type}
            routineId={routineId}
            slotId={slotId} />
        ;
};

export const SlotDetails = (props: { slot: Slot, routineId: number, simpleMode: boolean }) => {

    return (
        <>
            {props.slot.configs.map((slotConfig: SlotConfig) => (
                <SlotConfigDetails
                    key={slotConfig.id}
                    slotConfig={slotConfig}
                    routineId={props.routineId}
                    simpleMode={props.simpleMode}
                />
            ))}
        </>
    );
};

export const SlotConfigDetails = (props: { slotConfig: SlotConfig, routineId: number, simpleMode: boolean }) => {

    const [editExercise, setEditExercise] = useState(false);

    const toggleEditExercise = () => setEditExercise(!editExercise);
    const editSlotQuery = useEditSlotConfigQuery(props.routineId);

    const handleExerciseChange = (searchResponse: ExerciseSearchResponse | null) => {
        if (searchResponse === null) {
            return;
        }

        editSlotQuery.mutate({ id: props.slotConfig.id, exercise: searchResponse.data.base_id });
        setEditExercise(false);
    };

    return (
        <React.Fragment key={props.slotConfig.id}>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                    <Typography variant={"h6"} gutterBottom>
                        {props.slotConfig.exercise?.getTranslation().name}

                        <IconButton size={"small"} onClick={toggleEditExercise}>
                            {editExercise ? <EditOffIcon /> : <EditIcon />}
                        </IconButton>
                    </Typography>
                </Grid>
                {editExercise
                    && <>
                        <Grid item xs={9}>
                            <NameAutocompleter callback={handleExerciseChange} />
                        </Grid><Grid item xs={12} sm={3} />
                    </>
                }

                {/*<SlotConfigForm routineId={props.routineId} slotConfig={props.slotConfig} />*/}


                {props.simpleMode ? (
                    <>
                        <Grid item xs={12} sm={3} key={`sets-config-${props.slotConfig.id}`}>
                            {getConfigComponent('sets', props.slotConfig.nrOfSetsConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                        <Grid item xs={12} sm={3} key={`weight-config-${props.slotConfig.id}`}>
                            {getConfigComponent('weight', props.slotConfig.weightConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                        <Grid item xs={12} sm={3} key={`reps-config-${props.slotConfig.id}`}>
                            {getConfigComponent('reps', props.slotConfig.repsConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                    </>
                ) : (
                    // Show all config details in advanced mode, also in a grid
                    <>
                        <Grid item xs={12} sm={2} key={`sets-config-${props.slotConfig.id}`}>
                            {getConfigComponent('sets', props.slotConfig.nrOfSetsConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                        <Grid item xs={12} sm={2} key={`weight-config-${props.slotConfig.id}`}>
                            {getConfigComponent('weight', props.slotConfig.weightConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                        <Grid item xs={12} sm={2} key={`max-weight-config-${props.slotConfig.id}`}>
                            {getConfigComponent('max-weight', props.slotConfig.maxWeightConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                        <Grid item xs={12} sm={2} key={`rir-config-${props.slotConfig.id}`}>
                            {getConfigComponent('rir', props.slotConfig.rirConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>

                        <Grid item xs={12} sm={3}>

                        </Grid>
                        <Grid item xs={12} sm={2} key={`reps-config-${props.slotConfig.id}`}>
                            {getConfigComponent('reps', props.slotConfig.repsConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                        <Grid item xs={12} sm={2} key={`max-reps-config-${props.slotConfig.id}`}>
                            {getConfigComponent('max-reps', props.slotConfig.maxRepsConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>

                        <Grid item xs={12} sm={2} key={`rest-config-${props.slotConfig.id}`}>
                            {getConfigComponent('rest', props.slotConfig.restTimeConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                        <Grid item xs={12} sm={2} key={`max-rest-config-${props.slotConfig.id}`}>
                            {getConfigComponent('max-rest', props.slotConfig.maxRestTimeConfigs, props.routineId, props.slotConfig.id)}
                        </Grid>
                    </>
                )}
            </Grid>
        </React.Fragment>
    );
};