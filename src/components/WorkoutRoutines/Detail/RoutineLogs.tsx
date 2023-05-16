import React from "react";
import { useParams } from "react-router-dom";
import {
    Box,
    Button,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { useRoutineLogQuery } from "components/WorkoutRoutines/queries";
import { useTranslation } from "react-i18next";
import { makeLink, WgerLink } from "utils/url";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
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
import { DateTime } from "luxon";
import { LIST_OF_COLORS3, REP_UNIT_REPETITIONS, WEIGHT_UNIT_KG, WEIGHT_UNIT_LB } from "utils/consts";
import { NameType, ValueType, } from 'recharts/src/component/DefaultTooltipContent';

type GroupedLogEntries = Map<number, WorkoutLog[]>;

export const RoutineLogs = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const [t, i18n] = useTranslation();
    const logsQuery = useRoutineLogQuery(routineId, true);

    // Group by baseId
    let result: GroupedLogEntries = new Map();
    if (logsQuery.isSuccess) {
        result = logsQuery.data!.reduce(function (r, a) {
            r.set(a.baseId, r.get(a.baseId) || []);
            r.get(a.baseId)!.push(a);
            return r;
        }, new Map());
    }


    // TODO: remove this when we add the logic in react
    // TODO: correctly pass the day ID
    const navigateAddDay = () => window.location.href = makeLink(
        WgerLink.ROUTINE_ADD_LOG,
        i18n.language,
        { id: 1 }
    );

    return (
        <>
            <Container maxWidth="lg">
                <Typography variant={"h4"}>
                    {t("routines.logsHeader")}
                </Typography>
                <p>
                    Notes
                    This page shows the weight logs belonging to this workout only. Click on an exercise to see all the
                    historical data for it.
                </p>
                <p>

                    If on a single day there is more than one entry with the same number of repetitions, but different
                    weights, only the entry with the higher weight is shown in the diagram.
                </p>
                <p>

                    Note that only entries with a weight unit (kg or lb) and repetitions are charted, other combinations
                    such as time or until failure are ignored here.
                </p>
                {
                    logsQuery.isLoading
                        ? <LoadingPlaceholder />
                        : <>

                            {Array.from(result).map(([key, logEntries]) => {

                                // Filter logs that have weight units other than kg or lb and
                                logEntries = logEntries.filter((log) => [WEIGHT_UNIT_KG, WEIGHT_UNIT_LB].includes(log.weightUnit));
                                logEntries = logEntries.filter((log) => log.repetitionUnit === REP_UNIT_REPETITIONS);

                                return <div key={key}>
                                    <Typography variant={"h5"}>
                                        {key}
                                    </Typography>
                                    <TableContainer sx={{ my: 3 }}>
                                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Reps</TableCell>
                                                    <TableCell>Weight</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {logEntries.map((log) => (
                                                    <TableRow key={log.id}>
                                                        <TableCell component="th" scope="row">
                                                            {DateTime.fromJSDate(log.date).toLocaleString(DateTime.DATE_MED)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {log.reps}
                                                        </TableCell>
                                                        <TableCell>
                                                            {log.weight}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    <TimeSeriesChart data={logEntries} key={key} />
                                </div>;
                            })}

                            <Box textAlign='center' sx={{ mt: 4 }}>
                                <Button variant="outlined" onClick={navigateAddDay}>
                                    {t('routines.addLogToDay')}
                                </Button>
                            </Box>
                        </>
                }
            </Container>
        </>
    );
};

export const formatData = (data: WorkoutLog[]) =>
    data.map((entry) => {
        return {
            id: entry.id,
            value: entry.weight,
            time: entry.date.getTime(),
            entry: entry,
        };
    });


export const CustomTooltip = ({ active, payload, label, }: TooltipProps<ValueType, NameType>) => {
    if (active) {
        console.table(payload);
        return (
            <div style={{ backgroundColor: "white" }}>
                <p>{payload?.[1].value}{payload?.[1].unit}</p>
                <p>Date: {DateTime.fromMillis(payload?.[0].value as number).toLocaleString(DateTime.DATE_MED)}</p>
            </div>
        );
    }
    return null;
};


export const TimeSeriesChart = (props: { data: WorkoutLog[] }) => {


    // Group by rep count
    let result: GroupedLogEntries;
    result = props.data.reduce(function (r, a) {

        r.set(a.reps, r.get(a.reps) || []);
        r.get(a.reps)!.push(a);
        return r;
    }, new Map());


    // JSX
    return (
        <Box>
            <ResponsiveContainer width="100%" height={250}>
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

                            const color = LIST_OF_COLORS3[key % LIST_OF_COLORS3.length];
                            const formattedData = formatData(value);
                            formattedData.sort((a, b) => b.time - a.time);

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

                    {/*<Tooltip cursor={{ strokeDasharray: '3 3' }} />*/}
                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Legend />
                </ScatterChart>
            </ResponsiveContainer>

        </Box>
    );
};
