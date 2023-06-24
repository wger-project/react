import React from "react";
import { Box, Button, Stack, } from "@mui/material";
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
    GridToolbarContainer
} from '@mui/x-data-grid';
import AddIcon from "@mui/icons-material/Add";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { PAGINATION_OPTIONS } from "utils/consts";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
}

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

function EditToolbar(props: EditToolbarProps) {
    const { setRows, setRowModesModel } = props;

    const handleClick = () => {
        //const id = getRandomInt(1000);
        const id = -1;
        setRows((oldRows) => [...oldRows, { id, date: '', value: '', notes: '', isNew: true }]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'value' },
        }));
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick} />
        </GridToolbarContainer>
    );
}

interface EditToolbarProps {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
}


const CategoryDetailDataTable = (props: { category: MeasurementCategory }) => {

    const updateEntryQuery = useEditMeasurementsQuery();
    const deleteEntryQuery = useDeleteMeasurementsQuery();
    const [rows, setRows] = React.useState(props.category.entries);
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
        deleteEntryQuery.mutate(id);
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

    const onProcessRowUpdateError = (error: any, newRow: GridRowModel) => {

        console.log(error);
        setRows(rows.map((row) => (row.id === newRow.id ? newRow : row)));
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    // @ts-ignore
    const columns: GridColDef[] = [
        {
            field: 'value',
            headerName: `Value (${props.category.unit})`,
            width: 80,
            editable: true,
            //valueGetter: (params: GridValueGetterParams) => params.row.value + props.category.unit
        },
        {
            field: 'date',
            headerName: 'Date',
            type: 'date',
            width: 120,
            editable: true,
            //valueGetter: (params: GridValueGetterParams) =>
            //    DateTime.fromJSDate(params.row.date).toLocaleString(DateTime.DATE_MED)
        },
        {
            field: 'notes',
            headerName: 'Notes',
            type: 'string',
            flex: 1,
            editable: true,
            //valueGetter: (params: GridValueGetterParams) =>
            //    DateTime.fromJSDate(params.row.date).toLocaleString(DateTime.DATE_MED)
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
            rows={props.category.entries}
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
            slots={{
                toolbar: EditToolbar,
            }}
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
