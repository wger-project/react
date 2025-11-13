import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Button, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { DashboardCard } from "components/Dashboard/DashboardCard";
import React from "react";
// import { useTranslation } from "react-i18next";

/**
 * Example of a new widget using DashboardCard
 *
 * This demonstrates how simple it is to create a new dashboard widget.
 * All the responsive layout logic is handled by DashboardCard!
 */
export const GoalsCard = () => {
    // const { t } = useTranslation();

    // Your data fetching logic here
    const goals = [
        { id: 1, title: "Lose 5kg", progress: 60 },
        { id: 2, title: "Run 5km", progress: 80 },
        { id: 3, title: "Bench 100kg", progress: 45 },
    ];

    return (
        <DashboardCard
            title="My Goals"
            subheader="Track your fitness goals"
            // Optional header action (top-right icon)
            headerAction={
                <Tooltip title="View trends">
                    <IconButton>
                        <TrendingUpIcon />
                    </IconButton>
                </Tooltip>
            }
            // Actions at the bottom of the card
            actions={
                <>
                    <Button size="small">See All Goals</Button>
                    <Button size="small" variant="contained">
                        Add Goal
                    </Button>
                </>
            }
        >
            {/* Your card content goes here */}
            <List>
                {goals.map((goal) => (
                    <ListItem key={goal.id}>
                        <ListItemText
                            primary={goal.title}
                            secondary={
                                <Typography variant="body2" color="text.secondary">
                                    Progress: {goal.progress}%
                                </Typography>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </DashboardCard>
    );
};

// To add this widget to the dashboard, just add it to AVAILABLE_WIDGETS in ConfigurableDashboard.tsx:
// {
//   id: 'goals',
//   type: 'goals',
//   component: GoalsCard,
//   defaultLayout: { w: 4, h: 6, x: 0, y: 6, minW: 3, minH: 4 },
// }
