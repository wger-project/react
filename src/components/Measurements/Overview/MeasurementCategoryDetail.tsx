import React from "react";
import { Box, Stack, } from "@mui/material";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import {
    useDeleteMeasurementsQuery,
    useEditMeasurementsQuery,
    useMeasurementsQuery
} from "components/Measurements/queries";
import { MeasurementCategory } from "components/Measurements/models/Category";
import { MeasurementChart } from "components/Measurements/charts/MeasurementChart";
import { useParams } from "react-router-dom";
import { AddMeasurementEntryFab } from "components/Measurements/widgets/fab";
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
    GridValueFormatterParams
} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { PAGINATION_OPTIONS } from "utils/consts";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import { MeasurementEntry } from "components/Measurements/models/Entry";
import { DateTime } from "luxon";
import { useTranslation } from "react-i18next";

const convertEntriesToObj = (entries: MeasurementEntry[]): GridRowsProp => {
    return entries.map((entry) => {
        return {
            id: entry.id,
            category: entry.category,
            date: entry.date,
            value: entry.value,
            notes: entry.notes
        };
    });
};

const CategoryDetailDataTable = (props: { category: MeasurementCategory }) => {

    const [t] = useTranslation();
    const data: GridRowsProp = convertEntriesToObj(props.category.entries);
    const updateEntryQuery = useEditMeasurementsQuery();
    const deleteEntryQuery = useDeleteMeasurementsQuery();
    const [rows, setRows] = React.useState(data);
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

    const handleDeleteClick = (id: GridRowId) => async () => {
        console.log('deleting entry', id);
        deleteEntryQuery.mutate(parseInt(id.toString()));
        setRows(rows.filter((row) => row.id !== id));
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        //if (editedRow!.isNew) {
        if (editedRow?.id === null) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };


    const processRowUpdate = async (newRow: GridRowModel) => {

        updateEntryQuery.mutate({
            id: newRow.id,
            categoryId: newRow.category,
            date: newRow.date,
            value: newRow.value,
            notes: newRow.notes
        });

        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const onProcessRowUpdateError = (error: any) => {

        console.log(error);
        //setRows(rows.map((row) => (row.id === newRow.id ? newRow : row)));

    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    // @ts-ignore
    const columns: GridColDef[] = [
        {
            field: 'value',
            headerName: t('value'),
            width: 80,
            editable: true,
            valueFormatter: (params: GridValueFormatterParams<number>) => {
                if (params.value == null) {
                    return '';
                }
                return params.value + props.category.unit;
            },
        },
        {
            field: 'date',
            headerName: t('date'),
            type: 'date',
            width: 120,
            editable: true,
            valueFormatter: (params: GridValueFormatterParams<Date>) => {
                if (params.value == null) {
                    return '';
                }
                return DateTime.fromJSDate(params.value).toLocaleString(DateTime.DATE_MED);
            },
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
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: 'primary.main',
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
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
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
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
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={onProcessRowUpdateError}
            slotProps={{
                toolbar: { setRows, setRowModesModel },
            }}
        />
    </Box>;
};
export const MeasurementCategoryDetail = () => {
    const params = useParams<{ categoryId: string }>();
    const categoryId = params.categoryId ? parseInt(params.categoryId) : 0;

    const categoryQuery = useMeasurementsQuery(categoryId);

    return categoryQuery.isLoading
        ? <LoadingPlaceholder />
        : <WgerContainerRightSidebar
            title={categoryQuery.data!.name}
            mainContent={<Stack spacing={2}>
                <MeasurementChart category={categoryQuery.data!} />
                <CategoryDetailDataTable category={categoryQuery.data!} />
            </Stack>}
            fab={<AddMeasurementEntryFab />}
        />;
};
