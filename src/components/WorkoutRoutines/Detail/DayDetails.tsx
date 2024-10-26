import { DragDropContext, Draggable, DraggableStyle, Droppable, DropResult } from "@hello-pangea/dnd";
import { DragHandle, SsidChart } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from "@mui/icons-material/EditOff";
import HotelIcon from "@mui/icons-material/Hotel";
import {
    Alert,
    Box,
    Button,
    ButtonGroup,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Snackbar,
    SnackbarCloseReason,
    Switch,
    Typography,
    useTheme
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { LoadingProgressIcon } from "components/Core/LoadingWidget/LoadingWidget";
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import { SlotEntryDetails } from "components/WorkoutRoutines/Detail/SlotDetails";
import { Day } from "components/WorkoutRoutines/models/Day";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import {
    useAddSlotConfigQuery,
    useAddSlotQuery,
    useDeleteSlotQuery,
    useEditDayQuery,
    useEditSlotOrderQuery,
    useRoutineDetailQuery
} from "components/WorkoutRoutines/queries";
import { useAddDayQuery, useDeleteDayQuery } from "components/WorkoutRoutines/queries/days";
import { DayForm } from "components/WorkoutRoutines/widgets/forms/DayForm";
import { SlotForm } from "components/WorkoutRoutines/widgets/forms/SlotForm";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AddDayParams } from "services/day";
import { ExerciseSearchResponse } from "services/responseType";
import { SNACKBAR_AUTO_HIDE_DURATION } from "utils/consts";
import { makeLink, WgerLink } from "utils/url";

export const DayDragAndDropGrid = (props: {
    routineId: number,
    selectedDay: number | null,
    setSelectedDay: (day: number | null) => void
}) => {

    const routineQuery = useRoutineDetailQuery(props.routineId);
    const editDayQuery = useEditDayQuery(props.routineId);
    const addDayQuery = useAddDayQuery(props.routineId);

    const onDragEnd = (result: DropResult) => {

        // Item was dropped outside the list
        if (!result.destination) {
            return;
        }

        const updatedDays = Array.from(routineQuery.data!.days);
        const [movedDay] = updatedDays.splice(result.source.index, 1);
        updatedDays.splice(result.destination.index, 0, movedDay);

        // Save objects
        routineQuery.data!.days = updatedDays;
        updatedDays.forEach((day, index) => {
            editDayQuery.mutate({ id: day.id, order: index });
        });
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
            name: 'new day',
            order: routineQuery.data!.days.length + 1,
            is_rest: false
        };
        addDayQuery.mutate(newDay);
    };


    return (
        <Grid
            spacing={3}
            container
            direction="row"
        >
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="dayDroppable" direction="horizontal">
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                        >
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

            <Grid
                size={{
                    xs: 12,
                    sm: 6,
                    md: 3
                }}>
                <Card>
                    <CardActionArea sx={{ minHeight: 175 }} onClick={handleAddDay}>
                        <CardContent>
                            Add day<br />
                            {addDayQuery.isPending ? <LoadingProgressIcon /> : <AddIcon />}
                        </CardContent>
                    </CardActionArea>
                </Card>
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
    const sx = { backgroundColor: color, aspectRatio: '4 / 3', minHeight: 175, maxWidth: 200 };
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
            <Card sx={sx}>
                <CardHeader title={props.day.isRest ? t('routines.restDay') : props.day.name} />
                <CardContent>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        {props.day.isRest && <HotelIcon />}
                    </Typography>
                </CardContent>
                <CardActions>
                    <IconButton onClick={setSelected}>
                        {props.isSelected ? <EditOffIcon /> : <EditIcon />}
                    </IconButton>
                    <IconButton onClick={handleDeleteDay}>
                        {deleteDayQuery.isPending ? <LoadingProgressIcon /> : <DeleteIcon />}
                    </IconButton>
                </CardActions>
            </Card>

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
    const addSlotConfigQuery = useAddSlotConfigQuery(props.routineId);
    const addSlotQuery = useAddSlotQuery(props.routineId);
    const editSlotOrderQuery = useEditSlotOrderQuery(props.routineId);
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

    const handleAddSlotConfig = (slotId: number) => {
        const slot = props.day.slots.find(s => s.id === slotId);
        if (slot === undefined) {
            console.log('Could not find slot');
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
            {props.day.name}
        </Typography>
        <Box height={30} />
        <DayForm routineId={props.routineId} day={props.day} key={`day-form-${props.day.id}`} />
        <Box height={40} />
        <FormControlLabel
            control={<Switch checked={simpleMode} onChange={() => setSimpleMode(!simpleMode)} />}
            label="Simple mode" />
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
                                                        {props.day.slots.length > 1 &&
                                                            <IconButton
                                                                onClick={() => handleDeleteSlot(slot.id)} {...provided.dragHandleProps}>
                                                                <DragHandle />
                                                            </IconButton>}

                                                        <IconButton onClick={() => handleDeleteSlot(slot.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                        Set {index + 1}
                                                    </Typography>
                                                </Grid>

                                                <Grid>
                                                    {slot.configs.length > 0 && <ButtonGroup variant="outlined">
                                                        <Button
                                                            onClick={() => handleAddSlotConfig(slot.id)}
                                                            size={"small"}
                                                            disabled={addSlotConfigQuery.isPending}
                                                            startIcon={addSlotConfigQuery.isPending ?
                                                                <LoadingProgressIcon /> :
                                                                <AddIcon />}
                                                        >
                                                            add superset
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
                                                                edit progression
                                                            </Button>
                                                        }
                                                    </ButtonGroup>}
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        {!simpleMode && <Grid size={12}>
                                            <SlotForm routineId={props.routineId} slot={slot}
                                                      key={`slot-form-${slot.id}`} />
                                            <Box height={10} />
                                        </Grid>}
                                        <Grid size={12}>
                                            {/*<Box height={20} />*/}
                                            <SlotEntryDetails
                                                slot={slot}
                                                routineId={props.routineId}
                                                simpleMode={simpleMode}
                                            />
                                        </Grid>

                                        {showAutocompleterForSlot === slot.id
                                            && <Grid size={12}>
                                                <Box height={20} />
                                                <NameAutocompleter
                                                    callback={(exercise: ExerciseSearchResponse | null) => {
                                                        if (exercise === null) {
                                                            return;
                                                        }
                                                        addSlotConfigQuery.mutate({
                                                            slot: slot.id,
                                                            exercise: exercise.data.base_id,
                                                            type: 'normal',
                                                            order: slot.configs.length + 1,
                                                        });
                                                        setShowAutocompleterForSlot(null);
                                                    }}
                                                />
                                                {/*<Box height={20} />*/}
                                            </Grid>}

                                        <Grid size={12}>
                                            {slot.configs.length === 0 && <ButtonGroup><Button
                                                onClick={() => handleAddSlotConfig(slot.id)}
                                                size={"small"}
                                                disabled={addSlotConfigQuery.isPending}
                                                startIcon={addSlotConfigQuery.isPending ? <LoadingProgressIcon /> :
                                                    <AddIcon />}
                                            >
                                                add exercise
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
                        Undo
                    </Button>
                }
            >
                Set successfully deleted
            </Alert>
        </Snackbar>
        <Button
            variant="contained"
            color="primary"
            startIcon={addSlotQuery.isPending ? <LoadingProgressIcon /> : <AddIcon />}
            onClick={handleAddSlot}
        >
            Add set
        </Button>
    </>);
};


