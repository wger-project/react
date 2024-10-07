import { DragDropContext, Draggable, DraggableStyle, Droppable, DropResult } from "@hello-pangea/dnd";
import AddIcon from '@mui/icons-material/Add';
import HotelIcon from '@mui/icons-material/Hotel';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box, Button,
    Card,
    CardActionArea, CardActions,
    CardContent,
    Container,
    Divider,
    IconButton,
    Stack,
    Typography,
    useTheme
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { uuid4 } from "components/Core/Misc/uuid";
import { RoutineDetailsCard } from "components/WorkoutRoutines/Detail/RoutineDetailsCard";
import { RoutineDetailsTable } from "components/WorkoutRoutines/Detail/RoutineDetailsTable";
import { Day } from "components/WorkoutRoutines/models/Day";
import { useEditDayQuery, useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import { useEditRoutineQuery } from "components/WorkoutRoutines/queries/routines";
import { ConfigDetailsField } from "components/WorkoutRoutines/widgets/forms/BaseConfigForm";
import { DayForm } from "components/WorkoutRoutines/widgets/forms/DayForm";
import { RoutineForm } from "components/WorkoutRoutines/widgets/forms/RoutineForm";
import { SlotConfigForm } from "components/WorkoutRoutines/widgets/forms/SlotConfigForm";
import { SlotForm } from "components/WorkoutRoutines/widgets/forms/SlotForm";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const RoutineEdit = () => {

    /*
    TODO:
        * Add drag and drop (https://github.com/hello-pangea/dnd) for
          - ✅ the days
          - the slots? does this make sense?
          - the exercises within the slots?
        * advanced / simple mode: the simple mode only shows weight and reps
          while the advanced mode allows to edit all the other stuff
        * RiRs in dropdown (0, 0.5, 1, 1.5, 2,...)
        * rep and weight units in dropdown
        * for dynamic config changes, +/-, replace toggle, needs_logs_to_appy toggle
        * add / remove / edit slots
        * add / remove / edit days
        * add / remove / edit exercises
        * add / remove / edit sets
        * tests!
        * ...
     */

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const routineQuery = useRoutineDetailQuery(routineId);
    const editRoutineQuery = useEditRoutineQuery(routineId);
    const dayQuery = useEditDayQuery(routineId);

    const [selectedDay, setSelectedDay] = React.useState(0);

    const onDragEnd= (result: DropResult) => {

        // Item was dropped outside the list
        if (!result.destination) {
            return;
        }

        const updatedDays = Array.from(routineQuery.data!.days);
        const [movedDay] = updatedDays.splice(result.source.index, 1);
        updatedDays.splice(result.destination.index, 0, movedDay);

        // Update next_day_id for each day
        updatedDays.forEach((day, index) => {
            const nextDayIndex = (index + 1) % updatedDays.length; // Wrap around for the last day
            day.nextDayId = updatedDays[nextDayIndex].id;
        });

        // Save objects
        routineQuery.data!.days = updatedDays;
        updatedDays.forEach((day) => {
            dayQuery.mutate({routine: routineId, id: day.id, next_day: day.nextDayId!})
        });
        editRoutineQuery.mutate({id: routineId, first_day: updatedDays.at(0)!.id});
    }


    const grid = 8;

    const getItemStyle = (isDragging: boolean, draggableStyle: DraggableStyle ) => ({
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

    const getListStyle = (isDraggingOver : boolean) => ({

        background: isDraggingOver ? "lightblue" : undefined,
        // background: isDraggingOver ? "lightblue" : "lightgrey",
        display: 'flex',
        padding: grid,
        overflow: 'auto',
    });

    return <>
        <Container maxWidth="lg">
            {routineQuery.isLoading
                ? <LoadingPlaceholder />
                : <>
                    <Typography variant={"h4"}>
                        Edit {routineQuery.data?.name}
                    </Typography>

                    <RoutineForm routine={routineQuery.data!} firstDayId={1000} />

                    <Grid
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
                                                                setSelected={setSelectedDay}
                                                                isSelected={selectedDay === day.id}
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
                                <CardActionArea sx={{ minHeight: 175 }} onClick={() => {
                                    console.log('adding new day now...');
                                }}
                                >
                                    <CardContent>
                                        <AddIcon />
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    </Grid>

                    {selectedDay > 0 &&
                        <>
                        <Typography variant={"h4"}>
                            {routineQuery.data!.days.find(day => day.id === selectedDay)!.name}
                        </Typography>
                        <DayDetails
                            day={routineQuery.data!.days.find(day => day.id === selectedDay)!}
                            routineId={routineId}
                        />
                        </>
                    }

                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Typography variant={"h4"}>
                            Resulting routine
                        </Typography>

                        <Box padding={4}>
                            <RoutineDetailsTable />
                            <RoutineDetailsCard />
                        </Box>
                    </Stack>
                </>
            }
        </Container>
    </>;
};


const DayCard = (props: { day: Day, isSelected: boolean, setSelected: (day: number) => void }) => {
    const theme = useTheme();
    const color = props.isSelected ? theme.palette.primary.light : props.day.isRest ? theme.palette.action.disabled : '';
    const sx = { backgroundColor: color};
    const [t] = useTranslation();

    return (
        <Card sx={sx}>
                <CardContent>
                    <Typography variant="h6" >
                        {props.day.isRest ? t('routines.restDay') : props.day.name}
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        {props.day.isRest && <HotelIcon />}
                    </Typography>
                </CardContent>
            <CardActions>
                <Button size="small" startIcon={<EditIcon />} onClick={() => props.setSelected(props.day.id)}>edit</Button>
            </CardActions>
        </Card>
    );
};

const DayDetails = (props: { day: Day, routineId: number }) => {
    return (
        <>
            <DayForm routineId={props.routineId} day={props.day} />

            {props.day.slots.map((slot) =>
                <>
                    <Typography variant={"h6"} gutterBottom>
                        <b>Slot #{slot.id}</b>
                    </Typography>

                    <SlotForm routineId={props.routineId} slot={slot} />

                    {slot.configs.map((slotConfig) =>
                        <>
                            <p>
                                SlotConfigId {slotConfig.id}
                            </p>

                            <SlotConfigForm routineId={props.routineId} slotConfig={slotConfig} />

                            <Typography variant={"h5"} gutterBottom>
                                {slotConfig.exercise?.getTranslation().name}
                            </Typography>

                            {slotConfig.weightConfigs.map((config) =>
                                <ConfigDetailsField config={config} type="weight" routineId={props.routineId} />
                            )}
                            {slotConfig.maxWeightConfigs.map((config) =>
                                <ConfigDetailsField config={config} type="max-weight" routineId={props.routineId} />
                            )}
                            {slotConfig.repsConfigs.map((config) =>
                                <ConfigDetailsField config={config} type="reps" routineId={props.routineId} />
                            )}
                            {slotConfig.maxRepsConfigs.map((config) =>
                                <ConfigDetailsField config={config} type="max-reps" routineId={props.routineId} />
                            )}
                            {slotConfig.nrOfSetsConfigs.map((config) =>
                                <ConfigDetailsField config={config} type="sets" routineId={props.routineId} />
                            )}
                            {slotConfig.restTimeConfigs.map((config) =>
                                <ConfigDetailsField config={config} type="rest" routineId={props.routineId} />
                            )}
                            {slotConfig.maxRestTimeConfigs.map((config) =>
                                <ConfigDetailsField config={config} type="max-rest" routineId={props.routineId} />
                            )}
                            {slotConfig.rirConfigs.map((config) =>
                                <ConfigDetailsField config={config} type="rir" routineId={props.routineId} />
                            )}
                        </>
                    )}
                    <Divider sx={{ mt: 2, mb: 2 }} />
                </>
            )}
            <IconButton>
                <AddIcon />
            </IconButton>
        </>
    );
};
