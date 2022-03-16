import { useTranslation } from "react-i18next";

export const DummyComponent = () => {
    const [t] = useTranslation();


    t("exercises.arms");
    t("exercises.back");
    t("exercises.calves");
    t("exercises.chest");
    t("exercises.legs");
    t("exercises.shoulders");
    t("exercises.barbell");
    t("exercises.bench");
    t("exercises.dumbbell");
    t("exercises.gym_mat");
    t("exercises.incline_bench");
    t("exercises.kettlebell");
    t("exercises.pull-up_bar");
    t("exercises.sz-bar");
    t("exercises.swiss_ball");
    t("exercises.none_(bodyweight_exercise)");
    t("exercises.kilometers");
    t("exercises.miles");
    t("exercises.minutes");
    t("exercises.repetitions");
    t("exercises.seconds");
    t("exercises.until_failure");

    return (<p>Dummy</p>);
};