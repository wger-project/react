import { Draggable, DraggableStyle } from "@hello-pangea/dnd";
import { Box, useTheme } from "@mui/material";
import Grid from '@mui/material/Grid';
import { Exercise } from "components/Exercises/models/exercise";
import { Slot } from "components/WorkoutRoutines/models/Slot";
import { SlotDetails } from "components/WorkoutRoutines/widgets/SlotDetails";
import { SlotExercisePicker } from "components/WorkoutRoutines/widgets/slots/SlotExercisePicker";
import { SlotHeader } from "components/WorkoutRoutines/widgets/slots/SlotHeader";
import { SlotForm } from "components/WorkoutRoutines/widgets/forms/SlotForm";


export const DraggableSlotItem = (props: {
    slot: Slot,
    index: number,
    routineId: number,
    simpleMode: boolean,
    showAutocompleter: boolean,
    onDelete: (slotId: number) => void,
    onAddSuperset: (slotId: number) => void,
    addSupersetIsPending: boolean,
    onExerciseSelected: (exercise: Exercise) => void,
}) => {
    const theme = useTheme();
    const grid = 8;

    const getItemStyle = (isDragging: boolean, draggableStyle: DraggableStyle) => ({
        border: isDragging ? `1px solid ${theme.palette.grey[900]}` : `1px solid ${theme.palette.grey[300]}`,
        backgroundColor: "white",
        marginBottom: grid,

        ...draggableStyle
    });

    return (
        <Draggable draggableId={props.slot.id!.toString()} index={props.index}>
            {(provided, snapshot) => (
                <Grid container padding={1}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style ?? {}
                      )}
                >
                    <SlotHeader
                        slot={props.slot}
                        index={props.index}
                        dragHandleProps={provided.dragHandleProps}
                        routineId={props.routineId}
                        onDelete={props.onDelete}
                        onAddSuperset={props.onAddSuperset}
                        addSupersetIsPending={props.addSupersetIsPending}
                    />
                    {!props.simpleMode && <Grid size={12}>
                        <SlotForm
                            routineId={props.routineId}
                            slot={props.slot}
                            key={`slot-form-${props.slot.id}`} />
                        <Box height={10} />
                    </Grid>}
                    <Grid size={12}>
                        <SlotDetails
                            slot={props.slot}
                            routineId={props.routineId}
                            simpleMode={props.simpleMode}
                        />
                    </Grid>

                    <SlotExercisePicker
                        show={props.showAutocompleter}
                        onSelect={props.onExerciseSelected}
                    />
                </Grid>
            )}
        </Draggable>
    );
};
