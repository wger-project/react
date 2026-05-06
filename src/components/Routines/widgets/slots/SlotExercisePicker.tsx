import { Exercise, NameAutocompleter } from "@/components/Exercises";
import { Box } from "@mui/material";
import Grid from '@mui/material/Grid';


export const SlotExercisePicker = (props: {
    show: boolean,
    onSelect: (exercise: Exercise) => void,
}) => {
    if (!props.show) {
        return null;
    }

    return (
        <Grid size={12}>
            <Box sx={{ height: 20 }} />
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
