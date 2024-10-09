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
import { RenderLoadingQuery } from "components/Core/Widgets/RenderLoadingQuery";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";


export const RoutineDetailsTable = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const routineQuery = useRoutineDetailQuery(routineId);


    return <Container maxWidth={false} sx={{ overflowX: 'scroll', display: 'flex', }}>
        <RenderLoadingQuery
            query={routineQuery}
            child={routineQuery.isSuccess &&
                <>
                    <Stack direction={'row'}>
                        <DayTableExercises
                            dayData={routineQuery.data!.groupedDayDataByIteration[1]}
                            iteration={1}
                        />
                        {Object.keys(routineQuery.data!.groupedDayDataByIteration).map((iteration) =>
                            <DayTable
                                dayData={routineQuery.data!.groupedDayDataByIteration[parseInt(iteration)]}
                                iteration={parseInt(iteration)}
                                key={iteration}
                            />
                        )}
                    </Stack>
                </>
            }
        />
    </Container>;
};

const DayTableExercises = (props: { dayData: RoutineDayData[], iteration: number }) => {
    const [t] = useTranslation();
    const theme = useTheme();

    return <TableContainer component={Paper} sx={{ minWidth: 200, position: 'sticky', left: 0 }}>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>
                        <Typography variant={'h5'}>
                            &nbsp;
                        </Typography>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>&nbsp;</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.dayData.map((dayData, index) =>
                    <div key={`${props.iteration}-${index}`}>
                        <TableRow key={`tableRow-rest-${index}`}>
                            <TableCell sx={{ backgroundColor: theme.palette.action.hover }}>
                                <b>{dayData.day === null || dayData.day.isRest  ? t('routines.restDay') : dayData.day.name}</b>
                            </TableCell>
                        </TableRow>


                        {dayData.slots.map((slotData, slotIndex) =>
                            // <div key={`${props.iteration}-${index}-${slotIndex}`}>
                            <>
                                {slotData.setConfigs.map((setConfig, index) => {

                                        // Only show the name of the exercise the first time it appears
                                        const showExercise = index === 0 || setConfig.exerciseId !== slotData.setConfigs[index - 1]?.exerciseId;

                                        return <TableRow key={`tableRow-exercise-${index}`}>
                                            <TableCell
                                                key={`tableCell-exercise-${index}`}
                                                sx={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                                {showExercise ? setConfig.exercise?.getTranslation().name : '.'}
                                            </TableCell>
                                        </TableRow>;
                                    }
                                )}
                            </>
                        )}
                        <TableRow key={`tableRow-emtpy-${index}`}>
                            <TableCell key={`tableCell-emtpy-${index}`}></TableCell>
                        </TableRow>
                    </div>
                )}
            </TableBody>
        </Table>
    </TableContainer>;
};

const DayTable = (props: { dayData: RoutineDayData[], iteration: number }) => {
    const [t] = useTranslation();
    const theme = useTheme();

    return <TableContainer component={Paper} sx={{ minWidth: 380 }}>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell colSpan={5}>
                        <Typography variant={'h5'}>
                            Week {props.iteration}
                        </Typography>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell align={'center'}>Sets</TableCell>
                    <TableCell align={'center'}>Reps</TableCell>
                    <TableCell align={'center'}>Weight</TableCell>
                    <TableCell align={'center'}>Rest</TableCell>
                    <TableCell align={'center'}>RiR</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.dayData.map((dayData, index) =>
                    <>
                        <TableRow>
                            <TableCell
                                sx={{ backgroundColor: theme.palette.action.hover }}
                                colSpan={5}
                            >
                                &nbsp;
                            </TableCell>
                        </TableRow>
                        {dayData.slots.map((slotData) =>
                            <>
                                {slotData.setConfigs.map((setConfig) =>
                                    <TableRow>
                                        <TableCell align={'center'}>
                                            {setConfig.nrOfSets === null ? '-/-' : setConfig.nrOfSets}
                                        </TableCell>
                                        <TableCell align={'center'}>
                                            {setConfig.reps === null ? '-/-' : setConfig.reps}
                                            {setConfig.maxReps !== null &&
                                                <> - {setConfig.maxReps}</>
                                            }
                                        </TableCell>
                                        <TableCell align={'center'}>
                                            {setConfig.weight === null ? '-/-' : setConfig.weight}
                                            {setConfig.maxWeight !== null &&
                                                <> - {setConfig.maxWeight}</>
                                            }
                                        </TableCell>
                                        <TableCell align={'center'}>
                                            {setConfig.restTime === null ? '-/-' : setConfig.restTime}
                                            {setConfig.maxRestTime !== null &&
                                                <> - {setConfig.maxRestTime}</>
                                            }
                                        </TableCell>
                                        <TableCell align={'center'}>
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
    </TableContainer>;
};
