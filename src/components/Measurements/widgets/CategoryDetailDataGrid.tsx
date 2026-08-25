import { processTimeSeries } from "@/core/lib/timeSeries";
import { valueOnly, valueWithUnit } from "@/components/Measurements/charts/format";
import { MeasurementCategory } from "@/components/Measurements/models/Category";
import { limitsSchema } from "@/components/Measurements/widgets/limitsSchema";
import { collectValidationErrors } from "@/core/lib/forms";
import {
    MEASUREMENT_SOURCE_CALCULATED,
    MeasurementEntry
} from "@/components/Measurements/models/Entry";
import { useDeleteMeasurementEntryQuery, useEditMeasurementEntryQuery } from "@/components/Measurements/queries";
import { PAGINATION_OPTIONS } from "@/core/lib/consts";
import { luxonDateTimeToLocale } from "@/core/lib/date";
import CancelIcon from "@mui/icons-material/Close";
import CalculateIcon from "@mui/icons-material/Calculate";
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
    GridPaginationModel,
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
//
// [neighbours] are entries the shown ones are measured against without being
// rows themselves, see the pagination prop. They are always older, so the
// rows stay at the front of the series and the extra ones cut off again
const buildRows = (
    entries: MeasurementEntry[],
    neighbours: MeasurementEntry[],
    unit: string,
    categoryUnit: string,
): GridRowsProp =>
    processTimeSeries([...entries, ...neighbours], e => e.valueIn(unit, categoryUnit))
        .slice(0, entries.length)
        .map((row) => ({
            id: row.entry.id,
            date: row.entry.date,
            value: row.entry.valueIn(unit, categoryUnit),
            notes: row.entry.notes,
            isEditable: row.entry.isEditable,
            source: row.entry.source,
            change: +row.change.toFixed(2),
            totalChange: +row.totalChange.toFixed(2),
            days: +row.days.toFixed(1),
        }));


export const CategoryDetailDataGrid = (props: {
    category: MeasurementCategory,
    /** Rows to show, read by the caller: a category carries no entries itself */
    entries: MeasurementEntry[],
    /**
     * Unit the values are shown and edited in, the category's own by default.
     * Body weight is shown in the profile unit, since its entries can be
     * stored in either; an edited value is then stamped with it.
     */
    displayUnit?: string,
    /**
     * Reading one page at a time, for the histories that are too long to hold:
     * the grid then shows what it was handed and asks the caller for the next
     * page, rather than paging through a list of its own.
     *
     * [neighbours] are the entries outside the page the difference columns are
     * measured against, i.e. the one after the page and the oldest there is.
     * Sorting and filtering are off in this mode: both would only reach the
     * page in hand, which is not what a sorted table means.
     */
    pagination?: {
        rowCount: number,
        model: GridPaginationModel,
        onModelChange: (model: GridPaginationModel) => void,
        neighbours: MeasurementEntry[],
        isLoading: boolean,
    },
}) => {

    const [t, i18n] = useTranslation();
    const entries = props.entries;
    const unit = props.displayUnit ?? props.category.unit;
    const data: GridRowsProp = buildRows(
        entries,
        props.pagination?.neighbours ?? [],
        unit,
        props.category.unit,
    );
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


    const processRowUpdate = async (newRow: GridRowModel, oldRow: GridRowModel) => {

        const date = newRow.date instanceof Date ? newRow.date : new Date(newRow.date);
        const entry = entries.find(e => e.id === newRow.id);
        if (entry === undefined) {
            throw new Error(`unknown entry id ${newRow.id}`);
        }

        // The grid shows the value converted into the display unit. Re-saving
        // that conversion would silently overwrite the entry's stored value and
        // unit, so both only change when the value cell was edited
        if (Number(newRow.value) === Number(oldRow.value)) {
            await updateEntryQuery.mutateAsync(MeasurementEntry.clone(entry, {
                date: date,
                notes: newRow.notes,
            }));

            return { ...newRow, isNew: false };
        }

        // A value outside the bounds of the metric type is refused by the API,
        // so the row is not saved with one either; throwing keeps it in edit
        // mode so it can be corrected
        const value = Number(newRow.value);
        limitsSchema(props.category.metricType, unit, t).validateSync(value);

        await updateEntryQuery.mutateAsync(MeasurementEntry.clone(entry, {
            date: date,
            value: value,
            notes: newRow.notes,
            // The typed value is in the unit the grid shows, which for body
            // weight is not necessarily the one it was stored in
            ...(props.displayUnit ? { extraData: entry.extraDataInUnit(unit) } : {}),
        }));

        return { ...newRow, isNew: false };
    };

    // Both the checks above and a write the server refused end up here, and the
    // grid puts the row back to what it was
    const onProcessRowUpdateError = (error: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = (error as any)?.response?.data;
        const validationErrors = collectValidationErrors(response);
        if (validationErrors.length > 0) {
            setEditError(validationErrors.join(', '));
            return;
        }
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
            // a duration delta reads h:mm like the value it changes
            valueFormatter: (value?: number) => value == null
                ? ''
                : valueOnly(value, unit, i18n.language),
        },
        {
            field: 'totalChange',
            headerName: t('totalChange'),
            type: 'number',
            width: 140,
            editable: false,
            valueFormatter: (value?: number) => value == null
                ? ''
                : valueOnly(value, unit, i18n.language),
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
                // Entries the user did not write offer no actions. Who keeps
                // them differs: an import is changed in the app it came from,
                // a calculated value is the server's and changes with what it
                // is computed from
                if (!row.isEditable) {
                    const isCalculated = row.source === MEASUREMENT_SOURCE_CALCULATED;
                    const info = isCalculated
                        ? t('measurements.calculations.entryInfo')
                        : t('syncedEntryInfo');
                    return [
                        <GridActionsCellItem
                            key="synced"
                            icon={<Tooltip title={info}>
                                {isCalculated ? <CalculateIcon /> : <CloudSyncIcon />}
                            </Tooltip>}
                            label={info}
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
            columns={props.pagination === undefined
                ? columns
                : columns.map(column => ({ ...column, sortable: false, filterable: false }))}
            initialState={props.pagination === undefined
                ? { pagination: { paginationModel: { pageSize: PAGINATION_OPTIONS.pageSize } } }
                : undefined}
            paginationMode={props.pagination === undefined ? 'client' : 'server'}
            rowCount={props.pagination?.rowCount}
            paginationModel={props.pagination?.model}
            onPaginationModelChange={props.pagination?.onModelChange}
            loading={props.pagination?.isLoading}
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