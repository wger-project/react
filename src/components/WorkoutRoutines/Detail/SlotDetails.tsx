import { Box, Grid, Typography } from "@mui/material";
import { BaseConfig } from "components/WorkoutRoutines/models/BaseConfig";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { SlotConfig } from "components/WorkoutRoutines/models/SlotConfig";
import { ConfigDetailsField } from "components/WorkoutRoutines/widgets/forms/BaseConfigForm";
import { SlotConfigForm } from "components/WorkoutRoutines/widgets/forms/SlotConfigForm";
import React from "react";

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
                <React.Fragment key={slotConfig.id}>
                    <p>
                        <small>SlotConfigId {slotConfig.id}</small>
                    </p>

                    <Typography variant={"h6"} gutterBottom>
                        {slotConfig.exercise?.getTranslation().name}
                    </Typography>

                    <SlotConfigForm routineId={props.routineId} slotConfig={slotConfig} />
                    <Box height={40} />

                    <Grid container spacing={2}>
                        {props.simpleMode ? (
                            // Show only weight, reps, and sets in simple mode
                            <>
                                <Grid item xs={12} sm={4} key={`sets-config-${slotConfig.id}`}>
                                    {getConfigComponent('sets', slotConfig.nrOfSetsConfigs, props.routineId, slotConfig.id)}
                                </Grid>
                                <Grid item xs={12} sm={4} key={`weight-config-${slotConfig.id}`}>
                                    {getConfigComponent('weight', slotConfig.weightConfigs, props.routineId, slotConfig.id)}
                                </Grid>
                                <Grid item xs={12} sm={4} key={`reps-config-${slotConfig.id}`}>
                                    {getConfigComponent('reps', slotConfig.repsConfigs, props.routineId, slotConfig.id)}
                                </Grid>

                            </>
                        ) : (
                            // Show all config details in advanced mode, also in a grid
                            <>
                                <h1>TODO!</h1>
                                {slotConfig.weightConfigs.map((config) => (
                                    <Grid item xs={12} sm={4} key={`weight-${config.id}`}>
                                        <ConfigDetailsField config={config} type="weight" routineId={props.routineId} />
                                    </Grid>
                                ))}
                                {slotConfig.maxWeightConfigs.map((config) => (
                                    <Grid item xs={12} sm={4} key={`max-weight-${config.id}`}>
                                        <ConfigDetailsField config={config} type="max-weight"
                                                            routineId={props.routineId} />
                                    </Grid>
                                ))}
                                {slotConfig.repsConfigs.map((config) => (
                                    <Grid item xs={12} sm={4} key={`reps-${config.id}`}>
                                        <ConfigDetailsField config={config} type="reps" routineId={props.routineId} />
                                    </Grid>
                                ))}
                                {slotConfig.maxRepsConfigs.map((config) => (
                                    <Grid item xs={12} sm={4} key={`max-reps-${config.id}`}>
                                        <ConfigDetailsField config={config} type="max-reps"
                                                            routineId={props.routineId} />
                                    </Grid>
                                ))}
                                {slotConfig.nrOfSetsConfigs.map((config) => (
                                    <Grid item xs={12} sm={4} key={`sets-${config.id}`}>
                                        <ConfigDetailsField config={config} type="sets" routineId={props.routineId} />
                                    </Grid>
                                ))}
                                {slotConfig.restTimeConfigs.map((config) => (
                                    <Grid item xs={12} sm={4} key={`rest-${config.id}`}>
                                        <ConfigDetailsField config={config} type="rest" routineId={props.routineId} />
                                    </Grid>
                                ))}
                                {slotConfig.maxRestTimeConfigs.map((config) => (
                                    <Grid item xs={12} sm={4} key={`max-rest-${config.id}`}>
                                        <ConfigDetailsField config={config} type="max-rest"
                                                            routineId={props.routineId} />
                                    </Grid>
                                ))}
                                {slotConfig.rirConfigs.map((config) => (
                                    <Grid item xs={12} sm={4} key={`rir-${config.id}`}>
                                        <ConfigDetailsField config={config} type="rir" routineId={props.routineId} />
                                    </Grid>
                                ))}
                            </>
                        )}
                    </Grid>
                </React.Fragment>
            ))}
        </>
    );
};