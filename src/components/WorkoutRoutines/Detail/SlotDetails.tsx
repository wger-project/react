import { Box, Grid, Typography } from "@mui/material";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { ConfigDetailsField } from "components/WorkoutRoutines/widgets/forms/BaseConfigForm";
import { SlotConfigForm } from "components/WorkoutRoutines/widgets/forms/SlotConfigForm";
import React from "react";

export const SlotDetails = (props: { slot: Slot, routineId: number, simpleMode: boolean }) => {

    return (
        <>
            {props.slot.configs.map((slotConfig) => (
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
                                {slotConfig.weightConfigs.map((config) => (
                                    <Grid item xs={12} sm={4} key={`weight-${config.id}`}>
                                        <ConfigDetailsField config={config} type="weight" routineId={props.routineId} />
                                    </Grid>
                                ))}
                                {slotConfig.repsConfigs.map((config) => (
                                    <Grid item xs={12} sm={4} key={`reps-${config.id}`}>
                                        <ConfigDetailsField config={config} type="reps" routineId={props.routineId} />
                                    </Grid>
                                ))}
                                {slotConfig.nrOfSetsConfigs.map((config) => (
                                    <Grid item xs={12} sm={4} key={`sets-${config.id}`}>
                                        <ConfigDetailsField config={config} type="sets" routineId={props.routineId} />
                                    </Grid>
                                ))}
                            </>
                        ) : (
                            // Show all config details in advanced mode, also in a grid
                            <>
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