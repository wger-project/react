import {
    Box,
    Button,
    Container,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
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
    ConfigType,
    DeleteConfigDetailsButton
} from "components/WorkoutRoutines/widgets/forms/BaseConfigForm";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { getLanguageByShortName } from "services";
import { makeLink, WgerLink } from "utils/url";

export const ProgressionEdit = (props: {
    objectKey: string,
    type: ConfigType,
    routineId: number,
    slotConfig: SlotConfig,
    iterations: number[]
}) => {
    return (
        <React.Fragment>
            <Grid item md={12} lg={6}>
                <Typography variant="h6" gutterBottom>
                    {props.type}
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
                                            type={props.type}
                                        />
                                        : <AddConfigDetailsButton
                                            type={props.type}
                                            routineId={props.routineId}
                                            slotConfigId={props.slotConfig.id}
                                            iteration={iteration}
                                        />
                                    }
                                </TableCell>
                                <TableCell>
                                    {config && <ConfigDetailsValueField
                                        config={config}
                                        type={props.type}
                                        routineId={props.routineId}
                                        slotConfigId={props.slotConfig.id}
                                    />}
                                </TableCell>
                                <TableCell>
                                    {config && <ConfigDetailsOperationField
                                        config={config}
                                        type={props.type}
                                        routineId={props.routineId}
                                        slotConfigId={props.slotConfig.id}
                                    />}
                                </TableCell>
                                <TableCell>
                                    {config && <ConfigDetailsNeedsLogsField
                                        config={config}
                                        type={props.type}
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
            <Grid container>
                <Grid xs={10}>
                    <Typography variant={"h4"}>
                        Edit progression for slot #{slotId}
                    </Typography>
                </Grid>
                <Grid xs={2}>
                    <Button
                        component={Link}
                        variant={"outlined"}
                        size={"small"}
                        to={makeLink(WgerLink.ROUTINE_EDIT, i18n.language, { id: routineId })}
                    >
                        back to routine edit
                    </Button>
                </Grid>
            </Grid>


            <Box height={30} />
            {slot.configs.map((config) => <React.Fragment key={config.id}>
                    <Typography variant="h5" gutterBottom>
                        {config.exercise?.getTranslation(language).name}
                    </Typography>
                    <Grid container spacing={2}>
                        <ProgressionEdit
                            objectKey={'weightConfigs'}
                            type="weight"
                            routineId={routineId}
                            slotConfig={config}
                            iterations={iterations}
                        />
                        <ProgressionEdit
                            objectKey={'maxWeightConfigs'}
                            type="max-weight"
                            routineId={routineId}
                            slotConfig={config}
                            iterations={iterations}
                        />
                        <ProgressionEdit
                            objectKey={'repsConfigs'}
                            type="reps"
                            routineId={routineId}
                            slotConfig={config}
                            iterations={iterations}
                        />
                        <ProgressionEdit
                            objectKey={'maxRepsConfigs'}
                            type="max-reps"
                            routineId={routineId}
                            slotConfig={config}
                            iterations={iterations}
                        />
                        <ProgressionEdit
                            objectKey={'nrOfSetsConfigs'}
                            type="sets"
                            routineId={routineId}
                            slotConfig={config}
                            iterations={iterations}
                        />
                        <ProgressionEdit
                            objectKey={'restTimeConfigs'}
                            type="rest"
                            routineId={routineId}
                            slotConfig={config}
                            iterations={iterations}
                        />
                        <ProgressionEdit
                            objectKey={'maxRestTimeConfigs'}
                            type="max-rest"
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


