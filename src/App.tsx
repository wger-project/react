import React from 'react';
import { Header, } from 'components';
import { Route, Routes } from 'react-router-dom';
import {
    About,
    AddExercise,
    AddWeight,
    ApiPage,
    BmiCalculator,
    Calendar,
    CaloriesCalculator,
    Equipments,
    Gallery,
    Ingredients,
    Login,
    NutritionPlans,
    Preferences,
    PublicTemplate,
    TemplatePage,
    WeightOverview,
    Workout,
    WorkoutSchedule,
} from 'pages';
import { Notifications } from 'components/Core/Notifications';
import { Dashboard } from "components/Dashboard/Dashboard";
import { ExerciseOverview } from "components/Exercises/ExerciseOverview";
import { ExerciseDetailPage } from "pages/ExerciseDetails";
import { Grid } from "@mui/material";


function App() {

    return (
        <Grid container>
            <Grid item xs={12}>
                <Header />
            </Grid>
            <Grid item xs={12}>
                <Notifications />
            </Grid>
            <Grid item xs={12}>
                <Routes>
                    <Route path="/:lang">
                        <Route path="workout">
                            <Route path="overview" element={<Workout />} />
                            <Route path="schedule" element={<WorkoutSchedule />} />
                            <Route path="calendar">
                                <Route path="user" element={<Calendar />} />
                            </Route>
                            <Route path="gallery" element={<Gallery />} />

                            <Route path="template">
                                <Route path="overview" element={<TemplatePage />} />
                                <Route path="public" element={<PublicTemplate />} />
                            </Route>
                        </Route>
                        <Route path="exercise">
                            <Route index element={<ExerciseOverview />} />
                            <Route path="overview" element={<ExerciseOverview />} />
                            <Route path=":baseID" element={<ExerciseDetailPage />}>
                                <Route path="view" element={<ExerciseDetailPage />} />
                                <Route path="view/:slug" element={<ExerciseDetailPage />} />
                            </Route>
                            <Route path="add" element={<AddExercise />} />
                        </Route>
                        <Route path="weight">
                            <Route path="overview" element={<WeightOverview />} />
                            <Route path="add" element={<AddWeight />} />
                        </Route>
                        <Route path="nutrition">
                            <Route path="overview" element={<NutritionPlans />} />
                            <Route path="calculator">
                                <Route path="bmi" element={<BmiCalculator />} />
                                <Route path="calories" element={<CaloriesCalculator />} />
                            </Route>
                            <Route path="ingredient">
                                <Route path="overview" element={<Ingredients />} />
                            </Route>
                        </Route>
                        <Route path="software">
                            <Route path="about-us" element={<About />} />
                            <Route path="api" element={<ApiPage />} />
                            <Route path="equipment" element={<Equipments />} />
                        </Route>
                        <Route path="login" element={<Login />} />
                        <Route path="user">
                            <Route path="preferences" element={<Preferences />} />
                        </Route>
                    </Route>
                    <Route path="/" element={<Dashboard />} />


                    {/* This route matches when no other route match, so a 404 */}
                    <Route
                        path="*"
                        element={
                            <main style={{ padding: "1rem" }}>
                                <p>404, Page NOT FOUND</p>
                            </main>
                        }
                    />
                </Routes>
            </Grid>

        </Grid>

    );
}

export default App;
