import { Container, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { useLanguageQuery } from "components/Exercises/queries";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { SlotConfig } from "components/WorkoutRoutines/models/SlotConfig";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import {
    AddConfigDetailsButton,
    ConfigDetailsNeedsLogsField,
    ConfigDetailsOperationField,
    ConfigDetailsValueField,
    DeleteConfigDetailsButton
} from "components/WorkoutRoutines/widgets/forms/BaseConfigForm";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getLanguageByShortName } from "services";

export const ProgressionEdit = (props: {
    objectKey: string,
    routineId: number,
    slotConfig: SlotConfig,
    iterations: number[]
}) => {
    return (
        <React.Fragment>
            <Grid item md={12} lg={6}>
                <Typography variant="h6" gutterBottom>
                    {props.objectKey}
                </Typography>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>Value</TableCell>
                            <TableCell>Operation</TableCell>
                            <TableCell>Require logs</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.iterations.map((iteration) => {
                            // @ts-ignore
                            const config = props.slotConfig[props.objectKey].find((c) => c.iteration === iteration);

                            return <TableRow key={iteration}>
                                <TableCell>workout #{iteration}</TableCell>
                                <TableCell>
                                    {config
                                        ? <DeleteConfigDetailsButton
                                            configId={config.id}
                                            routineId={props.routineId}
                                            type="weight"
                                        />
                                        : <AddConfigDetailsButton
                                            type="weight"
                                            routineId={props.routineId}
                                            slotConfigId={props.slotConfig.id}
                                            iteration={iteration}
                                        />
                                    }
                                </TableCell>
                                <TableCell>
                                    {config && <ConfigDetailsValueField
                                        config={config}
                                        type="weight"
                                        routineId={props.routineId}
                                        slotConfigId={props.slotConfig.id}
                                    />}
                                </TableCell>
                                <TableCell>
                                    {config && config && <ConfigDetailsOperationField
                                        config={config}
                                        type="weight"
                                        routineId={props.routineId}
                                        slotConfigId={props.slotConfig.id}
                                    />}
                                </TableCell>
                                <TableCell>
                                    {config && <ConfigDetailsNeedsLogsField
                                        config={config}
                                        type="weight"
                                        routineId={props.routineId}
                                        slotConfigId={props.slotConfig.id}
                                    />}
                                </TableCell>
                            </TableRow>;
                        })}
                    </TableBody>
                </Table>
            </Grid>
        </React.Fragment>
    );
};

export const SlotProgressionEdit = () => {

    const { i18n } = useTranslation();
    const params = useParams<{ routineId: string, slotId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : -1;
    const slotId = params.slotId ? parseInt(params.slotId) : -1;
    const routineQuery = useRoutineDetailQuery(routineId);
    const languageQuery = useLanguageQuery();

    if (routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    const routine = routineQuery.data!;

    let language = undefined;
    if (languageQuery.isSuccess) {
        language = getLanguageByShortName(
            i18n.language,
            languageQuery.data!
        );
    }


    let slot: Slot | null = null;
    for (const day of routine.days) {
        const foundSlot = day.slots.find((s) => s.id === slotId);
        if (foundSlot) {
            slot = foundSlot;
            break;
        }
    }

    if (slot === null) {
        return <p>Slot not found!</p>;
    }

    const iterations = Object.keys(routine.groupedDayDataByIteration).map(Number);


    return <>
        <Container maxWidth="lg"> {/*maxWidth={false}*/}
            <Typography variant={"h4"}>
                Edit progression for slot #{slotId}
            </Typography>


            {slot.configs.map((config) => <React.Fragment key={config.id}>
                    <Typography variant="h5" gutterBottom>
                        {config.exercise?.getTranslation(language).name}
                    </Typography>
                    <Grid container spacing={2}>
                        <ProgressionEdit
                            objectKey={'weightConfigs'}
                            routineId={routineId}
                            slotConfig={config}
                            iterations={iterations}
                        />
                        <ProgressionEdit
                            objectKey={'maxWeightConfigs'}
                            routineId={routineId}
                            slotConfig={config}
                            iterations={iterations}
                        />
                        <ProgressionEdit
                            objectKey={'repsConfigs'}
                            routineId={routineId}
                            slotConfig={config}
                            iterations={iterations}
                        />
                        <ProgressionEdit
                            objectKey={'maxRepsConfigs'}
                            routineId={routineId}
                            slotConfig={config}
                            iterations={iterations}
                        />
                        <ProgressionEdit
                            objectKey={'nrOfSetsConfigs'}
                            routineId={routineId}
                            slotConfig={config}
                            iterations={iterations}
                        />
                        <ProgressionEdit
                            objectKey={'restTimeConfigs'}
                            routineId={routineId}
                            slotConfig={config}
                            iterations={iterations}
                        />
                        <ProgressionEdit
                            objectKey={'maxRestTimeConfigs'}
                            routineId={routineId}
                            slotConfig={config}
                            iterations={iterations}
                        />
                    </Grid>
                </React.Fragment>
            )}


        </Container>


    </>;
};


