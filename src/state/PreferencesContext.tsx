import React, { createContext, useContext, useEffect, useState } from "react";

type PreferencesContextType = {
    // Submenus
    showTraining: boolean;
    showBodyWeight: boolean;
    showMeasurements: boolean;
    showNutrition: boolean;

    // Training submenu items
    showRoutineOverview: boolean;
    showPrivateTemplate: boolean;
    showPublicTemplate: boolean;
    showExerciseOverview: boolean;
    showExerciseContribute: boolean;
    showCalendar: boolean;

    // Setters
    setShowTraining: (v: boolean) => void;
    setShowBodyWeight: (v: boolean) => void;
    setShowMeasurements: (v: boolean) => void;
    setShowNutrition: (v: boolean) => void;
    setShowRoutineOverview: (v: boolean) => void;
    setShowPrivateTemplate: (v: boolean) => void;
    setShowPublicTemplate: (v: boolean) => void;
    setShowExerciseOverview: (v: boolean) => void;
    setShowExerciseContribute: (v: boolean) => void;
    setShowCalendar: (v: boolean) => void;
};

export const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Main submenus
    const [showTraining, setShowTraining] = useState(true);
    const [lastTraining, setLastTraining] = useState([true, true, true, true, true, true]);
    const [showBodyWeight, setShowBodyWeight] = useState(true);
    const [showMeasurements, setShowMeasurements] = useState(true);
    const [showNutrition, setShowNutrition] = useState(true);

    // Training submenu items
    const [showRoutineOverview, setShowRoutineOverview] = useState(true);
    const [showPrivateTemplate, setShowPrivateTemplate] = useState(true);
    const [showPublicTemplate, setShowPublicTemplate] = useState(true);
    const [showExerciseOverview, setShowExerciseOverview] = useState(true);
    const [showExerciseContribute, setShowExerciseContribute] = useState(true);
    const [showCalendar, setShowCalendar] = useState(true);

    // --- Helpers to prevent disabling all ---
    const countVisibleMain = [showTraining, showBodyWeight, showMeasurements, showNutrition].filter(Boolean).length;
    const countVisibleTraining = [
        showRoutineOverview,
        showPrivateTemplate,
        showPublicTemplate,
        showExerciseOverview,
        showExerciseContribute,
        showCalendar,
    ].filter(Boolean).length;

    // Wrapper to protect at least one visible item
    const safeToggle = (setter: (v: boolean) => void, current: boolean, groupCount: number) => (next: boolean) => {
        if (groupCount === 1 && current && !next) {
            alert("At least one item must remain visible.");
            return;
        }
        setter(next);
    };

    const safeToggleItem =
        (setter: (v: boolean) => void, current: boolean, groupCount: number, groupSubMenu: boolean) =>
        (next: boolean) => {
            if (groupCount === 1 && current && !next) {
                alert("At least one item must remain visible.");
                return;
            }
            if (!groupSubMenu && next) {
                const updated = [...lastTraining];
                if (setter === setShowRoutineOverview) updated[0] = next;
                if (setter === setShowPrivateTemplate) updated[1] = next;
                if (setter === setShowPublicTemplate) updated[2] = next;
                if (setter === setShowExerciseOverview) updated[3] = next;
                if (setter === setShowExerciseContribute) updated[4] = next;
                if (setter === setShowCalendar) updated[5] = next;
                setter(next);
                setLastTraining(updated);
                setShowTraining(true);
                return;
            }

            setter(next);
        };

    useEffect(() => {
        if (!showTraining) {
            setLastTraining([
                showRoutineOverview,
                showPrivateTemplate,
                showPublicTemplate,
                showExerciseOverview,
                showExerciseContribute,
                showCalendar,
            ]);
            setShowRoutineOverview(false);
            setShowPrivateTemplate(false);
            setShowPublicTemplate(false);
            setShowExerciseOverview(false);
            setShowExerciseContribute(false);
            setShowCalendar(false);
        } else {
            setShowRoutineOverview(lastTraining[0]);
            setShowPrivateTemplate(lastTraining[1]);
            setShowPublicTemplate(lastTraining[2]);
            setShowExerciseOverview(lastTraining[3]);
            setShowExerciseContribute(lastTraining[4]);
            setShowCalendar(lastTraining[5]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showTraining]);

    return (
        <PreferencesContext.Provider
            value={{
                showTraining,
                showBodyWeight,
                showMeasurements,
                showNutrition,
                showRoutineOverview,
                showPrivateTemplate,
                showPublicTemplate,
                showExerciseOverview,
                showExerciseContribute,
                showCalendar,

                setShowTraining: safeToggle(setShowTraining, showTraining, countVisibleMain),
                setShowBodyWeight: safeToggle(setShowBodyWeight, showBodyWeight, countVisibleMain),
                setShowMeasurements: safeToggle(setShowMeasurements, showMeasurements, countVisibleMain),
                setShowNutrition: safeToggle(setShowNutrition, showNutrition, countVisibleMain),

                setShowRoutineOverview: safeToggleItem(
                    setShowRoutineOverview,
                    showRoutineOverview,
                    countVisibleTraining,
                    showTraining
                ),
                setShowPrivateTemplate: safeToggleItem(
                    setShowPrivateTemplate,
                    showPrivateTemplate,
                    countVisibleTraining,
                    showTraining
                ),
                setShowPublicTemplate: safeToggleItem(
                    setShowPublicTemplate,
                    showPublicTemplate,
                    countVisibleTraining,
                    showTraining
                ),
                setShowExerciseOverview: safeToggleItem(
                    setShowExerciseOverview,
                    showExerciseOverview,
                    countVisibleTraining,
                    showTraining
                ),
                setShowExerciseContribute: safeToggleItem(
                    setShowExerciseContribute,
                    showExerciseContribute,
                    countVisibleTraining,
                    showTraining
                ),
                setShowCalendar: safeToggleItem(setShowCalendar, showCalendar, countVisibleTraining, showTraining),
            }}
        >
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const ctx = useContext(PreferencesContext);
    if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
    return ctx;
};
