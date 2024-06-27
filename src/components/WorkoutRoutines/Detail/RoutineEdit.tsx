import AddIcon from '@mui/icons-material/Add';
import HotelIcon from '@mui/icons-material/Hotel';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Container,
    IconButton,
    Stack,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { uuid4 } from "components/Core/Misc/uuid";
import { RoutineDetails } from "components/WorkoutRoutines/Detail/RoutineDetails";
import { BaseConfig } from "components/WorkoutRoutines/models/BaseConfig";
import { Day } from "components/WorkoutRoutines/models/Day";
import { useEditWeightConfigQuery, useRoutineDetailQuery } from "components/WorkoutRoutines/queries";
import {
    useEditMaxRepsConfigQuery,
    useEditMaxRestConfigQuery,
    useEditMaxWeightConfigQuery,
    useEditNrOfSetsConfigQuery,
    useEditRepsConfigQuery,
    useEditRestConfigQuery,
    useEditRiRConfigQuery
} from "components/WorkoutRoutines/queries/configs";
import React from "react";
import { useParams } from "react-router-dom";

export const RoutineEdit = () => {

    const params = useParams<{ routineId: string }>();
    const routineId = params.routineId ? parseInt(params.routineId) : 0;
    const routineQuery = useRoutineDetailQuery(routineId);

    const [selectedDay, setSelectedDay] = React.useState(0);

    return <>
        <Container maxWidth="lg">
            {routineQuery.isLoading
                ? <LoadingPlaceholder />
                : <>
                    <Typography variant={"h4"}>
                        Edit {routineQuery.data?.name}
                    </Typography>

                    <Grid
                        spacing={3}
                        container
                        direction="row"
                        // justify="flex-start"
                        // alignItems="flex-start"
                    >

                        {routineQuery.data!.days.map((day) =>
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={3}
                                key={routineQuery.data!.days.indexOf(day)}
                            >
                                <DayCard day={day}
                                         setSelected={setSelectedDay}
                                         isSelected={selectedDay === day.id}
                                         key={uuid4()} />

                            </Grid>
                        )}
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={3}
                        >
                            <Card>
                                <CardActionArea sx={{ minHeight: 175 }} onClick={() => {
                                    console.log('aaaa');
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
                        <DayDetails day={routineQuery.data!.days.find(day => day.id === selectedDay)!} />
                    }


                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Typography variant={"h5"}>
                            Result
                        </Typography>

                        <Box padding={4}>
                            <RoutineDetails />
                        </Box>
                    </Stack>
                </>
            }
        </Container>
    </>;
};

const DayCard = (props: { day: Day, isSelected: boolean, setSelected: (day: number) => void }) => {
    const theme = useTheme();
    const sx = props.isSelected ? { backgroundColor: theme.palette.primary.light } : {};

    return (
        <Card sx={sx}>
            <CardActionArea sx={{ minHeight: 175 }} onClick={() => {
                props.setSelected(props.day.id);
            }}>
                <CardContent>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                        {props.day.isRest ? 'REST DAY' : props.day.name}
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        {props.day.isRest && <HotelIcon />}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

const DayDetails = (props: { day: Day }) => {

    console.log(props.day);
    return (
        <>
            <Typography variant={"h5"} gutterBottom>
                {props.day.isRest ? 'REST DAY' : props.day.name}
            </Typography>

            {props.day.slots.map((slot) =>
                <>
                    {slot.configs.map((slotConfig) =>
                        <>
                            <Typography variant={"h6"} gutterBottom>
                                {slotConfig.exercise?.getTranslation().name}
                                <small> - Set-ID {slot.id}</small>
                            </Typography>
                            <ConfigDetails configs={slotConfig.weightConfigs} type="weight" />
                            <ConfigDetails configs={slotConfig.maxWeightConfigs} type="max-weight" />
                            <ConfigDetails configs={slotConfig.repsConfigs} type="reps" />
                            <ConfigDetails configs={slotConfig.maxRepsConfigs} type="max-reps" />
                            <ConfigDetails configs={slotConfig.nrOfSetsConfigs} type="sets" />
                            <ConfigDetails configs={slotConfig.restTimeConfigs} type="rest" />
                            <ConfigDetails configs={slotConfig.maxRestTimeConfigs} type="max-rest" />
                            <ConfigDetails configs={slotConfig.rirConfigs} type="rir" />
                        </>
                    )}
                </>
            )}
            <IconButton>
                <AddIcon />
            </IconButton>

        </>
    );

};


const ConfigDetails = (props: {
    configs: BaseConfig[],
    type: 'weight' | 'max-weight' | 'reps' | 'max-reps' | 'sets' | 'rest' | 'max-rest' | 'rir'
}) => {

    const editWeightQuery = useEditWeightConfigQuery(1);
    const editMaxWeightQuery = useEditMaxWeightConfigQuery(1);
    const editRepsQuery = useEditRepsConfigQuery(1);
    const editMaxRepsQuery = useEditMaxRepsConfigQuery(1);
    const editNrOfSetsQuery = useEditNrOfSetsConfigQuery(1);
    const editRiRQuery = useEditRiRConfigQuery(1);
    const editRestQuery = useEditRestConfigQuery(1);
    const editMaxRestQuery = useEditMaxRestConfigQuery(1);

    return (
        <>

            {props.configs.map((config) =>
                <TextField
                    key={config.id}
                    label={props.type}
                    value={config.value}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {

                        const data = {
                            id: config.id,
                            // eslint-disable-next-line camelcase
                            slot_config: config.slotConfigId,
                            value: parseFloat(event.target.value)
                        };

                        switch (props.type) {
                            case 'weight':
                                editWeightQuery.mutate(data);
                                break;

                            case "max-weight":
                                editMaxWeightQuery.mutate(data);
                                break;

                            case 'reps':
                                editRepsQuery.mutate(data);
                                break;

                            case "max-reps":
                                editMaxRepsQuery.mutate(data);
                                break;

                            case 'sets':
                                editNrOfSetsQuery.mutate(data);
                                break;

                            case 'rir':
                                editRiRQuery.mutate(data);
                                break;

                            case 'rest':
                                editRestQuery.mutate(data);
                                break;

                            case "max-rest":
                                editMaxRestQuery.mutate(data);
                                break;
                        }
                    }}
                />
            )}

        </>
    );

};