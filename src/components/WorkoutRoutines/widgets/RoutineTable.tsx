import {
    Chip,
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
import { useLanguageQuery } from "components/Exercises/queries";
import { RoutineDayData } from "components/WorkoutRoutines/models/RoutineDayData";
import React from "react";
import { useTranslation } from "react-i18next";
import { getLanguageByShortName } from "services";

export const DayTableExercises = (props: { dayData: RoutineDayData[], iteration: number }) => {
    const { i18n } = useTranslation();
    const theme = useTheme();

    const languageQuery = useLanguageQuery();

    let language = undefined;
    if (languageQuery.isSuccess) {
        language = getLanguageByShortName(
            i18n.language,
            languageQuery.data!
        );
    }

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
                {props.dayData.filter((dayData) => dayData.day !== null).map((dayData, index) =>
                    <React.Fragment key={index}>
                        <TableRow>
                            <TableCell sx={{ backgroundColor: theme.palette.action.hover }}>
                                <b>{dayData.day !== null && dayData.day.getDisplayName()}</b>
                            </TableCell>
                        </TableRow>


                        {dayData.slots.map((slotData, slotIndex) =>
                            <React.Fragment key={slotIndex}>
                                {slotData.setConfigs.map((setConfig, index) => {

                                        // Only show the name of the exercise the first time it appears
                                        const showExercise = index === 0 || setConfig.exerciseId !== slotData.setConfigs[index - 1]?.exerciseId;

                                        return <TableRow key={`tableRow-exercise-${index}`}>
                                            <TableCell
                                                sx={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                                {showExercise ? setConfig.exercise?.getTranslation(language).name : '.'}
                                                {showExercise && setConfig.isSpecialType
                                                    && <Chip
                                                        label={setConfig.type}
                                                        color="info"
                                                        size="small"
                                                        sx={{ marginLeft: "0.5em", height: 18 }} />
                                                }
                                            </TableCell>
                                        </TableRow>;
                                    }
                                )}
                            </React.Fragment>
                        )}
                        <TableRow>
                            <TableCell></TableCell>
                        </TableRow>
                    </React.Fragment>
                )}
            </TableBody>
        </Table>
    </TableContainer>;
};

export const DayTable = (props: { dayData: RoutineDayData[], iteration: number, cycleLength: number }) => {
    const [t] = useTranslation();
    const theme = useTheme();

    return <TableContainer component={Paper} sx={{ minWidth: 380 }}>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell colSpan={5}>
                        <Stack direction="row">
                            <Typography variant={'h6'}>
                                {props.cycleLength === 7 ? t('routines.weekNr', { number: props.iteration }) : t('routines.workoutNr', { number: props.iteration })}
                            </Typography>
                        </Stack>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell align={'center'}>{t('routines.sets')}</TableCell>
                    <TableCell align={'center'}>{t('routines.reps')}</TableCell>
                    <TableCell align={'center'}>{t('weight')}</TableCell>
                    <TableCell align={'center'}>{t('routines.restTime')}</TableCell>
                    <TableCell align={'center'}>{t('routines.rir')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.dayData.filter((dayData) => dayData.day !== null).map((dayData, index) =>
                    <React.Fragment key={index}>
                        <TableRow>
                            <TableCell
                                sx={{ backgroundColor: theme.palette.action.hover }}
                                colSpan={5}
                            >
                                &nbsp;
                            </TableCell>
                        </TableRow>
                        {dayData.slots.map((slotData, index) =>
                            <React.Fragment key={index}>
                                {slotData.setConfigs.map((setConfig, indexConfig) =>
                                    <TableRow key={indexConfig}>
                                        <TableCell align={'center'}>
                                            {setConfig.nrOfSets === null ? '-/-' : setConfig.nrOfSets}
                                            {setConfig.maxNrOfSets !== null &&
                                                <> - {setConfig.maxNrOfSets}</>
                                            }
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
                            </React.Fragment>
                        )}
                        <TableRow>
                            <TableCell colSpan={6}></TableCell>
                        </TableRow>
                    </React.Fragment>
                )}
            </TableBody>
        </Table>
    </TableContainer>;
};