import { processTimeSeries } from "@/core/lib/timeSeries";
import { valueWithUnit } from "@/components/Measurements/charts/format";
import { limitsFor, MeasurementCategory } from "@/components/Measurements/models/Category";
import { MeasurementEntry } from "@/components/Measurements/models/Entry";
import { useDeleteMeasurementEntryQuery, useEditMeasurementEntryQuery } from "@/components/Measurements/queries";
import { PAGINATION_OPTIONS } from "@/core/lib/consts";
import { luxonDateTimeToLocale } from "@/core/lib/date";
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
import { DateTime } from "luxon";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

// Values are read through the unit helper, never off the raw column: a
// category can hold entries in mixed units, and the change columns are
// computed from the converted values
const buildRows = (entries: MeasurementEntry[], unit: string, categoryUnit: string): GridRowsProp =>
    processTimeSeries(entries, e => e.valueIn(unit, categoryUnit)).map((row) => ({
        id: row.entry.id,
        date: row.entry.date,
        value: row.entry.valueIn(unit, categoryUnit),
        notes: row.entry.notes,
        isEditable: row.entry.isEditable,
        change: +row.change.toFixed(2),
        totalChange: +row.totalChange.toFixed(2),
        days: +row.days.toFixed(1),
    }));


export const CategoryDetailDataGrid = (props: {
    category: MeasurementCategory,
    /** Rows to show, the category's own entries by default */
    entries?: MeasurementEntry[],
    /**
     * Unit the values are shown and edited in, the category's own by default.
     * Body weight is shown in the profile unit, since its entries can be
     * stored in either; an edited value is then stamped with it.
     */
    displayUnit?: string,
}) => {

    const [t, i18n] = useTranslation();
    const entries = props.entries ?? props.category.entries;
    const unit = props.displayUnit ?? props.category.unit;
    const data: GridRowsProp = buildRows(entries, unit, props.category.unit);
    const updateEntryQuery = useEditMeasurementEntryQuery();
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

    const handleDeleteClick = (id: GridRowId) => async () => {
        deleteEntryQuery.mutate(id.toString());
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
    };


    const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {

        const date = newRow.date instanceof Date ? newRow.date : new Date(newRow.date);
        const entry = entries.find(e => e.id === newRow.id);
        if (entry === undefined) {
            throw new Error(`unknown entry id ${newRow.id}`);
        }

        // The grid shows the value converted into the display unit. Re-saving
        // that conversion would silently overwrite the entry's stored value and
        // unit, so both only change when the value cell was edited
        if (Number(newRow.value) === Number(oldRow.value)) {
            updateEntryQuery.mutate(MeasurementEntry.clone(entry, {
                date: date,
                notes: newRow.notes,
            }));

            return { ...newRow, isNew: false };
        }

        // A value outside the bounds of the metric type is refused by the API,
        // so the row is not saved with one either; throwing keeps it in edit
        // mode so it can be corrected
        const value = Number(newRow.value);
        const { min, max } = limitsFor(props.category.metricType, unit);
        if (isNaN(value) || value < min) {
            throw new Error(t('forms.minValue', { value: `${min} ${unit}` }));
        }
        if (value > max) {
            throw new Error(t('forms.maxValue', { value: `${max} ${unit}` }));
        }

        updateEntryQuery.mutate(MeasurementEntry.clone(entry, {
            date: date,
            value: value,
            notes: newRow.notes,
            // The typed value is in the unit the grid shows, which for body
            // weight is not necessarily the one it was stored in
            ...(props.displayUnit ? { extraData: entry.extraDataInUnit(unit) } : {}),
        }));

        return { ...newRow, isNew: false };
    };

    const onProcessRowUpdateError = (error: unknown) => {
        setEditError(error instanceof Error ? error.message : String(error));
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns: GridColDef[] = [
        {
            field: 'value',
            headerName: t('value'),
            type: 'number',
            // wide enough for a grouped number plus its unit
            width: 120,
            editable: true,
            valueFormatter: (value?: number) => value == null
                ? ''
                : valueWithUnit(value, unit, i18n.language),
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


    return <><Box sx={{ width: '100%' }}>
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
    </Box>
        <Snackbar
            open={editError !== null}
            autoHideDuration={4000}
            onClose={() => setEditError(null)}
            message={editError}
        />
    </>;
};