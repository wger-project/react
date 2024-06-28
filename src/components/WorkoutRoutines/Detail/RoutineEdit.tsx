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
import { RoutineDetailsCard } from "components/WorkoutRoutines/Detail/RoutineDetailsCard";
import { BaseConfig } from "components/WorkoutRoutines/models/BaseConfig";
import { Day } from "components/WorkoutRoutines/models/Day";
import {
    useEditDayQuery,
    useEditMaxRepsConfigQuery,
    useEditMaxRestConfigQuery,
    useEditMaxWeightConfigQuery,
    useEditNrOfSetsConfigQuery,
    useEditRepsConfigQuery,
    useEditRestConfigQuery,
    useEditRiRConfigQuery,
    useEditWeightConfigQuery,
    useRoutineDetailQuery
} from "components/WorkoutRoutines/queries";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
                        <DayDetails day={routineQuery.data!.days.find(day => day.id === selectedDay)!} />
                    }


                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <Typography variant={"h4"}>
                            Resulting routine
                        </Typography>

                        <Box padding={4}>
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

    const sx = { backgroundColor: color };
    // const sx = props.isSelected ? { backgroundColor: theme.palette.primary.light } : {};
    const [t] = useTranslation();

    return (
        <Card sx={sx}>
            <CardActionArea sx={{ minHeight: 175 }} onClick={() => {
                props.setSelected(props.day.id);
            }}>
                <CardContent>
                    <Typography>
                        {props.day.isRest ? t('routines.restDay') : props.day.name}
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

    const editDayQuery = useEditDayQuery(1);
    const [t] = useTranslation();

    return (
        <>
            <Typography variant={"h5"} gutterBottom>
                {props.day.isRest ? t('routines.restDay') : props.day.name}
            </Typography>

            <TextField
                label="Name"
                variant="standard"
                value={props.day.name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const data = {
                        id: props.day.id,
                        routine: 1,
                        description: 'props.day.description',
                        name: event.target.value
                    };
                    editDayQuery.mutate(data);
                }}
            />

            {props.day.slots.map((slot) =>
                <>
                    {slot.configs.map((slotConfig) =>
                        <>
                            <Typography variant={"h6"} gutterBottom>
                                {slotConfig.exercise?.getTranslation().name}
                                <small> - Set-ID {slot.id}</small>
                            </Typography>
                            {slotConfig.weightConfigs.map((config) =>
                                <ConfigDetails config={config} type="weight" />
                            )}
                            {slotConfig.maxWeightConfigs.map((config) =>
                                <ConfigDetails config={config} type="max-weight" />
                            )}
                            {slotConfig.repsConfigs.map((config) =>
                                <ConfigDetails config={config} type="reps" />
                            )}
                            {slotConfig.maxRepsConfigs.map((config) =>
                                <ConfigDetails config={config} type="max-reps" />
                            )}
                            {slotConfig.nrOfSetsConfigs.map((config) =>
                                <ConfigDetails config={config} type="sets" />
                            )}
                            {slotConfig.restTimeConfigs.map((config) =>
                                <ConfigDetails config={config} type="rest" />
                            )}
                            {slotConfig.maxRestTimeConfigs.map((config) =>
                                <ConfigDetails config={config} type="max-rest" />
                            )}
                            {slotConfig.rirConfigs.map((config) =>
                                <ConfigDetails config={config} type="rir" />
                            )}
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
    config: BaseConfig,
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

    const [value, setValue] = useState(props.config.value);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    const handleData = (value: string) => {

        const data = {
            id: props.config.id,
            // eslint-disable-next-line camelcase
            slot_config: props.config.slotConfigId,
            value: parseFloat(value)
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
    };

    const onChange = (text: string) => {
        if (text !== '') {
            setValue(parseFloat(text));
        }

        if (timer) {
            clearTimeout(timer);
        }
        setTimer(setTimeout(() => handleData(text), 500));
    };

    return (
        <>

            <TextField
                key={props.config.id}
                label={props.type}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </>
    );
};

