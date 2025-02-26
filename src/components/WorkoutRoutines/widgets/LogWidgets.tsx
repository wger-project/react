import { Delete, Edit } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    Box,
    Card,
    CardContent,
    IconButton,
    Menu,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Exercise } from "components/Exercises/models/exercise";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { DateTime } from "luxon";
import React from "react";
import { useTranslation } from "react-i18next";
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
            {props.log.repetitions}
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
export const ExerciseLog = (props: { exercise: Exercise, logEntries: WorkoutLog[] | undefined }) => {
    const { t } = useTranslation();
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
            {props.exercise.getTranslation().name}
        </Typography>

        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 5 }}>
                <TableContainer>
                    <Table aria-label="simple table" size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('date')}</TableCell>
                                <TableCell>{t('routines.reps')}</TableCell>
                                <TableCell>{t('weight')}</TableCell>
                                <TableCell>{t('routines.rir')}</TableCell>
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
            <Grid size={{ xs: 12, md: 7 }}>
                <TimeSeriesChart data={logEntries} key={props.exercise.id} />
            </Grid>
        </Grid>
    </>;
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
        r.set(a.repetitions, r.get(a.repetitions) || []);
        r.get(a.repetitions)!.push(a);
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