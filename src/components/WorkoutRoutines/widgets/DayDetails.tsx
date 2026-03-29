import { DragDropContext, Draggable, DraggableStyle, Droppable, DropResult } from "@hello-pangea/dnd";
import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import {
    Alert,
    AlertTitle,
    Box,
    Button,
    FormControlLabel,
    Snackbar,
    SnackbarCloseReason,
    Stack,
    Switch,
    Tab,
    Tabs,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { LoadingPlaceholder, LoadingProgressIcon } from "components/Core/LoadingWidget/LoadingWidget";
import { useProfileQuery } from "components/User/queries/profile";
import { Day } from "components/WorkoutRoutines/models/Day";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { SlotEntry } from "components/WorkoutRoutines/models/SlotEntry";
import {
    useAddDayQuery,
    useAddSlotEntryQuery,
    useAddSlotQuery,
    useDeleteSlotQuery,
    useEditDayOrderQuery,
    useEditSlotsQuery,
    useRoutineDetailQuery
} from "components/WorkoutRoutines/queries";
import { DayForm } from "components/WorkoutRoutines/widgets/forms/DayForm";
import { DraggableSlotItem } from "components/WorkoutRoutines/widgets/slots/DraggableSlotItem";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SNACKBAR_AUTO_HIDE_DURATION, WEIGHT_UNIT_KG, WEIGHT_UNIT_LB } from "utils/consts";


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
        editDayOrderQuery.mutate(updatedDays.map((day, index) => (Day.clone(day, { order: index + 1 }))));
    };

    const handleAddDay = async () => {
        const newDay = new Day({
            routineId: props.routineId,
            name: `${t('routines.newDay')} ${routineQuery.data!.days.length + 1}`,
            order: routineQuery.data!.days.length + 1,
        });
        await addDayQuery.mutateAsync(newDay);
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
                                        <Draggable key={day.id} draggableId={day.id!.toString()} index={index}>
                                            {(provided, snapshot) => (
                                                <Tab
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={getItemStyle(
                                                        snapshot.isDragging,
                                                        provided.draggableProps.style ?? {}
                                                    )}

                                                    label={day.displayName}
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


const useSlotDeletion = (day: Day, routineId: number) => {
    const deleteSlotQuery = useDeleteSlotQuery(routineId);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null);

    const handleCloseSnackbar = (
        event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (slotToDelete !== null) {
            if (reason === 'timeout') {
                // Delete on the server
                deleteSlotQuery.mutate(slotToDelete.id!);
                setSlotToDelete(null);
            } else if (reason !== 'clickaway') {
                // Undo the deletion - re-add the slot using its sort value
                day.slots = [...day.slots, slotToDelete].sort((a, b) => a.order - b.order);
                setSlotToDelete(null);
            }
        }

        setOpenSnackbar(false);
    };

    const handleDeleteSlot = (slotId: number) => {
        const slotIndex = day.slots.findIndex(slot => slot.id === slotId);

        if (slotIndex !== -1) {
            const updatedSlots = [...day.slots];
            const [deletedSlot] = updatedSlots.splice(slotIndex, 1);
            day.slots = updatedSlots;

            setSlotToDelete(deletedSlot);
            setOpenSnackbar(true);
        }
    };

    return { openSnackbar, handleCloseSnackbar, handleDeleteSlot };
};


export const DayDetails = (props: {
    day: Day,
    routineId: number,
    setSelectedDayIndex: (day: number | null) => void
}) => {
    const { t } = useTranslation();
    const addSlotEntryQuery = useAddSlotEntryQuery(props.routineId);
    const addSlotQuery = useAddSlotQuery(props.routineId);
    const editSlotOrderQuery = useEditSlotsQuery(props.routineId);
    const userProfileQuery = useProfileQuery();

    const [showAutocompleterForSlot, setShowAutocompleterForSlot] = useState<number | null>(null);
    const [simpleMode, setSimpleMode] = useState(true);

    const { openSnackbar, handleCloseSnackbar, handleDeleteSlot } = useSlotDeletion(props.day, props.routineId);

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
    };

    const handleAddSlot = () => addSlotQuery.mutate(new Slot({
        dayId: props.day.id!,
        order: props.day.slots.length + 1
    }));

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        const updatedSlots = Array.from(props.day.slots);
        const [movedSlot] = updatedSlots.splice(result.source.index, 1);
        updatedSlots.splice(result.destination.index, 0, movedSlot);

        editSlotOrderQuery.mutate(updatedSlots.map((slot, index) => (Slot.clone(slot, { order: index + 1 }))));
        props.day.slots = updatedSlots;
    };

    const getListStyle = (isDraggingOver: boolean) => ({
        background: isDraggingOver ? "lightblue" : undefined,
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
                        {props.day.slots.map((slot, index) =>
                            <DraggableSlotItem
                                key={slot.id}
                                slot={slot}
                                index={index}
                                routineId={props.routineId}
                                simpleMode={simpleMode}
                                showAutocompleter={showAutocompleterForSlot === slot.id || slot.entries.length === 0}
                                onDelete={handleDeleteSlot}
                                onAddSuperset={handleAddSlotEntry}
                                addSupersetIsPending={addSlotEntryQuery.isPending}
                                onExerciseSelected={(exercise) => {
                                    addSlotEntryQuery.mutate(new SlotEntry({
                                        slotId: slot.id!,
                                        exerciseId: exercise.id!,
                                        type: 'normal',
                                        order: slot.entries.length + 1,
                                        weightUnitId: userProfileQuery.data!.useMetric ? WEIGHT_UNIT_KG : WEIGHT_UNIT_LB,
                                    }));
                                    setShowAutocompleterForSlot(null);
                                }}
                            />
                        )}
                        {provided.placeholder}
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
