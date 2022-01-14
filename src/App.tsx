import React from 'react';
import styles from './App.module.css';
import {
    Header,
} from './components';
import {useTranslation} from "react-i18next";
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
import { setNotification, useStateValue } from 'state';
import { Alert, AlertTitle } from '@mui/lab';


function App() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [state, dispatch] = useStateValue();

    return (
        <div className={styles.app}>
            <Header />
            {state.notification.notify ? <Alert
                                            className={styles.notification}
                                            severity={state.notification.severity}
                                            onClose={() => dispatch(setNotification({notify: false, message: "", severity: undefined, title: ""}))}
                                            // variant="filled"
                                        >
                                            <AlertTitle>{state.notification.title}</AlertTitle>
                                            <strong>{state.notification.message}</strong>
                                        </Alert> : null}
            <Routes>
                <Route path="/">
                    <Route path="workout">
                        <Route path="overview" element={<Workout />}></Route>
                        <Route path="schedule" element={<WorkoutSchedule />}></Route>
                        <Route path="calendar">
                            <Route path="user" element={<Calendar />}></Route>
                        </Route>
                        <Route path="gallery" element={<Gallery />}></Route>

                        <Route path="template">
                            <Route path="overview" element={<TemplatePage />}></Route>
                            <Route path="public" element={<PublicTemplate />}></Route>
                        </Route>
                    </Route>
                    <Route path="exercise">
                        <Route path="category" element={<ExerciseCategory />}></Route>
                        <Route path="muscle" element={<MuscleExercise />}></Route>
                        <Route path="equipment" element={<Equipments />}></Route>
                        <Route path="add" element={<AddExercise />}></Route>
                    </Route>
                    <Route path="weight">
                        <Route path="overview" element={<WeightOverview />}></Route>
                        <Route path="add" element={<AddWeight />}></Route>
                    </Route>
                    <Route path="nutrition">
                        <Route path="overview" element={<NutritionPlans />}></Route>
                        <Route path="calculator">
                            <Route path="bmi" element={<BmiCalculator />}></Route>
                            <Route path="calories" element={<CaloriesCalculator />}></Route>
                        </Route>
                        <Route path="ingredient">
                            <Route path="overview" element={<Ingredients />}></Route>
                        </Route>
                    </Route>
                    <Route path="software">
                        <Route path="about-us" element={<About />}></Route>
                        <Route path="api" element={<ApiPage />}></Route>
                        <Route path="equipment" element={<Equipments />}></Route>
                        <Route path="add" element={<AddExercise />}></Route>
                    </Route>
                    <Route path="login" element={<Login />}></Route>
                    <Route path="user">
                        <Route path="preferences" element={<Preferences />}></Route>
                    </Route>
                </Route>
            </Routes>
        </div>
    );
}

export default App;
