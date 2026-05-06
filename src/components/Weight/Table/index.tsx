import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Box } from "@mui/material";
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
import { WeightEntry } from "@/components/Weight/model";
import { WeightEntryFab } from "@/components/Weight/Table/Fab/Fab";
import { useDeleteWeightEntryQuery, useEditWeightEntryQuery } from "@/components/Weight/queries";
import { processTimeSeries } from "@/core/lib/timeSeries";
import { DateTime } from "luxon";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PAGINATION_OPTIONS } from "@/core/lib/consts";
import { luxonDateTimeToLocale } from "@/core/lib/date";

export interface WeightTableProps {
    weights: WeightEntry[];
}

const buildRows = (weights: WeightEntry[]): GridRowsProp =>
    processTimeSeries(weights, e => e.weight).map((row) => ({
        id: row.entry.id,
        date: row.entry.date,
        weight: row.entry.weight,
        change: +row.change.toFixed(2),
        totalChange: +row.totalChange.toFixed(2),
        days: +row.days.toFixed(1),
    }));

export const WeightTable = ({ weights }: WeightTableProps) => {
    const [t] = useTranslation();
    const rows = buildRows(weights);
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
        deleteEntryQuery.mutate(Number(id));
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
    };

    const processRowUpdate = (newRow: GridRowModel) => {
        const date = newRow.date instanceof Date ? newRow.date : new Date(newRow.date);
        editEntryQuery.mutate(new WeightEntry(date, Number(newRow.weight), Number(newRow.id)));
        return newRow;
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns: GridColDef[] = [
        {
            field: 'date',
            headerName: t('date'),
            type: 'date',
            width: 140,
            editable: true,
            valueFormatter: (value?: Date) => {
                if (value == null) {
                    return '';
                }
                return luxonDateTimeToLocale(DateTime.fromJSDate(value));
            },
        },
        {
            field: 'weight',
            headerName: t('weight'),
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
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
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
