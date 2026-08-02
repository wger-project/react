import CancelIcon from "@mui/icons-material/Close";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Snackbar, Tooltip } from "@mui/material";
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
    GridRowsProp,
} from "@mui/x-data-grid";
import {
    limitsFor,
    MeasurementEntry,
    METRIC_TYPE_BODY_WEIGHT,
    useDeleteMeasurementEntryQuery,
    useEditMeasurementEntryQuery
} from "@/components/Measurements";
import { extraDataInUnit } from "@/components/Weight/models/bodyWeight";
import { WeightEntryFab } from "@/components/Weight/widgets/Table/Fab/Fab";
import { processTimeSeries } from "@/core/lib/timeSeries";
import { WeightUnit } from "@/core/lib/weightUnit";
import { DateTime } from "luxon";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PAGINATION_OPTIONS } from "@/core/lib/consts";
import { luxonDateTimeToLocale } from "@/core/lib/date";

export interface WeightTableProps {
    weights: MeasurementEntry[];
    unit: WeightUnit;
    categoryUnit: string;
}

const buildRows = (weights: MeasurementEntry[], unit: WeightUnit, categoryUnit: string): GridRowsProp =>
    processTimeSeries(weights, e => e.valueIn(unit, categoryUnit)).map((row) => ({
        id: row.entry.id,
        date: row.entry.date,
        weight: row.entry.valueIn(unit, categoryUnit),
        isEditable: row.entry.isEditable,
        change: +row.change.toFixed(2),
        totalChange: +row.totalChange.toFixed(2),
        days: +row.days.toFixed(1),
    }));

export const WeightTable = ({ weights, unit, categoryUnit }: WeightTableProps) => {
    const [t] = useTranslation();
    const rows = buildRows(weights, unit, categoryUnit);
    const editEntryQuery = useEditMeasurementEntryQuery();
    const deleteEntryQuery = useDeleteMeasurementEntryQuery();
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [editError, setEditError] = useState<string | null>(null);

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
        deleteEntryQuery.mutate(String(id));
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
    };

    const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
        const date = newRow.date instanceof Date ? newRow.date : new Date(newRow.date);
        const entry = weights.find(w => w.id === newRow.id)!;

        // The grid shows the value converted to the display unit. Re-saving
        // that conversion would silently overwrite the entry's stored value
        // and unit, so both only change when the weight cell was edited: the
        // typed value is then stamped with the display unit the column shows
        if (Number(newRow.weight) === Number(oldRow.weight)) {
            editEntryQuery.mutate(MeasurementEntry.clone(entry, { date: date }));
        } else {
            // the typed value is in the display unit the column header shows;
            // throwing keeps the row in edit mode so it can be corrected
            const weight = Number(newRow.weight);
            const { min, max } = limitsFor(METRIC_TYPE_BODY_WEIGHT, unit);
            if (weight < min) {
                throw new Error(t('forms.minValue', { value: `${min} ${t(`server.${unit}`)}` }));
            }
            if (weight > max) {
                throw new Error(t('forms.maxValue', { value: `${max} ${t(`server.${unit}`)}` }));
            }
            editEntryQuery.mutate(MeasurementEntry.clone(entry, {
                date: date,
                value: weight,
                extraData: extraDataInUnit(entry, unit),
            }));
        }
        return newRow;
    };

    const onProcessRowUpdateError = (error: unknown) => {
        setEditError(error instanceof Error ? error.message : String(error));
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns: GridColDef[] = [
        {
            field: 'date',
            headerName: t('date'),
            type: 'dateTime',
            width: 160,
            editable: true,
            valueFormatter: (value?: Date) => {
                if (value == null) {
                    return '';
                }
                return luxonDateTimeToLocale(DateTime.fromJSDate(value), undefined, DateTime.DATETIME_SHORT);
            },
        },
        {
            field: 'weight',
            headerName: `${t('weight')} (${t(`server.${unit}`)})`,
            type: 'number',
            width: 100,
            editable: true,
        },
        {
            field: 'change',
            headerName: t('difference'),
            type: 'number',
            width: 120,
            editable: false,
        },
        {
            field: 'totalChange',
            headerName: t('totalChange'),
            type: 'number',
            width: 140,
            editable: false,
        },
        {
            field: 'days',
            headerName: t('days'),
            type: 'number',
            width: 100,
            editable: false,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: t('actions'),
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id, row }) => {
                // synced entries are managed by the source app, offer no actions
                if (!row.isEditable) {
                    return [
                        <GridActionsCellItem
                            key="synced"
                            icon={<Tooltip title={t('syncedEntryInfo')}><CloudSyncIcon /></Tooltip>}
                            label={t('syncedEntryInfo')}
                            color="inherit"
                            // a badge, not a button: disabled drops the click
                            // affordance, the style keeps hover events flowing
                            // so the tooltip still works
                            disabled
                            style={{ pointerEvents: 'auto', cursor: 'default' }}
                        />,
                    ];
                }

                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            key="save"
                            icon={<SaveIcon />}
                            label={t('save')}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            key="cancel"
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
                        key="edit"
                        icon={<EditIcon />}
                        label={t('edit')}
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        key="delete"
                        icon={<DeleteIcon />}
                        label={t('delete')}
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    return (
        <>
            <Box sx={{ width: '100%' }}>
                <DataGrid
                    editMode="row"
                    rows={rows}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: PAGINATION_OPTIONS.pageSize },
                        },
                    }}
                    pageSizeOptions={PAGINATION_OPTIONS.pageSizeOptions}
                    disableRowSelectionOnClick
                    isCellEditable={(params) => params.row.isEditable}
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={handleRowModesModelChange}
                    onRowEditStop={handleRowEditStop}
                    processRowUpdate={processRowUpdate}
                    onProcessRowUpdateError={onProcessRowUpdateError}
                />
            </Box>
            <Snackbar
                open={editError !== null}
                autoHideDuration={4000}
                onClose={() => setEditError(null)}
                message={editError}
            />
            <WeightEntryFab />
        </>
    );
};
