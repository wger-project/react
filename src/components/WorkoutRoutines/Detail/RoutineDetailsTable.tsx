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
import { makeStyles } from "@mui/styles";
import { WgerContainerFullWidth } from "components/Core/Widgets/Container";
import { RenderLoadingQuery } from "components/Core/Widgets/RenderLoadingQuery";
import { Language } from "components/Exercises/models/language";
import { useLanguageQuery } from "components/Exercises/queries";
import { Day } from "components/WorkoutRoutines/models/Day";
import { Routine } from "components/WorkoutRoutines/models/Routine";
import { SetConfigData } from "components/WorkoutRoutines/models/SetConfigData";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { SlotEntry } from "components/WorkoutRoutines/models/SlotEntry";
import { useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getLanguageByShortName } from "services";
import { makeLink, WgerLink } from "utils/url";


export const RoutineDetailsTable = () => {
    const { t, i18n } = useTranslation();
    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const routineQuery = useRoutineDetailQuery(routineId);
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
                    <RoutineTable routine={routineQuery.data!} showLogs={showLogs} />
                </Stack>
            </WgerContainerFullWidth>
        } />;
};


const useStyles = makeStyles({
    stickyColumn: {
        position: 'sticky',
        left: 0,
        // background: 'white',
        zIndex: 1,
    },

    whiteBg: {
        backgroundColor: 'white',
    }
});

export const RoutineTable = (props: { routine: Routine, showLogs?: boolean }) => {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const classes = useStyles();
    const languageQuery = useLanguageQuery();
    const showLogs = props.showLogs ?? false;

    let language: Language | undefined = undefined;
    if (languageQuery.isSuccess) {
        language = getLanguageByShortName(
            i18n.language,
            languageQuery.data!
        );
    }

    const groupedLogs = props.routine.groupedLogsByIteration;
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

    function getTableRowPlanned(slotEntry: SlotEntry, day: Day, slot: Slot) {

        const sx = { borderBottomWidth: showLogs ? 0 : null };

        return <TableRow>
            <TableCell className={classes.stickyColumn} sx={{
                minWidth: 150,
                backgroundColor: "white",
                borderBottomWidth: showLogs ? 0 : null
            }}>{slotEntry.exercise?.getTranslation(language).name}</TableCell>
            {iterations.map((iteration) => {
                const setConfig = props.routine.getSetConfigData(day.id, iteration, slot.id);

                function formatContent(setConfig: SetConfigData | null, value: number | undefined | null, maxValue: number | undefined | null) {
                    return <>
                        {setConfig === null || value === null ? '-/-' : value}
                        {setConfig !== null && maxValue !== null && <> - {maxValue}</>}
                    </>;
                }

                return <React.Fragment key={iteration}>
                    <TableCell align={'center'} sx={sx}>
                        {formatContent(setConfig, setConfig?.weight, setConfig?.maxWeight)}
                    </TableCell>
                    <TableCell align={'center'} sx={sx}>
                        {formatContent(setConfig, setConfig?.reps, setConfig?.maxReps)}
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

    function getComparisonIcon(plannedValue: number | null | undefined, loggedValue: number | null) {
        if (plannedValue === null || plannedValue === undefined || loggedValue === null) {
            return null;
        }

        if (plannedValue > loggedValue) {
            return <SouthEastIcon fontSize={"small"} color={"error"} />;
        }
        if (plannedValue < loggedValue) {
            return <NorthEastIcon fontSize={"small"} color={"success"} />;
        }
        return <FlagCircleIcon fontSize={"small"} color={"success"} />;

    }

    function getTableRowLogged(slotEntry: SlotEntry, day: Day, slot: Slot) {
        return <TableRow>
            <TableCell sx={{ verticalAlign: "top", backgroundColor: "white" }} className={classes.stickyColumn}>
                <small>{t('nutrition.logged')}</small>
            </TableCell>
            {iterations.map((iteration) => {
                const setConfig = props.routine.getSetConfigData(day.id, iteration, slot.id);
                const logs = groupedLogs[iteration].filter((log) => log.slotEntryId === slotEntry.id);

                return <React.Fragment key={iteration}>
                    <TableCell align={'center'} sx={{ verticalAlign: "top" }}>
                    </TableCell>
                    <TableCell align={'center'} sx={{ verticalAlign: "top" }}>
                        {logs.map((log, index) =>
                            <Stack key={index}>
                                <span>
                                    {log.reps}
                                    {getComparisonIcon(setConfig?.reps, log.reps)}
                                </span>
                            </Stack>
                        )}
                    </TableCell>
                    <TableCell align={'center'} sx={{ verticalAlign: "top" }}>
                        {logs.map((log, index) =>
                            <Stack key={index}>
                                <span>
                                    {log.weight}
                                    {getComparisonIcon(setConfig?.weight, log.weight)}
                                </span>
                            </Stack>
                        )}
                    </TableCell>
                    <TableCell align={'center'} sx={{ verticalAlign: "top" }}>
                    </TableCell>
                    <TableCell align={'center'} sx={{ verticalAlign: "top" }}>
                        {logs.map((log, index) =>
                            <Stack key={index}>
                                <span>
                                    {log.rir ?? '.'}
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
                            <b>{day.getDisplayName()}</b>
                        </TableCell>
                        <TableCell sx={{ backgroundColor: theme.palette.action.hover }} colSpan={5 * iterations.length}>
                        </TableCell>
                    </TableRow>

                    {day.slots.map((slot, slotIndex) => {
                        return <React.Fragment key={slotIndex}>
                            {slot.configs.map((slotEntry, configIndex) => {
                                return <React.Fragment key={configIndex}>
                                    {getTableRowPlanned(slotEntry, day, slot)}
                                    {showLogs && getTableRowLogged(slotEntry, day, slot)}
                                </React.Fragment>;
                            })}
                        </React.Fragment>;
                    })}
                </React.Fragment>;

            })}
        </>;
    }


    return <Container maxWidth={false} sx={{ overflowX: 'scroll', display: 'flex', height: "80vh" }}>
        <TableContainer>
            <Table size="small">
                <TableHead>
                    {getTableRowWeekTitle()}
                    {getTableRowHeader()}
                </TableHead>
                <TableBody>
                    {getTableContent()}
                </TableBody>
            </Table>
        </TableContainer>
    </Container>;
};

