import React from 'react';
import styles from './App.module.css';
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
    ExerciseDetails,
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


function App() {

    return (
        <div className={styles.app}>
            <Header />
            <Notifications />
            <Routes>
                <Route path="/" element={<Dashboard />} />
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
                <Route path="exercises">
                    <Route index element={<ExerciseOverview />} />
                    <Route path=":exerciseID" element={<ExerciseDetails />} />
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
                    <Route path="add" element={<AddExercise />} />
                </Route>
                <Route path="login" element={<Login />} />
                <Route path="user">
                    <Route path="preferences" element={<Preferences />} />
                </Route>
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
        </div>
    );
}

export default App;
