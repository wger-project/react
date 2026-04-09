import { Box } from "@mui/material";
import Grid from '@mui/material/Grid';
import { NameAutocompleter } from "components/Exercises/Filter/NameAutcompleter";
import { Exercise } from "components/Exercises/models/exercise";


export const SlotExercisePicker = (props: {
    show: boolean,
    onSelect: (exercise: Exercise) => void,
}) => {
    if (!props.show) {
        return null;
    }

    return (
        <Grid size={12}>
            <Box height={20} />
            <NameAutocompleter
                callback={(exercise: Exercise | null) => {
                    if (exercise !== null) {
                        props.onSelect(exercise);
                    }
                }}
            />
        </Grid>
    );
};
