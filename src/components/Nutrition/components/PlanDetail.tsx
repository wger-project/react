import { Card, CardContent, CardHeader, IconButton, List, ListItem, ListItemText, Stack } from "@mui/material";
import { useFetchNutritionalPlanQuery } from "components/Nutrition/queries";
import { useParams } from "react-router-dom";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import React from "react";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { AddNutritionalPlanFab } from "components/Nutrition/widgets/Fab";
import { PlanDetailDropdown } from "components/Nutrition/widgets/PlanDetailDropdown";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Meal } from "components/Nutrition/models/meal";
import { MealItem } from "components/Nutrition/models/mealItem";


const MealItemListItem = (props: { mealItem: MealItem }) => {
    return <ListItem disablePadding>
        <ListItemText primary={props.mealItem.ingredientObj?.name} />
    </ListItem>;
};

const MealDetail = (props: { meal: Meal }) => {

    return <Card sx={{ minWidth: 275 }}>
        <CardHeader
            sx={{ bgcolor: "lightgray" }}
            action={
                <IconButton aria-label="settings" onClick={() => console.log(props.meal)}>
                    <MoreVertIcon />
                </IconButton>
            }
            title={props.meal.name}
            subheader={props.meal.time}
        />
        <CardContent>
            <List>
                {props.meal.items.map((item) => (
                    <MealItemListItem
                        mealItem={item}
                        key={item.id}
                    />
                ))}
            </List>
        </CardContent>
    </Card>;
};


export const PlanDetail = () => {

    const params = useParams<{ planId: string }>();
    const planId = parseInt(params.planId!);
    const planQuery = useFetchNutritionalPlanQuery(planId);

    if (planQuery.isSuccess) {
        console.log(planQuery.data);
    }

    return planQuery.isLoading
        ? <LoadingPlaceholder />
        : <WgerContainerRightSidebar
            title={planQuery.data!.description}
            optionsMenu={<PlanDetailDropdown plan={planQuery.data!} />}
            mainContent={
                <Stack spacing={2}>
                    {planQuery.data!.meals.map(meal => <MealDetail meal={meal} />)}
                </Stack>
            }
            fab={<AddNutritionalPlanFab />}
        />;
};