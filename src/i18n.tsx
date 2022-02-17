import { useTranslation } from "react-i18next";

export const DummyComponent = () => {
    const [t, i18n] = useTranslation();


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
    t("Anterior deltoid");
    t("Biceps brachii");
    t("Biceps femoris");
    t("Brachialis");
    t("Erector spinae");
    t("Gastrocnemius");
    t("Gluteus maximus");
    t("Latissimus dorsi");
    t("Obliquus externus abdominis");
    t("Pectoralis major");
    t("Quadriceps femoris");
    t("Rectus abdominis");
    t("Serratus anterior");
    t("Soleus");
    t("Trapezius");
    t("Triceps brachii");
    t("Kilometers");
    t("Miles");
    t("Minutes");
    t("Repetitions");
    t("Seconds");
    t("Until Failure");

    return (<p>Dummy</p>);
};