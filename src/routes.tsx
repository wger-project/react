import { Route, Routes } from "react-router-dom";
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
    WorkoutSchedule
} from "pages";
import { ExerciseOverview } from "components/Exercises/ExerciseOverview";
import { ExerciseDetailPage } from "pages/ExerciseDetails";
import { Dashboard } from "components/Dashboard/Dashboard";
import React from "react";
import { RoutineOverview } from "components/WorkoutRoutines/Overview/RoutineOverview";
import { RoutineDetails } from "components/WorkoutRoutines/Detail/RoutineDetails";
import { RoutineLogs } from "components/WorkoutRoutines/Detail/RoutineLogs";
import { MeasurementCategoryOverview } from "components/Measurements/Screens/MeasurementCategoryOverview";
import { MeasurementCategoryDetail } from "components/Measurements/Screens/MeasurementCategoryDetail";

/*
 * Routes for the application
 *
 * Don't change the routes of the elements which are also used in the django application
 */
export const WgerRoutes = () => {
    return <Routes>
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
            <Route path="routine">
                <Route index element={<RoutineOverview />} />
                <Route path="overview" element={<RoutineOverview />} />
                <Route path=":routineId" element={<RoutineDetails />}>
                    <Route path="view" element={<RoutineDetails />} />
                </Route>
                <Route path="log">
                    <Route path=":routineId" element={<RoutineLogs />}>
                        <Route path="view" element={<RoutineLogs />} />
                    </Route>
                </Route>
            </Route>
            <Route path="measurement">
                <Route index element={<MeasurementCategoryOverview />} />
                <Route path="overview" element={<MeasurementCategoryOverview />} />
                <Route path="category/:categoryId" element={<MeasurementCategoryDetail />}>
                </Route>
            </Route>
            <Route path="exercise">
                <Route index element={<ExerciseOverview />} />
                <Route path="overview" element={<ExerciseOverview />} />
                <Route path=":baseID" element={<ExerciseDetailPage />}>
                    <Route path="view-base" element={<ExerciseDetailPage />} />
                    <Route path="view-base/:slug" element={<ExerciseDetailPage />} />
                </Route>
                <Route path="contribute" element={<AddExercise />} />
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
    </Routes>;
};