import { DragDropContext, Draggable, DraggableStyle, Droppable, DropResult } from "@hello-pangea/dnd";
import { SsidChart } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from "@mui/icons-material/EditOff";
import HotelIcon from "@mui/icons-material/Hotel";
import {
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
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    Snackbar,
    SnackbarCloseReason,
    Switch,
    Typography,
    useTheme
} from "@mui/material";
import { LoadingProgressIcon } from "components/Core/LoadingWidget/LoadingWidget";
import { SlotDetails } from "components/WorkoutRoutines/Detail/SlotDetails";
import { Day } from "components/WorkoutRoutines/models/Day";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import {
    useAddSlotConfigQuery,
    useAddSlotQuery,
    useDeleteSlotQuery,
    useEditDayQuery,
    useRoutineDetailQuery
} from "components/WorkoutRoutines/queries";
import { useAddDayQuery, useDeleteDayQuery } from "components/WorkoutRoutines/queries/days";
import { DayForm } from "components/WorkoutRoutines/widgets/forms/DayForm";
import { SlotForm } from "components/WorkoutRoutines/widgets/forms/SlotForm";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AddDayParams } from "services/day";
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


    return <Grid
        spacing={3}
        container
        direction="row"
    >
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable" direction="horizontal">
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
            item
            xs={12}
            sm={6}
            md={3}
        >
            <Card>
                <CardActionArea sx={{ minHeight: 175 }} onClick={handleAddDay}>
                    <CardContent>
                        Add day<br />
                        {addDayQuery.isLoading ? <LoadingProgressIcon /> : <AddIcon />}
                    </CardContent>
                </CardActionArea>
            </Card>
        </Grid>
    </Grid>;
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
                        {deleteDayQuery.isLoading ? <LoadingProgressIcon /> : <DeleteIcon />}
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

    const [t, i18n] = useTranslation();
    const deleteSlotQuery = useDeleteSlotQuery(props.routineId);
    const addSlotConfigQuery = useAddSlotConfigQuery(props.routineId);
    const addSlotQuery = useAddSlotQuery(props.routineId);

    const [openSnackbar, setOpenSnackbar] = useState(false);
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

        const exerciseId = slot?.configs[slot.configs.length - 1]?.exercise?.id;
        if (exerciseId === undefined || exerciseId === null) {
            console.log('Could not find suitable exercise for new set');
            return;
        }

        addSlotConfigQuery.mutate({
            slot: slotId,
            exercise: exerciseId,
            type: 'normal',
            order: slot.configs.length,
        });
    };

    const handleAddSlot = () => addSlotQuery.mutate({ day: props.day.id, order: props.day.slots.length + 1 });


    return (
        <>
            <Typography variant={"h4"}>
                {props.day.name}
            </Typography>
            <Box height={30} />


            <DayForm routineId={props.routineId} day={props.day} key={`day-form-${props.day.id}`} />
            <Box height={40} />
            <FormControlLabel
                control={<Switch checked={simpleMode} onChange={() => setSimpleMode(!simpleMode)} />}
                label="Simple mode" />

            {props.day.slots.map((slot, index) =>
                <div key={`slot-${slot.id}-${index}`}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Typography variant={"h5"} gutterBottom>
                                <IconButton onClick={() => handleDeleteSlot(slot.id)}>
                                    <DeleteIcon />
                                </IconButton>
                                Set {index + 1}
                            </Typography>
                        </Grid>
                        {!simpleMode && <Grid item xs={12} md={8}>
                            <SlotForm routineId={props.routineId} slot={slot} key={`slot-form-${slot.id}`} />
                        </Grid>}
                        <Grid item xs={12}>
                            <Box height={20} />
                            <SlotDetails slot={slot} routineId={props.routineId} simpleMode={simpleMode} />
                        </Grid>
                    </Grid>


                    <Box height={20} />
                    <ButtonGroup variant="outlined">
                        {/*<Tooltip title="add exercise">*/}
                        {/*    <IconButton*/}
                        {/*        onClick={() => handleAddSlotConfig(slot.id)}*/}
                        {/*        size={"small"}*/}
                        {/*        disabled={addSlotConfigQuery.isLoading}*/}
                        {/*    >*/}
                        {/*        {addSlotConfigQuery.isLoading ? <CircularProgress size={20} /> : <AddIcon />}*/}
                        {/*    </IconButton>*/}
                        {/*</Tooltip>*/}

                        <Button
                            onClick={() => handleAddSlotConfig(slot.id)}
                            size={"small"}
                            disabled={addSlotConfigQuery.isLoading}
                            startIcon={addSlotConfigQuery.isLoading ? <LoadingProgressIcon /> : <AddIcon />}
                        >
                            add exercise
                        </Button>

                        <Button onClick={() => console.log("add superset")} size={"small"} startIcon={<AddIcon />}>
                            (TODO) add superset
                        </Button>

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

                        {/*<Tooltip title="edit progression">*/}
                        {/*    <IconButton*/}
                        {/*        component={Link}*/}
                        {/*        size={"small"}*/}
                        {/*        to={makeLink(WgerLink.ROUTINE_EDIT_PROGRESSION, i18n.language, {*/}
                        {/*            id: props.routineId,*/}
                        {/*            id2: slot.id*/}
                        {/*        })}*/}
                        {/*    >*/}
                        {/*        <AppRegistration />*/}
                        {/*    </IconButton>*/}
                        {/*</Tooltip>*/}
                        {/*<Button*/}
                        {/*    component={Link}*/}
                        {/*    size={"small"}*/}
                        {/*    to={makeLink(WgerLink.ROUTINE_EDIT_PROGRESSION, i18n.language, {*/}
                        {/*        id: props.routineId,*/}
                        {/*        id2: slot.id*/}
                        {/*    })}*/}
                        {/*>*/}
                        {/*    edit progression*/}
                        {/*</Button>*/}
                    </ButtonGroup>

                    <Divider sx={{ mt: 2, mb: 2 }} />
                </div>
            )}

            <Snackbar
                open={openSnackbar}
                autoHideDuration={SNACKBAR_AUTO_HIDE_DURATION}
                onClose={handleCloseSnackbar}
                message="Set successfully deleted"
                action={<Button color="info" size="small" onClick={handleCloseSnackbar}>Undo</Button>}
            >
            </Snackbar>


            <Button
                variant="contained"
                color="primary"
                startIcon={addSlotQuery.isLoading ? <LoadingProgressIcon /> : <AddIcon />}
                onClick={handleAddSlot}
            >
                Add set
            </Button>
        </>
    );
};


