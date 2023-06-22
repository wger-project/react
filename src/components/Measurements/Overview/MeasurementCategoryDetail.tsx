import React from "react";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Container,
    Grid,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { AddWorkoutFab } from "components/WorkoutRoutines/Overview/fab";
import { useMeasurementsQuery } from "components/Measurements/queries";
import { MeasurementCategory } from "components/Measurements/models/Category";
import { MeasurementChart } from "components/Measurements/charts/MeasurementChart";
import { useParams } from "react-router-dom";


const CategoryList = (props: { category: MeasurementCategory }) => {

    return <Card>
        <CardHeader title={props.category.name} subheader={props.category.unit} />
        <CardContent>

            <MeasurementChart category={props.category} />
        </CardContent>
        <CardActions disableSpacing sx={{ justifyContent: "space-between" }}>
            <Button variant="text">See details</Button>
            <IconButton>
                <AddIcon />
            </IconButton>
        </CardActions>
    </Card>;
};
export const MeasurementCategoryDetail = () => {
    const params = useParams<{ categoryId: string }>();
    const categoryId = params.categoryId ? parseInt(params.categoryId) : 0;

    const categoryQuery = useMeasurementsQuery(categoryId);

    return <Container maxWidth="lg">

        <Grid container>
            <Grid item xs={12} sm={8}>

                {categoryQuery.isLoading
                    ? <LoadingPlaceholder />
                    : <>
                        <Typography gutterBottom variant="h3" component="div">
                            {categoryQuery.data!.name}
                        </Typography>

                        <Stack spacing={2}>
                            {<CategoryList category={categoryQuery.data!} />}
                        </Stack>
                    </>
                }

            </Grid>
            <Grid item xs={12} sm={4}>

            </Grid>
        </Grid>

        <AddWorkoutFab />

    </Container>;
};
