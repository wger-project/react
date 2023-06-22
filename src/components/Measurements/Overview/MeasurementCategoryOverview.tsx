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
import { useTranslation } from "react-i18next";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { AddWorkoutFab } from "components/WorkoutRoutines/Overview/fab";
import { useMeasurementsCategoryQuery } from "components/Measurements/queries";
import { MeasurementCategory } from "components/Measurements/models/Category";
import { MeasurementChart } from "components/Measurements/charts/MeasurementChart";
import { OverviewEmpty } from "components/Core/Widgets/OverviewEmpty";


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
export const MeasurementCategoryOverview = () => {
    const categoryQuery = useMeasurementsCategoryQuery();
    const [t] = useTranslation();

    return <Container maxWidth="lg">

        <Grid container>
            <Grid item xs={12} sm={8}>
                <Typography gutterBottom variant="h3" component="div">
                    {t("measurements.measurements")}
                </Typography>

                {categoryQuery.isLoading
                    ? <LoadingPlaceholder />
                    : <Stack spacing={2}>
                        {categoryQuery.data!.length === 0 && <OverviewEmpty />}
                        {categoryQuery.data!.map(c => <CategoryList category={c} key={c.id} />)}
                    </Stack>
                }

            </Grid>
            <Grid item xs={12} sm={4}>

            </Grid>
        </Grid>

        <AddWorkoutFab />

    </Container>;
};
