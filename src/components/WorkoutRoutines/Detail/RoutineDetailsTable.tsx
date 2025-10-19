import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import NorthEastIcon from "@mui/icons-material/NorthEast";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import {
    Container,
    FormControlLabel,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { WgerContainerFullWidth } from "components/Core/Widgets/Container";
import { RenderLoadingQuery } from "components/Core/Widgets/RenderLoadingQuery";
import { Language } from "components/Exercises/models/language";
import { useLanguageQuery } from "components/Exercises/queries";
import { Day } from "components/WorkoutRoutines/models/Day";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { RoutineLogData } from "components/WorkoutRoutines/models/RoutineLogData";
import { SetConfigData } from "components/WorkoutRoutines/models/SetConfigData";
import { SlotEntry } from "components/WorkoutRoutines/models/SlotEntry";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { useRoutineDetailQuery, useRoutineLogData } from "components/WorkoutRoutines/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getLanguageByShortName } from "services";
import { makeLink, WgerLink } from "utils/url";


const PREFIX = 'RoutineDetailsTable';

const classes = {
    stickyColumn: `${PREFIX}-stickyColumn`,
    stickyHeader: `${PREFIX}-stickyHeader`,
    whiteBg: `${PREFIX}-whiteBg`
};

const StyledContainer = styled(Container)({
    [`& .${classes.stickyColumn}`]: {
        position: 'sticky',
        left: 0,
        // background: 'white',
        zIndex: 1,
    },
    [`& .${classes.stickyHeader}`]: {
        position: 'sticky',
        top: 0,
        zIndex: 2,
        background: 'white',
    },

    [`& .${classes.whiteBg}`]: {
        backgroundColor: 'white',
    }
});


export const RoutineDetailsTable = () => {
    const { t, i18n } = useTranslation();
    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const routineQuery = useRoutineDetailQuery(routineId);
    const routineLogDataQuery = useRoutineLogData(routineId);
    const [showLogs, setShowLogs] = React.useState(false);

    return <RenderLoadingQuery
        query={routineQuery}
        child={routineQuery.isSuccess
            && <WgerContainerFullWidth
                title={routineQuery.data!.name}
                backToUrl={makeLink(WgerLink.ROUTINE_DETAIL, i18n.language, { id: routineId })}
                maxWidth={false}
            >
                <Stack>
                    <FormControlLabel
                        control={<Switch checked={showLogs}
                                         onChange={(event, checked) => setShowLogs(checked)} />}
                        label={t('routines.alsoShowLogs')} />
                    <RoutineTable
                        routine={routineQuery.data!}
                        showLogs={showLogs}
                        logData={routineLogDataQuery.data!}
                    />
                </Stack>
            </WgerContainerFullWidth>
        } />;
};


export function compareValue(value: number | null | undefined, from: number | null | undefined, to: number | null | undefined): 'lower' | 'higher' | 'match' | null {
    if (value === null || value === undefined) {
        return null;
    }

    if (from !== null && from !== undefined && to !== null && to !== undefined) {
        if (value < from) {
            return 'lower';
        } else if (value > to) {
            return 'higher';
        } else {
            return 'match';
        }
    } else if (from !== null && from !== undefined) {
        if (value < from) {
            return 'lower';
        } else if (value > from) {
            return 'higher';
        } else {
            return 'match';
        }
    }

    return null;
}

export const RoutineTable = (props: {
    routine: Routine,
    showLogs?: boolean,
    logData?: RoutineLogData[]
}) => {
    const { t, i18n } = useTranslation();
    const theme = useTheme();

    const languageQuery = useLanguageQuery();
    const showLogs = props.showLogs ?? false;
    const routineLogData = props.logData ?? [];

    let language: Language | undefined = undefined;
    if (languageQuery.isSuccess) {
        language = getLanguageByShortName(
            i18n.language,
            languageQuery.data!
        );
    }

    const groupedLogs: { [key: number]: WorkoutLog[] } = {};
    for (const logData of routineLogData) {
        for (const log of logData.logs) {
            if (log.iteration === null) {
                continue;
            }

            if (!groupedLogs[log.iteration]) {
                groupedLogs[log.iteration] = [];
            }
            groupedLogs[log.iteration].push(log);
        }
    }

    const iterations = Object.keys(props.routine.groupedDayDataByIteration).map((iteration) => parseInt(iteration));

    function getTableRowHeader() {
        return <TableRow>
            {iterations.map((iteration) => {

                const out = iteration === 1
                    ? <TableCell className={classes.stickyColumn}></TableCell>
                    : null;

                return <React.Fragment key={`header-${iteration}`}>
                    {out}
                    <TableCell align={'center'}>{t('routines.sets')}</TableCell>
                    <TableCell align={'center'} sx={{ minWidth: 40 }}>{t('routines.reps')}</TableCell>
                    <TableCell align={'center'} sx={{ minWidth: 40 }}>{t('weight')}</TableCell>
                    <TableCell align={'center'} sx={{ minWidth: 60 }}>{t('routines.restTime')}</TableCell>
                    <TableCell align={'center'} sx={{ minWidth: 40 }}>{t('routines.rir')}</TableCell>
                </React.Fragment>;
            })}
        </TableRow>;
    }

    function getTableRowWeekTitle() {
        return <TableRow>
            {iterations.map((iteration) => {
                const placeholder = iteration === 1
                    ? <TableCell className={classes.stickyColumn}></TableCell>
                    : null;

                return <React.Fragment key={`header-iteration-${iteration}`}>
                    {placeholder}
                    <TableCell colSpan={5}>
                        <Typography variant={'h6'}>
                            {t('routines.weekNr', { number: iteration })}
                        </Typography>
                    </TableCell>
                </React.Fragment>;
            })}
        </TableRow>;
    }

    function getTableRowPlanned(slotEntry: SlotEntry, day: Day) {
        const sx = { borderBottomWidth: showLogs ? 0 : null, minWidth: 40 };

        function formatContent(setConfig: SetConfigData | null, value: number | undefined | null, maxValue: number | undefined | null) {
            return <>
                {setConfig === null || value === null ? '-/-' : value}
                {setConfig !== null && maxValue !== null && <> - {maxValue}</>}
            </>;
        }

        return <TableRow>
            <TableCell className={classes.stickyColumn} sx={{
                minWidth: 150,
                backgroundColor: "white",
                borderBottomWidth: showLogs ? 0 : null
            }}>{slotEntry.exercise?.getTranslation(language).name}</TableCell>
            {iterations.map((iteration) => {
                const setConfig = props.routine.getSetConfigData(day.id!, iteration, slotEntry.id!);

                return <React.Fragment key={iteration}>
                    <TableCell align={'center'} sx={sx}>
                        {formatContent(setConfig, setConfig?.nrOfSets, setConfig?.maxNrOfSets)}
                    </TableCell>
                    <TableCell align={'center'} sx={sx}>
                        {formatContent(setConfig, setConfig?.repetitions, setConfig?.maxRepetitions)}
                    </TableCell>
                    <TableCell align={'center'} sx={sx}>
                        {formatContent(setConfig, setConfig?.weight, setConfig?.maxWeight)}
                    </TableCell>
                    <TableCell align={'center'} sx={sx}>
                        {formatContent(setConfig, setConfig?.restTime, setConfig?.maxRestTime)}
                    </TableCell>
                    <TableCell align={'center'} sx={sx}>
                        {formatContent(setConfig, setConfig?.rir, setConfig?.maxRir)}
                    </TableCell>
                </React.Fragment>;
            })}
        </TableRow>;
    }

    function getComparisonIcon(loggedValue: number | null, plannedValue: number | null | undefined, maxPlannedValue: number | null | undefined, higherIsBetter?: boolean) {

        const comparison = compareValue(loggedValue, plannedValue, maxPlannedValue);
        if (loggedValue === 105) {
            console.log(loggedValue, plannedValue, maxPlannedValue, higherIsBetter, comparison);
        }

        const fontSize = 17;

        // Switch the comparison color since e.g. for RiR lower is better
        higherIsBetter = higherIsBetter ?? true;

        if (comparison === null) {
            return null;
        }


        if (comparison === 'lower') {
            return <SouthEastIcon sx={{ fontSize: fontSize }} color={higherIsBetter ? "error" : "success"} />;
        }
        if (comparison === 'higher') {
            return <NorthEastIcon sx={{ fontSize: fontSize }} color={higherIsBetter ? "success" : "error"} />;
        }
        return <FlagCircleIcon sx={{ fontSize: fontSize }} color={"success"} />;

    }

    function getTableRowLogged(slotEntry: SlotEntry, day: Day) {
        return <TableRow>
            <TableCell sx={{ verticalAlign: "top", backgroundColor: "white" }} className={classes.stickyColumn}>
                <small>{t('nutrition.logged')}</small>
            </TableCell>
            {iterations.map((iteration) => {
                const setConfig = props.routine.getSetConfigData(day.id!, iteration, slotEntry.id!);
                const iterationLogs = groupedLogs[iteration] ?? [];

                const logs = iterationLogs.filter((log) => log.slotEntryId === slotEntry.id);

                return <React.Fragment key={iteration}>
                    <TableCell align={'center'} sx={{ verticalAlign: "top" }}>
                    </TableCell>
                    <TableCell align={'center'} sx={{ verticalAlign: "top" }}>
                        {logs.map((log, index) =>
                            <Stack key={index}>
                                <span>
                                    {log.repetitions ?? '-/-'}
                                    {getComparisonIcon(log.repetitions, setConfig?.repetitions, setConfig?.maxRepetitions)}
                                </span>
                            </Stack>
                        )}
                    </TableCell>
                    <TableCell align={'center'} sx={{ verticalAlign: "top" }}>
                        {logs.map((log, index) =>
                            <Stack key={index}>
                                <span>
                                    {log.weight ?? '-/-'}
                                    {getComparisonIcon(log.weight, setConfig?.weight, setConfig?.maxWeight)}
                                </span>
                            </Stack>
                        )}
                    </TableCell>
                    <TableCell align={'center'} sx={{ verticalAlign: "top" }}>
                        {logs.map((log, index) =>
                            <Stack key={index}>
                                <span>
                                    {log.restTime ?? '-/-'}
                                    {getComparisonIcon(log.restTime, setConfig?.restTime, setConfig?.maxRestTime)}
                                </span>
                            </Stack>
                        )}
                    </TableCell>
                    <TableCell align={'center'} sx={{ verticalAlign: "top" }}>
                        {logs.map((log, index) =>
                            <Stack key={index}>
                                <span>
                                    {log.rir ?? '-/-'}
                                    {getComparisonIcon(log.rir, setConfig?.rir, setConfig?.maxRir, false)}
                                </span>
                            </Stack>
                        )}
                    </TableCell>
                </React.Fragment>;
            })}
        </TableRow>;
    }

    function getTableContent() {
        return <>
            {props.routine.days.map((day) => {
                return <React.Fragment key={day.id}>
                    <TableRow>
                        <TableCell
                            sx={{ backgroundColor: theme.palette.action.hover }}
                            className={classes.stickyColumn}
                        >
                            <b>{day.displayName}</b>
                        </TableCell>
                        <TableCell sx={{ backgroundColor: theme.palette.action.hover }} colSpan={5 * iterations.length}>
                        </TableCell>
                    </TableRow>

                    {day.slots.map((slot, slotIndex) => {
                        return <React.Fragment key={slotIndex}>
                            {slot.entries.map((slotEntry, configIndex) => {
                                return <React.Fragment key={configIndex}>
                                    {getTableRowPlanned(slotEntry, day)}
                                    {showLogs && getTableRowLogged(slotEntry, day)}
                                </React.Fragment>;
                            })}
                        </React.Fragment>;
                    })}
                </React.Fragment>;
            })}
        </>;
    }


    return (
        <StyledContainer maxWidth={false} sx={{ overflowX: 'scroll', display: 'flex', height: "80vh" }}>
            <TableContainer>
                <Table size="small">
                    <TableHead className={classes.stickyHeader}>
                        {getTableRowWeekTitle()}
                        {getTableRowHeader()}
                    </TableHead>
                    <TableBody>
                        {getTableContent()}
                    </TableBody>
                </Table>
            </TableContainer>
        </StyledContainer>
    );
};

