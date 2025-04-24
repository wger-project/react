import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Card, CardContent, Typography } from '@mui/material';
import Grid from "@mui/material/Grid";
import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridEventListener,
    GridRowEditStopReasons,
    GridRowId,
    GridRowModel,
    GridRowModes,
    GridRowModesModel,
    GridRowsProp
} from "@mui/x-data-grid";
import { FormQueryErrors } from "components/Core/Widgets/FormError";
import { Exercise } from "components/Exercises/models/exercise";
import { RIR_VALUES_SELECT_LIST } from "components/WorkoutRoutines/models/BaseConfig";
import { WorkoutLog } from "components/WorkoutRoutines/models/WorkoutLog";
import { useDeleteRoutineLogQuery, useEditRoutineLogQuery } from "components/WorkoutRoutines/queries";
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
import { PAGINATION_OPTIONS } from "utils/consts";


export const ExerciseLog = (props: { exercise: Exercise, routineId: number, logEntries: WorkoutLog[] | undefined }) => {
    const { t } = useTranslation();
    const logEntries = props.logEntries ?? [];
    const deleteLogQuery = useDeleteRoutineLogQuery(props.routineId);
    const editLogQuery = useEditRoutineLogQuery(props.routineId);

    const initialRows: GridRowsProp = logEntries.map((logEntry: WorkoutLog) => ({
        id: logEntry.id,
        date: logEntry.date,
        repetitions: logEntry.repetitions,
        weight: logEntry.weight,
        rir: logEntry.rir,
        entry: logEntry
    }));


    const [rows, setRows] = React.useState(initialRows);
    const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id: GridRowId) => () => {
        deleteLogQuery.mutate(id as number);
        setRows(rows.filter((row) => row.id !== id));
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow!.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = (newRow: GridRowModel) => {

        const log = newRow.entry;
        if (log !== undefined) {
            log.date = newRow.date;
            log.repetitions = newRow.repetitions;
            log.weight = newRow.weight;
            log.rir = newRow.rir;

            editLogQuery.mutate(log);
        }

        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns: GridColDef[] = [
        {
            field: 'date',
            type: 'dateTime',
            flex: 1,
            editable: true,
            disableColumnMenu: true,
            headerName: t('date'),
            valueFormatter: (value?: Date) => {
                if (value == null) {
                    return '';
                }
                return `${value.toLocaleDateString()}`;
            },
        },
        {
            field: 'repetitions',
            type: 'number',
            disableColumnMenu: true,
            editable: true,
            headerName: t('routines.reps'),
        },
        {
            field: 'weight',
            type: 'number',
            disableColumnMenu: true,
            editable: true,
            headerName: t('weight'),
        },
        {
            field: 'rir',
            type: 'singleSelect',
            disableColumnMenu: true,

            editable: true,
            headerName: t('routines.rir'),
            getOptionValue: (value: any) => value.value,
            getOptionLabel: (value: any) => value.label,
            valueOptions: RIR_VALUES_SELECT_LIST,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            sx={{ color: 'primary.main' }}
                            label={t('save')}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label={t('cancel')}
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label={t('edit')}
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label={t('delete')}
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    const initialState = {
        pagination: {
            paginationModel: {
                pageSize: 5,
            },
        },
    };

    return <>
        <Typography variant={"h6"} sx={{ mt: 4 }}>
            {props.exercise.getTranslation().name}
        </Typography>

        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
                <FormQueryErrors mutationQuery={editLogQuery} />

                <DataGrid
                    initialState={initialState}
                    pageSizeOptions={PAGINATION_OPTIONS.pageSizeOptions}
                    disableRowSelectionOnClick
                    rows={rows}
                    columns={columns}
                    editMode="row"
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={handleRowModesModelChange}
                    onRowEditStop={handleRowEditStop}
                    processRowUpdate={processRowUpdate}
                />

            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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
                    {payload?.[1].payload?.entry.repetitions} × {payload?.[1].value}{payload?.[1].unit}{rir}
                </Typography>

            </CardContent>
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
                                name={key?.toString()}
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