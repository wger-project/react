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
    Typography,
    useTheme
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


    //maxWidth={false}
    return <Container maxWidth={false} sx={{ overflowX: 'scroll' }}>
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
    const theme = useTheme();

    return <>
        <TableContainer component={Paper} sx={{ minWidth: 510 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={6}>
                            <Typography variant={'h5'}>
                                Week {props.iteration}
                            </Typography>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell align="right">Sets</TableCell>
                        <TableCell align="right">Reps</TableCell>
                        <TableCell align="right">Weight</TableCell>
                        <TableCell align="right">Rest</TableCell>
                        <TableCell align="right">RiR</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.dayData.map((dayData, index) =>
                        <>
                            <TableRow>
                                <TableCell
                                    sx={{ backgroundColor: dayData.day.isRest ? theme.palette.action.hover : null }}
                                    colSpan={6}
                                >
                                    <b>{dayData.day.isRest ? t('routines.restDay') : dayData.day.name}</b>
                                </TableCell>
                            </TableRow>
                            {dayData.slots.map((slotData) =>
                                <>
                                    {slotData.setConfigs.map((setConfig) =>
                                        <TableRow>
                                            <TableCell padding={'normal'}>
                                                {setConfig.exercise?.getTranslation().name}
                                                {/*ID: {setConfig.slotConfigId}*/}
                                            </TableCell>
                                            <TableCell padding={'none'} align={'center'}>
                                                {setConfig.nrOfSets}
                                            </TableCell>
                                            <TableCell padding={'none'} align={'center'}>
                                                {setConfig.reps}
                                                {setConfig.maxReps !== null &&
                                                    <> - {setConfig.maxReps}</>
                                                }
                                            </TableCell>
                                            <TableCell padding={'none'} align={'center'}>
                                                {setConfig.weight}
                                                {setConfig.maxWeight !== null &&
                                                    <> - {setConfig.maxWeight}</>
                                                }
                                            </TableCell>
                                            <TableCell padding={'none'} align={'center'}>
                                                {setConfig.restTime}
                                                {setConfig.maxRestTime !== null &&
                                                    <> - {setConfig.maxRestTime}</>
                                                }
                                            </TableCell>

                                            <TableCell padding={'normal'} align={'center'}>
                                                {setConfig.rir}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            )}
                            <TableRow>
                                <TableCell colSpan={6}></TableCell>
                            </TableRow>
                        </>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    </>;
};
