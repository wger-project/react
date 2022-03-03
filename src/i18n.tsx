import { useTranslation } from "react-i18next";

export const DummyComponent = () => {
    const [t] = useTranslation();


    t("Abs");
    t("Arms");
    t("Back");
    t("Calves");
    t("Chest");
    t("Legs");
    t("Shoulders");
    t("Barbell");
    t("Bench");
    t("Dumbbell");
    t("Gym mat");
    t("Incline bench");
    t("Kettlebell");
    t("Pull-up bar");
    t("SZ-Bar");
    t("Swiss Ball");
    t("none (bodyweight exercise)");
    t("Kilometers");
    t("Miles");
    t("Minutes");
    t("Repetitions");
    t("Seconds");
    t("Until Failure");

    return (<p>Dummy</p>);
};