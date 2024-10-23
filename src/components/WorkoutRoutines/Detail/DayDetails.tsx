import { DragDropContext, Draggable, DraggableStyle, Droppable, DropResult } from "@hello-pangea/dnd";
import { SsidChart } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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
    CircularProgress,
    Divider,
    FormControlLabel,
    IconButton,
    Snackbar,
    SnackbarCloseReason,
    Switch,
    Typography,
    useTheme
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { SlotDetails } from "components/WorkoutRoutines/Detail/SlotDetails";
import { Day } from "components/WorkoutRoutines/models/Day";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { useAddSlotConfigQuery, useEditDayQuery, useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { useEditRoutineQuery } from "components/WorkoutRoutines/queries/routines";
import { useDeleteSlotQuery } from "components/WorkoutRoutines/queries/slots";
import { DayForm } from "components/WorkoutRoutines/widgets/forms/DayForm";
import { SlotForm } from "components/WorkoutRoutines/widgets/forms/SlotForm";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AddSlotConfigParams } from "services/slot_config";
import { SNACKBAR_AUTO_HIDE_DURATION } from "utils/consts";
import { makeLink, WgerLink } from "utils/url";

export const DayDragAndDropGrid = (props: {
    routineId: number,
    selectedDay: number | null,
    setSelectedDay: (day: number | null) => void
}) => {

    const routineQuery = useRoutineDetailQuery(props.routineId);
    const editRoutineQuery = useEditRoutineQuery(props.routineId);
    const editDayQuery = useEditDayQuery(props.routineId);

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
            editDayQuery.mutate({ routine: props.routineId, id: day.id, order: index });
        });
        editRoutineQuery.mutate({ id: props.routineId });
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
                <CardActionArea sx={{ minHeight: 175 }} onClick={() => console.log('adding new day')}>
                    <CardContent>
                        <AddIcon />
                    </CardContent>
                </CardActionArea>
            </Card>
        </Grid>
    </Grid>;
};

const DayCard = (props: { day: Day, isSelected: boolean, setSelected: (day: number | null) => void }) => {
    const theme = useTheme();
    const color = props.isSelected ? theme.palette.primary.light : props.day.isRest ? theme.palette.action.disabled : '';
    const sx = { backgroundColor: color, aspectRatio: '4 / 3', minHeight: 175, maxWidth: 200 };
    const [t] = useTranslation();

    const setSelected = () => {
        props.isSelected ? props.setSelected(null) : props.setSelected(props.day.id);
    };

    return (
        <Card sx={sx}>
            <CardHeader title={props.day.isRest ? t('routines.restDay') : props.day.name} />
            <CardContent>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {props.day.isRest && <HotelIcon />}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small" startIcon={<EditIcon />} onClick={setSelected}>edit</Button>
            </CardActions>
        </Card>
    );
};

export const DayDetails = (props: { day: Day, routineId: number }) => {

    const [t, i18n] = useTranslation();
    const deleteSlotQuery = useDeleteSlotQuery(props.routineId);
    const addSlotConfigQuery = useAddSlotConfigQuery(props.routineId);
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

        const newSlotConfigData: AddSlotConfigParams = {
            slot: slotId,
            exercise: exerciseId,
            type: 'normal',
            order: slot.configs.length,
            comment: ''
        };

        addSlotConfigQuery.mutate(newSlotConfigData);
    };


    return (
        <>
            <Typography variant={"h4"}>
                {props.day.name}
                <IconButton onClick={() => console.log(`deleting day ${props.day.id}`)}>
                    <DeleteIcon />
                </IconButton>
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
                            startIcon={addSlotConfigQuery.isLoading ? <CircularProgress size={20} /> : <AddIcon />}
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

            <Button variant="contained" color="primary" startIcon={<AddIcon />}>todo - Add set</Button>
        </>
    );
};


