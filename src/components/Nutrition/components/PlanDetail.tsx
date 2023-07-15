import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Stack
} from "@mui/material";
import { useParams } from "react-router-dom";
import { WgerContainerRightSidebar } from "components/Core/Widgets/Container";
import React from "react";
import { LoadingPlaceholder } from "components/Core/LoadingWidget/LoadingWidget";
import { AddNutritionDiaryEntryFab } from "components/Nutrition/widgets/Fab";
import { PlanDetailDropdown } from "components/Nutrition/widgets/PlanDetailDropdown";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Meal } from "components/Nutrition/models/meal";
import { MealItem } from "components/Nutrition/models/mealItem";
import { Add } from "@mui/icons-material";
import { useFetchNutritionalPlanQuery } from "components/Nutrition/queries";
import { MacrosPieChart } from "components/Nutrition/widgets/MacrosPieChart";


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
        <CardActions>
            <IconButton onClick={() => console.log(props)}>
                <Add />
            </IconButton>
        </CardActions>
    </Card>;
};


export const PlanDetail = () => {

    const params = useParams<{ planId: string }>();
    const planId = parseInt(params.planId!);
    const planQuery = useFetchNutritionalPlanQuery(planId);

    return planQuery.isLoading
        ? <LoadingPlaceholder />
        : <WgerContainerRightSidebar
            title={planQuery.data!.description}
            optionsMenu={<PlanDetailDropdown plan={planQuery.data!} />}
            mainContent={
                <>
                    <Stack spacing={2}>
                        {planQuery.data!.meals.map(meal => <MealDetail meal={meal} key={meal.id} />)}
                        <p>aaaa</p>
                        <MacrosPieChart data={planQuery.data!.nutritionalValues} />
                    </Stack>

                </>
            }
            fab={<AddNutritionDiaryEntryFab plan={planQuery.data!} />}
        />;
};