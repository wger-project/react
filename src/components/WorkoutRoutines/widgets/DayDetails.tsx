import { DragDropContext, Draggable, DraggableStyle, Droppable, DropResult } from "@hello-pangea/dnd";
import { SsidChart } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import {
    Alert,
    AlertTitle,
    Box,
    Button,
    ButtonGroup,
    FormControlLabel,
    IconButton,
    Snackbar,
    SnackbarCloseReason,
    Stack,
    Switch,
    Tab,
    Tabs,
    Typography,
    useTheme
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { LoadingPlaceholder, LoadingProgressIcon } from "components/Core/LoadingWidget/LoadingWidget";
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import { useProfileQuery } from "components/User/queries/profile";
import { Day } from "components/WorkoutRoutines/models/Day";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import {
    useAddDayQuery,
    useAddSlotEntryQuery,
    useAddSlotQuery,
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
    selectedDayIndex: number | null,
    setSelectedDayIndex: (day: number | null) => void
}) => {

    const { t } = useTranslation();

    const routineQuery = useRoutineDetailQuery(props.routineId);
    const editDayOrderQuery = useEditDayOrderQuery(props.routineId);
    const addDayQuery = useAddDayQuery(props.routineId);

    const getListStyle = (isDraggingOver: boolean) => ({
        background: isDraggingOver ? "lightblue" : undefined,
    });

    const getItemStyle = (isDragging: boolean, draggableStyle: DraggableStyle) => ({
        backgroundColor: "white",
        margin: 4,

        ...draggableStyle,
        opacity: 1,
    });

    const onDragStart = () => {
        props.setSelectedDayIndex(null);
    };

    const onDragEnd = (result: DropResult) => {

        // Item was dropped outside the list
        if (!result.destination) {
            return;
        }


        const updatedDays = Array.from(routineQuery.data!.days);
        const [movedDay] = updatedDays.splice(result.source.index, 1);
        updatedDays.splice(result.destination.index, 0, movedDay);
        props.setSelectedDayIndex(result.destination.index);

        routineQuery.data!.days = updatedDays;
        editDayOrderQuery.mutate(updatedDays.map((day, index) => ({ id: day.id, order: index + 1 })));
    };

    const handleAddDay = async () => {
        const newDayData: AddDayParams = {
            routine: props.routineId,
            name: `${t('routines.newDay')} ${routineQuery.data!.days.length + 1}`,
            order: routineQuery.data!.days.length + 1,
            is_rest: false,
            needs_logs_to_advance: false,
        };
        const newDay = await addDayQuery.mutateAsync(newDayData);
        props.setSelectedDayIndex(routineQuery.data!.days.length);
    };

    if (routineQuery.isLoading) {
        return <LoadingPlaceholder />;
    }


    return (
        <Grid container direction="row" spacing={1}>
            <Grid size={12}>
                <Stack direction={"row"}>
                    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
                        <Droppable droppableId="dayDroppable" direction="horizontal">
                            {(provided, snapshot) => (
                                <Tabs
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    value={props.selectedDayIndex}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    style={getListStyle(snapshot.isDraggingOver)}
                                >
                                    {routineQuery.data!.days.map((day, index) =>
                                        <Draggable key={day.id} draggableId={day.id.toString()} index={index}>
                                            {(provided, snapshot) => (
                                                <Tab
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={getItemStyle(
                                                        snapshot.isDragging,
                                                        provided.draggableProps.style ?? {}
                                                    )}

                                                    label={day.getDisplayName()}
                                                    value={day.id}
                                                    icon={<DragIndicatorIcon />}
                                                    iconPosition="start"
                                                    onClick={() => props.setSelectedDayIndex(index)}
                                                />
                                            )}
                                        </Draggable>
                                    )}

                                    {provided.placeholder}
                                </Tabs>
                            )}
                        </Droppable>
                        <Button
                            startIcon={addDayQuery.isPending ? <LoadingProgressIcon /> : <AddIcon />}
                            onClick={handleAddDay}
                            disabled={addDayQuery.isPending}
                        >

                            {t('routines.addDay')}
                        </Button>

                    </DragDropContext>
                </Stack>
            </Grid>

            {routineQuery.data!.days.length === 0 && <Grid size={12}>
                <Alert severity="info">
                    <AlertTitle>{t('routines.routineHasNoDays')}</AlertTitle>
                    {t('nothingHereYetAction')}
                </Alert>
            </Grid>}
        </Grid>
    );
};


export const DayDetails = (props: {
    day: Day,
    routineId: number,
    setSelectedDayIndex: (day: number | null) => void
}) => {
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
        border: isDragging ? `1px solid ${theme.palette.grey[900]}` : `1px solid ${theme.palette.grey[300]}`,
        backgroundColor: "white",
        marginBottom: grid,

        ...draggableStyle
    });


    return (<>
        <DayForm
            routineId={props.routineId}
            day={props.day}
            key={`day-form-${props.day.id}`}
            setSelectedDayIndex={props.setSelectedDayIndex}
        />


        {(!props.day.isRest && props.day.slots.length > 0) && <>
            <Box height={40} />
            <FormControlLabel
                control={<Switch checked={simpleMode} onChange={() => setSimpleMode(!simpleMode)} />}
                label={t('routines.simpleMode')} />
        </>}

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
                                    <Grid container padding={1}
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}

                                          style={getItemStyle(
                                              snapshot.isDragging,
                                              provided.draggableProps.style ?? {}
                                          )}
                                    >
                                        <Grid
                                            sx={{
                                                backgroundColor: theme.palette.common.white /*theme.palette.grey[200]*/,
                                            }}
                                            size={12}>
                                            <Grid container justifyContent="space-between" alignItems="center">
                                                <Grid>
                                                    <Typography variant={"h6"}>
                                                        <IconButton {...provided.dragHandleProps}>
                                                            <DragIndicatorIcon />
                                                        </IconButton>

                                                        <IconButton onClick={() => handleDeleteSlot(slot.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                        {slot.entries.length > 1 ? t('routines.supersetNr', { number: index + 1 }) : t('routines.exerciseNr', { number: index + 1 })}
                                                    </Typography>
                                                </Grid>

                                                <Grid>
                                                    {slot.entries.length > 0 && <ButtonGroup variant="outlined">
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

                                                        {slot.entries.length > 0 &&
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
                                            <SlotDetails
                                                slot={slot}
                                                routineId={props.routineId}
                                                simpleMode={simpleMode}
                                            />
                                        </Grid>

                                        {(showAutocompleterForSlot === slot.id || slot.entries.length === 0)
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
                                                            order: slot.entries.length + 1,
                                                            weight_unit: userProfileQuery.data!.useMetric ? WEIGHT_UNIT_KG : WEIGHT_UNIT_LB,
                                                        });
                                                        setShowAutocompleterForSlot(null);
                                                    }}
                                                />
                                            </Grid>}
                                    </Grid>
                                )}
                            </Draggable>
                            <Box height={0}>
                                {provided.placeholder}
                            </Box>

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
            {t('routines.addExercise')}
        </Button>}
    </>);
};


