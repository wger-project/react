import { ConfigurableDashboard } from "components/Dashboard/ConfigurableDashboard";
import { ExerciseOverview } from "components/Exercises/ExerciseOverview";
import { MeasurementCategoryDetail } from "components/Measurements/Screens/MeasurementCategoryDetail";
import { MeasurementCategoryOverview } from "components/Measurements/Screens/MeasurementCategoryOverview";
import { BmiCalculator } from "components/Nutrition/components/BmiCalculator";
import { NutritionDiaryOverview } from "components/Nutrition/components/NutritionDiaryOverview";
import { PlanDetail } from "components/Nutrition/components/PlanDetail";
import { PlansOverview } from "components/Nutrition/components/PlansOverview";
import { RoutineAdd } from "components/WorkoutRoutines/Detail/RoutineAdd";
import { RoutineDetail } from "components/WorkoutRoutines/Detail/RoutineDetail";
import { RoutineDetailsTable } from "components/WorkoutRoutines/Detail/RoutineDetailsTable";
import { RoutineEdit } from "components/WorkoutRoutines/Detail/RoutineEdit";
import { SessionAdd } from "components/WorkoutRoutines/Detail/SessionAdd";
import { SlotProgressionEdit } from "components/WorkoutRoutines/Detail/SlotProgressionEdit";
import { TemplateDetail } from "components/WorkoutRoutines/Detail/TemplateDetail";
import { WorkoutLogs } from "components/WorkoutRoutines/Detail/WorkoutLogs";
import { WorkoutStats } from "components/WorkoutRoutines/Detail/WorkoutStats";
import { PrivateTemplateOverview } from "components/WorkoutRoutines/Overview/PrivateTemplateOverview";
import { PublicTemplateOverview } from "components/WorkoutRoutines/Overview/PublicTemplateOverview";
import { RoutineOverview } from "components/WorkoutRoutines/Overview/RoutineOverview";
import {
    About,
    AddExercise,
    AddWeight,
    ApiPage,
    Calendar,
    CaloriesCalculator,
    Equipments,
    Ingredients,
    Login,
    Preferences,
    WeightOverview,
} from "pages";
import { ExerciseDetailPage } from "pages/ExerciseDetails";
import React from "react";
import { Route, Routes } from "react-router-dom";

/*
 * Routes for the application
 *
 * Don't change the routes of the elements which are also used in the django application
 * See also src/utils/url.ts
 */
export const WgerRoutes = () => {
    return (
        <Routes>
            <Route path="/:lang">
                <Route path="routine">
                    <Route index element={<RoutineOverview />} />
                    <Route path="overview" element={<RoutineOverview />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="add" element={<RoutineAdd />} />

                    <Route path=":routineId">
                        <Route path="day/:dayId">
                            <Route path="add-logs" element={<SessionAdd />} />
                        </Route>
                        <Route path="edit">
                            <Route index element={<RoutineEdit />} />
                            <Route path="progression/:slotId" element={<SlotProgressionEdit />} />
                        </Route>

                        <Route path="view" element={<RoutineDetail />} />
                        <Route path="table" element={<RoutineDetailsTable />} />
                        <Route path="logs" element={<WorkoutLogs />} />
                        <Route path="statistics" element={<WorkoutStats />} />
                    </Route>

                    <Route path="templates">
                        <Route path=":routineId">
                            <Route path="view" element={<TemplateDetail />} />
                        </Route>
                        <Route path="overview">
                            <Route path="private" element={<PrivateTemplateOverview />} />
                            <Route path="public" element={<PublicTemplateOverview />} />
                        </Route>
                    </Route>
                </Route>
                <Route path="measurement">
                    <Route index element={<MeasurementCategoryOverview />} />
                    <Route path="overview" element={<MeasurementCategoryOverview />} />
                    <Route path="category/:categoryId" element={<MeasurementCategoryDetail />}></Route>
                </Route>
                <Route path="exercise">
                    <Route index element={<ExerciseOverview />} />
                    <Route path="overview" element={<ExerciseOverview />} />
                    <Route path=":exerciseId" element={<ExerciseDetailPage />}>
                        <Route path="view" element={<ExerciseDetailPage />}>
                            <Route path=":slug" element={<ExerciseDetailPage />} />
                        </Route>
                    </Route>
                    <Route path="contribute" element={<AddExercise />} />
                </Route>
                <Route path="weight">
                    <Route path="overview" element={<WeightOverview />} />
                    <Route path="add" element={<AddWeight />} />
                </Route>
                <Route path="nutrition">
                    <Route path="overview" element={<PlansOverview />} />
                    <Route path=":planId">
                        <Route path="view" element={<PlanDetail />} />
                        <Route path=":date" element={<NutritionDiaryOverview />} />
                        <Route path="diary" element={<NutritionDiaryOverview />} />
                    </Route>
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
            <Route path="/" element={<ConfigurableDashboard />} />

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
    );
};
