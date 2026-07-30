import { processTimeSeries } from "@/core/lib/timeSeries";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { useDeleteMeasurementsQuery, useEditMeasurementEntryQuery } from "@/components/Measurements/queries";
import { PAGINATION_OPTIONS } from "@/core/lib/consts";
import { luxonDateTimeToLocale } from "@/core/lib/date";
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
import { DateTime } from "luxon";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const convertEntriesToObj = (entries: MeasurementEntry[]): GridRowsProp =>
    processTimeSeries(entries, e => e.value).map((row) => ({
        id: row.entry.id,
        date: row.entry.date,
        value: row.entry.value,
        notes: row.entry.notes,
        isEditable: row.entry.isEditable,
        change: +row.change.toFixed(2),
        totalChange: +row.totalChange.toFixed(2),
        days: +row.days.toFixed(1),
    }));


export const CategoryDetailDataGrid = (props: { category: MeasurementCategory }) => {

    const [t] = useTranslation();
    const data: GridRowsProp = convertEntriesToObj(props.category.entries);
    const updateEntryQuery = useEditMeasurementEntryQuery();
    const deleteEntryQuery = useDeleteMeasurementsQuery();
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

    const handleDeleteClick = (id: GridRowId) => async () => {
        deleteEntryQuery.mutate(id.toString());
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
    };


    const processRowUpdate = async (newRow: GridRowModel) => {

        const date = newRow.date instanceof Date ? newRow.date : new Date(newRow.date);
        const entry = props.category.entries.find(e => e.id === newRow.id);
        if (entry === undefined) {
            throw new Error(`unknown entry id ${newRow.id}`);
        }
        updateEntryQuery.mutate(MeasurementEntry.clone(entry, {
            date: date,
            value: newRow.value,
            notes: newRow.notes,
        }));

        return { ...newRow, isNew: false };
    };

    const onProcessRowUpdateError = (error: unknown) => {
        console.error(error);
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns: GridColDef[] = [
        {
            field: 'value',
            headerName: t('value'),
            width: 80,
            editable: true,
            valueFormatter: (value?: number) => {
                if (value == null) {
                    return '';
                }
                return value + props.category.unit;
            },
        },
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
            field: 'notes',
            headerName: t('notes'),
            type: 'string',
            flex: 1,
            editable: true,
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
                            label="Save"
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            key="cancel"
                            icon={<CancelIcon />}
                            label="Cancel"
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
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        key="delete"
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];


    return <Box sx={{ width: '100%' }}>
        <DataGrid
            editMode="row"
            rows={data}
            columns={columns}
            initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: PAGINATION_OPTIONS.pageSize,
                    },
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
    </Box>;
};