import { DragDropContext, Draggable, DraggableStyle, Droppable, DropResult } from "@hello-pangea/dnd";
import { DragHandle, SsidChart } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from "@mui/icons-material/EditOff";
import {
    Alert,
    Box,
    Button,
    ButtonGroup,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Paper,
    Snackbar,
    SnackbarCloseReason,
    Stack,
    Switch,
    Typography,
    useTheme
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { LoadingProgressIcon } from "components/Core/LoadingWidget/LoadingWidget";
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import { useProfileQuery } from "components/User/queries/profile";
import { Day } from "components/WorkoutRoutines/models/Day";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import {
    useAddDayQuery,
    useAddSlotEntryQuery,
    useAddSlotQuery,
    useDeleteDayQuery,
    useDeleteSlotQuery,
    useEditDayOrderQuery,
    useEditSlotOrderQuery,
    useRoutineDetailQuery
} from "components/WorkoutRoutines/queries";
import { DayForm } from "components/WorkoutRoutines/widgets/forms/DayForm";
import { SlotForm } from "components/WorkoutRoutines/widgets/forms/SlotForm";
import { SlotDetails } from "components/WorkoutRoutines/widgets/SlotDetails";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AddDayParams } from "services/day";
import { ExerciseSearchResponse } from "services/responseType";
import { SNACKBAR_AUTO_HIDE_DURATION, WEIGHT_UNIT_KG, WEIGHT_UNIT_LB } from "utils/consts";
import { makeLink, WgerLink } from "utils/url";

export const DayDragAndDropGrid = (props: {
    routineId: number,
    selectedDay: number | null,
    setSelectedDay: (day: number | null) => void
}) => {

    const { t } = useTranslation();

    const routineQuery = useRoutineDetailQuery(props.routineId);
    const editDayOrderQuery = useEditDayOrderQuery(props.routineId);
    const addDayQuery = useAddDayQuery(props.routineId);

    const onDragEnd = (result: DropResult) => {

        // Item was dropped outside the list
        if (!result.destination) {
            return;
        }

        const updatedDays = Array.from(routineQuery.data!.days);
        const [movedDay] = updatedDays.splice(result.source.index, 1);
        updatedDays.splice(result.destination.index, 0, movedDay);

        routineQuery.data!.days = updatedDays;
        editDayOrderQuery.mutate(updatedDays.map((day, index) => ({ id: day.id, order: index + 1 })));
    };

    const grid = 8;

    const getItemStyle = (isDragging: boolean, draggableStyle: DraggableStyle) => ({
        // some basic styles to make the items look a bit nicer

        // userSelect: "none",
        padding: grid,
        margin: `0 0 ${grid}px 0`,

        // change background colour if dragging
        // background: isDragging ? "lightgreen" : null,
        // background: isDragging ? "lightgreen" : "grey",

        // styles we need to apply on draggables
        ...draggableStyle
    });

    const getListStyle = (isDraggingOver: boolean) => ({

        background: isDraggingOver ? "lightblue" : undefined,
        // background: isDraggingOver ? "lightblue" : "lightgrey",
        display: 'flex',
        padding: grid,
        overflow: 'auto',
    });

    const handleAddDay = () => {
        const newDay: AddDayParams = {
            routine: props.routineId,
            name: t('routines.newDay'),
            order: routineQuery.data!.days.length + 1,
            is_rest: false,
            needs_logs_to_advance: false,
        };
        addDayQuery.mutate(newDay);
    };


    return (
        <Grid container direction="row">
            <Grid size={12}>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="dayDroppable" direction="horizontal">
                        {(provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={getListStyle(snapshot.isDraggingOver)}
                            >
                                {/*<Button*/}
                                {/*    sx={{ width: 110, height: 150 }}*/}
                                {/*    onClick={handleAddDay}*/}
                                {/*    variant="outlined"*/}
                                {/*>*/}
                                {/*    <Stack direction="column" alignItems="center">*/}
                                {/*        {t('routines.addDay')}*/}
                                {/*        {addDayQuery.isPending ? <LoadingProgressIcon /> : <AddIcon />}*/}
                                {/*    </Stack>*/}
                                {/*</Button>*/}
                                {routineQuery.data!.days.map((day, index) =>
                                    <Draggable key={day.id} draggableId={day.id.toString()} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={getItemStyle(
                                                    snapshot.isDragging,
                                                    provided.draggableProps.style ?? {}
                                                )}
                                            >
                                                <DayCard
                                                    day={day}
                                                    routineId={props.routineId}
                                                    setSelected={props.setSelectedDay}
                                                    isSelected={props.selectedDay === day.id}
                                                    key={`card-${day.id}`}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </Grid>

            <Grid size={12} sx={{ textAlign: 'center' }}>
                <Button
                    onClick={handleAddDay}
                    variant="contained"
                    startIcon={addDayQuery.isPending ? <LoadingProgressIcon /> : <AddIcon />}
                >
                    {t('routines.addDay')}
                </Button>
                <Box height={20} />
            </Grid>

        </Grid>
    );
};

const DayCard = (props: {
    day: Day,
    routineId: number,
    isSelected: boolean,
    setSelected: (day: number | null) => void
}) => {
    const theme = useTheme();
    const color = props.isSelected ? theme.palette.info.light : props.day.isRest ? theme.palette.action.disabled : '';
    const sx = { backgroundColor: color, minHeight: 120, width: 150 };
    // const sx = { backgroundColor: color, aspectRatio: '4 / 3', minHeight: 175, maxWidth: 200 };
    const [t] = useTranslation();

    const deleteDayQuery = useDeleteDayQuery(props.routineId);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const setSelected = () => {
        props.isSelected ? props.setSelected(null) : props.setSelected(props.day.id);
    };

    const handleDeleteDay = () => setOpenDeleteDialog(true);

    const handleConfirmDeleteDay = () => {
        props.setSelected(null);
        deleteDayQuery.mutate(props.day.id);
        setOpenDeleteDialog(false);
    };

    const handleCancelDeleteDay = () => setOpenDeleteDialog(false);

    return (<React.Fragment>
            <Paper>
                <Box sx={{ ...sx, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
                    <Typography variant={"h5"}>{props.day.isRest ? t('routines.restDay') : props.day.name}</Typography>

                    <Stack direction="row" spacing={1}>
                        <IconButton onClick={setSelected}>
                            {props.isSelected ? <EditOffIcon /> : <EditIcon />}
                        </IconButton>
                        <IconButton onClick={handleDeleteDay}>
                            {deleteDayQuery.isPending ? <LoadingProgressIcon /> : <DeleteIcon />}
                        </IconButton>
                    </Stack>
                </Box>
            </Paper>

            {/*<Card sx={sx}>*/}
            {/*    <CardHeader title={props.day.isRest ? t('routines.restDay') : props.day.name} />*/}

            {/*    <CardActions>*/}
            {/*        <IconButton onClick={setSelected}>*/}
            {/*            {props.isSelected ? <EditOffIcon /> : <EditIcon />}*/}
            {/*        </IconButton>*/}
            {/*        <IconButton onClick={handleDeleteDay}>*/}
            {/*            {deleteDayQuery.isPending ? <LoadingProgressIcon /> : <DeleteIcon />}*/}
            {/*        </IconButton>*/}
            {/*    </CardActions>*/}
            {/*</Card>*/}

            <Dialog open={openDeleteDialog} onClose={handleCancelDeleteDay}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this day? This action cannot be
                    undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDeleteDay}>Cancel</Button>
                    <Button onClick={handleConfirmDeleteDay} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export const DayDetails = (props: { day: Day, routineId: number }) => {
    // TODO: refactor this component and split it up!

    const [t, i18n] = useTranslation();
    const deleteSlotQuery = useDeleteSlotQuery(props.routineId);
    const addSlotEntryQuery = useAddSlotEntryQuery(props.routineId);
    const addSlotQuery = useAddSlotQuery(props.routineId);
    const editSlotOrderQuery = useEditSlotOrderQuery(props.routineId);
    const userProfileQuery = useProfileQuery();
    const theme = useTheme();

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [showAutocompleterForSlot, setShowAutocompleterForSlot] = useState<number | null>(null);
    const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null);
    const [simpleMode, setSimpleMode] = useState(true);

    const handleCloseSnackbar = (
        event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (slotToDelete !== null) {
            if (reason === 'timeout') {
                // Delete on the server
                deleteSlotQuery.mutate(slotToDelete.id);
                setSlotToDelete(null);
            } else if (reason !== 'clickaway') {
                // Undo the deletion - re-add the slot using its sort value
                props.day.slots = [...props.day.slots, slotToDelete].sort((a, b) => a.order - b.order);
                setSlotToDelete(null);
            }
        }

        setOpenSnackbar(false);
    };

    const handleDeleteSlot = (slotId: number) => {
        const slotIndex = props.day.slots.findIndex(slot => slot.id === slotId);

        if (slotIndex !== -1) {
            const updatedSlots = [...props.day.slots];
            const [deletedSlot] = updatedSlots.splice(slotIndex, 1);
            props.day.slots = updatedSlots;

            setSlotToDelete(deletedSlot);
            setOpenSnackbar(true);
        }
    };

    const handleAddSlotEntry = (slotId: number) => {
        const slot = props.day.slots.find(s => s.id === slotId);
        if (slot === undefined) {
            console.info(`Could not find slot with id ${slotId} to add config`);
            return;
        }

        if (showAutocompleterForSlot === slotId) {
            setShowAutocompleterForSlot(null);
        } else {
            setShowAutocompleterForSlot(slotId);
        }
        return;
    };

    const handleAddSlot = () => addSlotQuery.mutate({ day: props.day.id, order: props.day.slots.length + 1 });

    /*
     * Drag'n'drop
     */
    const grid = 8;
    const onDragEnd = (result: DropResult) => {

        // Item was dropped outside the list
        if (!result.destination) {
            return;
        }

        const updatedSlots = Array.from(props.day.slots);
        const [movedSlot] = updatedSlots.splice(result.source.index, 1);
        updatedSlots.splice(result.destination.index, 0, movedSlot);

        editSlotOrderQuery.mutate(updatedSlots.map((slot, index) => ({ id: slot.id, order: index + 1 })));
        props.day.slots = updatedSlots;
    };

    const getListStyle = (isDraggingOver: boolean) => ({
        background: isDraggingOver ? "lightblue" : undefined,
    });

    const getItemStyle = (isDragging: boolean, draggableStyle: DraggableStyle) => ({
        // userSelect: "none",
        border: isDragging ? `2px solid ${theme.palette.grey[900]}` : `1px solid ${theme.palette.grey[300]}`,
        backgroundColor: "white",
        // padding: grid,
        // margin: `0 0 ${grid}px 0`,
        marginBottom: grid,

        ...draggableStyle
    });


    return (<>
        <Typography variant={"h4"}>
            {props.day.isRest ? t('routines.restDay') : props.day.name}
        </Typography>
        <Box height={30} />
        <DayForm routineId={props.routineId} day={props.day} key={`day-form-${props.day.id}`} />
        <Box height={40} />
        {!props.day.isRest && <FormControlLabel
            control={<Switch checked={simpleMode} onChange={() => setSimpleMode(!simpleMode)} />}
            label={t('routines.simpleMode')} />}
        <Box height={20} />
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="setDroppable" direction="vertical">
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}
                    >
                        {props.day.slots.map((slot, index) => <React.Fragment key={`slot-${slot.id}-${index}`}>
                            <Draggable key={slot.id} draggableId={slot.id.toString()} index={index}>
                                {(provided, snapshot) => (
                                    <Grid container spacing={1}
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}

                                          style={getItemStyle(
                                              snapshot.isDragging,
                                              provided.draggableProps.style ?? {}
                                          )}
                                    >
                                        <Grid sx={{ backgroundColor: theme.palette.grey[100] }} size={12}>
                                            <Grid container justifyContent="space-between" alignItems="center">
                                                <Grid>
                                                    <Typography variant={"h5"}>
                                                        <IconButton
                                                            onClick={() => handleDeleteSlot(slot.id)} {...provided.dragHandleProps}>
                                                            <DragHandle />
                                                        </IconButton>

                                                        <IconButton onClick={() => handleDeleteSlot(slot.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                        Set {index + 1}
                                                    </Typography>
                                                </Grid>

                                                <Grid>
                                                    {slot.configs.length > 0 && <ButtonGroup variant="outlined">
                                                        <Button
                                                            onClick={() => handleAddSlotEntry(slot.id)}
                                                            size={"small"}
                                                            disabled={addSlotEntryQuery.isPending}
                                                            startIcon={addSlotEntryQuery.isPending ?
                                                                <LoadingProgressIcon /> :
                                                                <AddIcon />}
                                                        >
                                                            {t('routines.addSuperset')}
                                                        </Button>

                                                        {slot.configs.length > 0 &&
                                                            <Button
                                                                startIcon={<SsidChart />}
                                                                component={Link}
                                                                size={"small"}
                                                                to={makeLink(WgerLink.ROUTINE_EDIT_PROGRESSION, i18n.language, {
                                                                    id: props.routineId,
                                                                    id2: slot.id
                                                                })}
                                                            >
                                                                {t('routines.editProgression')}
                                                            </Button>
                                                        }
                                                    </ButtonGroup>}
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        {!simpleMode && <Grid size={12}>
                                            <SlotForm
                                                routineId={props.routineId}
                                                slot={slot}
                                                key={`slot-form-${slot.id}`} />
                                            <Box height={10} />
                                        </Grid>}
                                        <Grid size={12}>
                                            {/*<Box height={20} />*/}
                                            <SlotDetails
                                                slot={slot}
                                                routineId={props.routineId}
                                                simpleMode={simpleMode}
                                            />
                                        </Grid>

                                        {showAutocompleterForSlot === slot.id /*|| slot.configs.length === 0*/
                                            && <Grid size={12}>
                                                <Box height={20} />
                                                <NameAutocompleter
                                                    callback={(exercise: ExerciseSearchResponse | null) => {
                                                        if (exercise === null) {
                                                            return;
                                                        }
                                                        addSlotEntryQuery.mutate({
                                                            slot: slot.id,
                                                            exercise: exercise.data.base_id,
                                                            type: 'normal',
                                                            order: slot.configs.length + 1,
                                                            weight_unit: userProfileQuery.data!.useMetric ? WEIGHT_UNIT_KG : WEIGHT_UNIT_LB,
                                                        });
                                                        setShowAutocompleterForSlot(null);
                                                    }}
                                                />
                                                {/*<Box height={20} />*/}
                                            </Grid>}

                                        <Grid size={12}>
                                            {slot.configs.length === 0 && <ButtonGroup><Button
                                                onClick={() => handleAddSlotEntry(slot.id)}
                                                size={"small"}
                                                disabled={addSlotEntryQuery.isPending}
                                                startIcon={addSlotEntryQuery.isPending ? <LoadingProgressIcon /> :
                                                    <AddIcon />}
                                            >
                                                {t('routines.addExercise')}
                                            </Button></ButtonGroup>}
                                        </Grid>
                                    </Grid>
                                )}
                            </Draggable>
                            <Box height={0}>
                                {provided.placeholder}
                            </Box>


                            {/*<Box height={20} />*/}
                            {/*<Divider sx={{ my: 1 }} />*/}
                        </React.Fragment>)}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
        <Snackbar
            open={openSnackbar}
            autoHideDuration={SNACKBAR_AUTO_HIDE_DURATION}
            onClose={handleCloseSnackbar}
        >
            <Alert
                severity="success"
                variant="filled"
                sx={{ width: '100%' }}
                action={
                    <Button
                        color={"warning"}
                        variant={"contained"}
                        size="small"
                        onClick={handleCloseSnackbar}>
                        {t('undo')}
                    </Button>
                }
            >
                Set successfully deleted
            </Alert>
        </Snackbar>
        {!props.day.isRest && <Button
            variant="contained"
            color="primary"
            startIcon={addSlotQuery.isPending ? <LoadingProgressIcon /> : <AddIcon />}
            onClick={handleAddSlot}
        >
            {t('routines.addSet')}
        </Button>}
    </>);
};


