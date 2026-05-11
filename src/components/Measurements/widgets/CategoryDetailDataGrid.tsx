import { processTimeSeries } from "@/core/lib/timeSeries";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { useDeleteMeasurementsQuery, useEditMeasurementEntryQuery } from "@/components/Measurements/queries";
import { useBodyWeightQuery } from "@/components/Weight";
import { useProfileQuery } from "@/components/User";
import { PAGINATION_OPTIONS } from "@/core/lib/consts";
import { luxonDateTimeToLocale } from "@/core/lib/date";
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
import { DateTime } from "luxon";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export const CategoryDetailDataGrid = (props: { category: MeasurementCategory }) => {
    const [t] = useTranslation();
    const weightQuery = useBodyWeightQuery('');
    const profileQuery = useProfileQuery();

    let entries = [...props.category.entries];
    if (props.category.is_dynamic) {
        switch (props.category.name) {
            case "BMI": {
                const height = profileQuery.data?.height;
                const weights = weightQuery.data || [];

                if (height && height > 0) {
                    const hMeters = height / 100;
                    entries = weights.map(w => new MeasurementEntry(
                        null,
                        props.category.id,
                        new Date(w.date),
                        +(w.weight / (hMeters ** 2)).toFixed(2),
                        "Auto-generated"
                    ));
                }
                break;
            }
            default:
                break;
        }
    }

    const data: GridRowsProp = processTimeSeries(entries, e => e.value).map((row) => ({
        id: row.entry.id ?? row.entry.date.getTime(),
        date: row.entry.date,
        value: row.entry.value,
        notes: row.entry.notes,
        change: +row.change.toFixed(2),
        totalChange: +row.totalChange.toFixed(2),
        days: +row.days.toFixed(1),
    }));

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
        deleteEntryQuery.mutate(parseInt(id.toString()));
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
    };

    const processRowUpdate = async (newRow: GridRowModel) => {
        updateEntryQuery.mutate({
            id: newRow.id,
            categoryId: newRow.category,
            date: newRow.date,
            value: newRow.value,
            notes: newRow.notes
        });
        return { ...newRow, isNew: false };
    };

    const columns: GridColDef[] = [
        {
            field: 'value',
            headerName: t('value'),
            width: 80,
            editable: !props.category.is_dynamic,
            valueFormatter: (value?: number) => value != null ? value + props.category.unit : '',
        },
        {
            field: 'date',
            headerName: t('date'),
            type: 'date',
            width: 120,
            editable: !props.category.is_dynamic,
            valueFormatter: (value?: Date) => value != null ? luxonDateTimeToLocale(DateTime.fromJSDate(value)) : '',
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
            editable: !props.category.is_dynamic,
        },
    ];

    if (!props.category.is_dynamic) {
        columns.push({
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
                            label="Save"
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }
                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        });
    }

    return (
        <Box sx={{ width: '100%' }}>
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
                rowModesModel={rowModesModel}
                onRowModesModelChange={setRowModesModel}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={(error) => console.error(error)}
            />
        </Box>
    );
};