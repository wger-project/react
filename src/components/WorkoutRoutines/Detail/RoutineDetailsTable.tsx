import {
    Container,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";


export const RoutineDetailsTable = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const routineQuery = useRoutineDetailQuery(routineId);

    return <Container maxWidth={false}>
        {routineQuery.isLoading
            ? <LoadingPlaceholder />
            : <>
                <Typography variant={"caption"}>
                    {routineQuery.data?.description}
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <Stack direction={'row'}>
                        {Object.keys(routineQuery.data!.groupedDayDataByIteration).map((iteration) =>
                            <DayTable
                                dayData={routineQuery.data!.groupedDayDataByIteration[parseInt(iteration)]}
                                iteration={parseInt(iteration)}
                                key={iteration}
                            />
                        )}
                    </Stack>
                </Stack>
            </>
        }
    </Container>;
};

const DayTable = (props: { dayData: RoutineDayData[], iteration: number }) => {
    const [t] = useTranslation();

    return <>
        <TableContainer component={Paper} sx={{ maxWidth: 500 }}>
            <Table size="small" aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Typography variant={'h5'}>
                                Week {props.iteration}
                            </Typography>
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell align="right">Sets</TableCell>
                        <TableCell align="right">Reps</TableCell>
                        <TableCell align="right">Weight</TableCell>
                        <TableCell align="right">RiR</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.dayData.map((dayData, index) =>
                        <>
                            <TableRow>
                                <TableCell><b>{dayData.day.isRest ? t('routines.restDay') : dayData.day.name}</b></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                            {dayData.slots.map((slotData) =>
                                <>
                                    {slotData.setConfigs.map((setConfig) =>
                                        <TableRow>
                                            <TableCell>{setConfig.exercise?.getTranslation().name}</TableCell>
                                            <TableCell align="right">{setConfig.nrOfSets}</TableCell>
                                            <TableCell align="right">{setConfig.reps}</TableCell>
                                            <TableCell align="right">{setConfig.weight}</TableCell>
                                            <TableCell align="right">{setConfig.rir}</TableCell>
                                        </TableRow>
                                    )}
                                </>
                            )}
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    </>;
};
