import { Delete, Edit } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { Exercise } from "components/Exercises/models/exercise";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { useRoutineDetailQuery, useRoutineLogQuery } from "components/WorkoutRoutines/queries";
import { DateTime } from "luxon";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    TooltipProps,
    XAxis,
    YAxis
} from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { generateChartColors } from "utils/colors";
import { REP_UNIT_REPETITIONS, WEIGHT_UNIT_KG, WEIGHT_UNIT_LB } from "utils/consts";
import { makeLink, WgerLink } from "utils/url";


const LogTableRow = (props: { log: WorkoutLog }) => {
    const [t, i18n] = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const navigateEditLog = () => window.location.href = makeLink(
        WgerLink.ROUTINE_EDIT_LOG,
        i18n.language,
        { id: props.log.id }
    );
    const navigateDeleteLog = () => window.location.href = makeLink(
        WgerLink.ROUTINE_DELETE_LOG,
        i18n.language,
        { id: props.log.id }
    );


    return <TableRow key={props.log.id}>
        <TableCell component="th" scope="row">
            {DateTime.fromJSDate(props.log.date).toLocaleString(DateTime.DATE_MED)}
        </TableCell>
        <TableCell>
            {props.log.reps}
        </TableCell>
        <TableCell>
            {props.log.weight}{props.log.weightUnitObj?.name}
        </TableCell>
        <TableCell>
            {props.log.rirString}
        </TableCell>
        <TableCell>
            <IconButton aria-label="settings" onClick={handleClick}>
                <MoreVertIcon fontSize={"small"} />
            </IconButton>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{ 'aria-labelledby': 'basic-button' }}
            >
                <MenuItem onClick={navigateEditLog}>
                    <Edit />
                    {t('edit')}
                </MenuItem>
                <MenuItem onClick={navigateDeleteLog}>
                    <Delete />
                    {t('delete')}
                </MenuItem>
            </Menu>

        </TableCell>
    </TableRow>;
};

const ExerciseLog = (props: { exerciseId: Exercise, logEntries: WorkoutLog[] | undefined }) => {

    let logEntries = props.logEntries ?? [];

    const availableResultsPerPage = [5, 10, 20];
    const [rowsPerPage, setRowsPerPage] = React.useState(availableResultsPerPage[0]);
    const [page, setPage] = React.useState(0);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    return <>
        <Typography variant={"h6"} sx={{ mt: 4 }}>
            {props.exerciseId.getTranslation().name}
        </Typography>

        <Grid container spacing={2}>
            <Grid
                size={{
                    xs: 12,
                    md: 5
                }}>
                <TableContainer>
                    <Table aria-label="simple table" size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Reps</TableCell>
                                <TableCell>Weight</TableCell>
                                <TableCell>RiR</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logEntries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log) =>
                                <LogTableRow log={log} key={log.id} />
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={availableResultsPerPage}
                        component="div"
                        count={logEntries.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>

            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 7
                }}>
                <TimeSeriesChart data={logEntries} key={props.exerciseId.id} />
            </Grid>
        </Grid>
    </>;
};

export const RoutineLogs = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const [t, i18n] = useTranslation();
    const logsQuery = useRoutineLogQuery(routineId, false);
    const routineQuery = useRoutineDetailQuery(routineId);

    const navigateAddLogToDay = (id: number) => window.location.href = makeLink(
        WgerLink.ROUTINE_ADD_LOG,
        i18n.language,
        { id: id }
    );

    // Group by base
    let groupedWorkoutLogs: Map<number, WorkoutLog[]> = new Map();
    if (logsQuery.isSuccess) {
        groupedWorkoutLogs = logsQuery.data!.reduce(function (r, log) {
            r.set(log.exerciseId, r.get(log.exerciseId) || []);

            // Only add logs with weight unit and repetition unit
            // This should be done server side over the API, but we can't filter everything yet
            if ([WEIGHT_UNIT_KG, WEIGHT_UNIT_LB].includes(log.weightUnit) && log.repetitionUnit === REP_UNIT_REPETITIONS) {
                r.get(log.exerciseId)!.push(log);
            }

            return r;
        }, new Map());
    }

    return (
        <>
            <Container maxWidth="lg">
                <Typography variant={"h4"}>
                    {t("routines.logsHeader")}
                </Typography>
                {/*<Typography variant={"body2"}>*/}
                {/*    This page shows the training logs belonging to this workout only.*/}
                {/*</Typography>*/}
                {/*<Typography variant={"body2"}>*/}
                {/*    If on a single day there is more than one entry with the same number of repetitions, but different*/}
                {/*    weights, only the entry with the higher weight is shown in the diagram.*/}
                {/*</Typography>*/}
                <Typography variant={"body1"}>
                    {t('routines.logsFilterNote')}
                </Typography>
                {logsQuery.isSuccess && routineQuery.isSuccess
                    ? <>
                        {routineQuery.data!.days.map((day) => <div key={day.id}>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{ mt: 4 }}
                                >
                                    <Typography variant={"h4"}>
                                        {day.description}
                                    </Typography>
                                    <Button variant="contained" onClick={() => navigateAddLogToDay(day.id)}>
                                        {t('routines.addLogToDay')}
                                    </Button>
                                </Stack>

                                {day.sets.map(workoutSet =>
                                    workoutSet.exercises.map(base =>
                                        <ExerciseLog
                                            key={workoutSet.id + base.uuid!}
                                            exerciseId={base}
                                            logEntries={groupedWorkoutLogs.get(base.id!)!}
                                        />)
                                )}
                            </div>
                        )}
                    </>
                    : <LoadingPlaceholder />
                }
            </Container>
        </>
    );
};

/*
 * Format the log entries so that they can be passed to the chart
 *
 * This is mostly due to the time, which needs to be a number to be shown
 * in the scatter plot
 */
const formatData = (data: WorkoutLog[]) =>
    data.map((log) => {
        return {
            id: log.id,
            value: log.weight,
            time: log.date.getTime(),
            entry: log,
        };
    });


const ExerciseLogTooltip = ({ active, payload, label, }: TooltipProps<ValueType, NameType>) => {
    if (active) {

        // TODO: translate rir
        let rir = '';
        if (payload?.[1].payload?.entry.rir) {
            rir = `, ${payload?.[1].payload?.entry.rir} RiR`;
        }

        return <Card>
            <CardContent>
                <Typography variant="body1">
                    {DateTime.fromMillis(payload?.[0].value as number).toLocaleString(DateTime.DATE_MED)}
                </Typography>

                <Typography variant="body2">
                    {payload?.[1].payload?.entry.reps} × {payload?.[1].value}{payload?.[1].unit}{rir}
                </Typography>

            </CardContent>
            {/*<CardActions>*/}
            {/*    <Button size="small">Edit</Button>*/}
            {/*    <Button size="small">Delete</Button>*/}
            {/*</CardActions>*/}
        </Card>;
    }
    return null;
};


export const TimeSeriesChart = (props: { data: WorkoutLog[] }) => {

    // Group by rep count
    //
    // We draw series based on the same reps, as otherwise the chart wouldn't
    // make much sense
    let result: Map<number, WorkoutLog[]>;
    result = props.data.reduce(function (r, a) {
        r.set(a.reps, r.get(a.reps) || []);
        r.get(a.reps)!.push(a);
        return r;
    }, new Map());

    const colorGenerator = generateChartColors(result.size);

    return (
        <Box>
            <ResponsiveContainer width={"100%"} height={250}>
                <ScatterChart>
                    <XAxis
                        dataKey="time"
                        domain={["auto", "auto"]}
                        name="Time"
                        tickFormatter={unixTime => DateTime.fromMillis(unixTime).toLocaleString(DateTime.DATE_MED)}
                        type="number"
                    />
                    <YAxis
                        domain={["auto", "auto"]}
                        dataKey="value"
                        name="Value"
                        unit="kg"
                    />

                    {Array.from(result).map(([key, value]) => {
                            const color = colorGenerator.next().value!;
                            const formattedData = formatData(value);

                            return <Scatter
                                key={key}
                                data={formattedData}
                                fill={color}
                                line={{ stroke: color }}
                                lineType="joint"
                                lineJointType="monotoneX"
                                name={key.toString()}
                            />;
                        }
                    )}

                    <Tooltip content={<ExerciseLogTooltip />} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Legend />
                </ScatterChart>
            </ResponsiveContainer>
        </Box>
    );
};
