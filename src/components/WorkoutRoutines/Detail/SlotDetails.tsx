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
                            <>
                                <Grid item xs={12} sm={3} key={`sets-config-${slotConfig.id}`}>
                                    {getConfigComponent('sets', slotConfig.nrOfSetsConfigs, props.routineId, slotConfig.id)}
                                </Grid>
                                <Grid item xs={12} sm={3} key={`weight-config-${slotConfig.id}`}>
                                    {getConfigComponent('weight', slotConfig.weightConfigs, props.routineId, slotConfig.id)}
                                </Grid>
                                <Grid item xs={12} sm={3} key={`reps-config-${slotConfig.id}`}>
                                    {getConfigComponent('reps', slotConfig.repsConfigs, props.routineId, slotConfig.id)}
                                </Grid>
                            </>
                        ) : (
                            // Show all config details in advanced mode, also in a grid
                            <>
                                <Grid item xs={12} sm={2} key={`sets-config-${slotConfig.id}`}>
                                    {getConfigComponent('sets', slotConfig.nrOfSetsConfigs, props.routineId, slotConfig.id)}
                                </Grid>
                                <Grid item xs={12} sm={2} key={`weight-config-${slotConfig.id}`}>
                                    {getConfigComponent('weight', slotConfig.weightConfigs, props.routineId, slotConfig.id)}
                                </Grid>
                                <Grid item xs={12} sm={1} key={`max-weight-config-${slotConfig.id}`}>
                                    {getConfigComponent('max-weight', slotConfig.maxWeightConfigs, props.routineId, slotConfig.id)}
                                </Grid>
                                <Grid item xs={12} sm={2} key={`reps-config-${slotConfig.id}`}>
                                    {getConfigComponent('reps', slotConfig.repsConfigs, props.routineId, slotConfig.id)}
                                </Grid>
                                <Grid item xs={12} sm={1} key={`max-reps-config-${slotConfig.id}`}>
                                    {getConfigComponent('max-reps', slotConfig.maxRepsConfigs, props.routineId, slotConfig.id)}
                                </Grid>
                                <Grid item xs={12} sm={2} key={`rir-config-${slotConfig.id}`}>
                                    {getConfigComponent('rir', slotConfig.rirConfigs, props.routineId, slotConfig.id)}
                                </Grid>
                                <Grid item xs={12} sm={1} key={`rest-config-${slotConfig.id}`}>
                                    {getConfigComponent('rest', slotConfig.restTimeConfigs, props.routineId, slotConfig.id)}
                                </Grid>
                                <Grid item xs={12} sm={1} key={`max-rest-config-${slotConfig.id}`}>
                                    {getConfigComponent('max-rest', slotConfig.maxRestTimeConfigs, props.routineId, slotConfig.id)}
                                </Grid>
                            </>
                        )}
                    </Grid>
                </React.Fragment>
            ))}
        </>
    );
};