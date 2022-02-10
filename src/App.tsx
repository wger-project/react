import React from 'react';
import styles from './App.module.css';
import { Header, } from './components';
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
    ExerciseCategory,
    Gallery,
    Ingredients,
    Login,
    MuscleExercise,
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


function App() {

    return (
        <div className={styles.app}>
            <Header />
             <Notifications />
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route>
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
                        <Route path="category" element={<ExerciseCategory />} />
                        <Route path="muscle" element={<MuscleExercise />} />
                        <Route path="equipment" element={<Equipments />} />
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
                </Route>
            </Routes>
        </div>
    );
}

export default App;
