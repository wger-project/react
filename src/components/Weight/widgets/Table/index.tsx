import CancelIcon from "@mui/icons-material/Close";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Tooltip } from "@mui/material";
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
import { WeightEntry } from "@/components/Weight/models/WeightEntry";
import { WeightEntryFab } from "@/components/Weight/widgets/Table/Fab/Fab";
import { useDeleteWeightEntryQuery, useEditWeightEntryQuery } from "@/components/Weight/queries";
import { processTimeSeries } from "@/core/lib/timeSeries";
import { WeightUnit } from "@/core/lib/weightUnit";
import { DateTime } from "luxon";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PAGINATION_OPTIONS } from "@/core/lib/consts";
import { luxonDateTimeToLocale } from "@/core/lib/date";

export interface WeightTableProps {
    weights: WeightEntry[];
    unit: WeightUnit;
}

const buildRows = (weights: WeightEntry[], unit: WeightUnit): GridRowsProp =>
    processTimeSeries(weights, e => e.valueIn(unit)).map((row) => ({
        id: row.entry.id,
        date: row.entry.date,
        weight: row.entry.valueIn(unit),
        isEditable: row.entry.isEditable,
        change: +row.change.toFixed(2),
        totalChange: +row.totalChange.toFixed(2),
        days: +row.days.toFixed(1),
    }));

export const WeightTable = ({ weights, unit }: WeightTableProps) => {
    const [t] = useTranslation();
    const rows = buildRows(weights, unit);
    const editEntryQuery = useEditWeightEntryQuery();
    const deleteEntryQuery = useDeleteWeightEntryQuery();
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

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
            editEntryQuery.mutate(WeightEntry.clone(entry, { date }));
        } else {
            editEntryQuery.mutate(WeightEntry.clone(entry, { date, weight: Number(newRow.weight), unit: unit }));
        }
        return newRow;
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
                />
            </Box>
            <WeightEntryFab />
        </>
    );
};
