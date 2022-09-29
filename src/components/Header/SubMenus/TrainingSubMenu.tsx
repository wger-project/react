import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";

export const TrainingSubMenu = () => {

    const { i18n } = useTranslation();

    return (
        <>
            <div>
                <li><Link to="workout/overview">Workout</Link></li>
                <li><Link to="workout/schedule">Workout Schedule</Link></li>
                <li><Link to="workout/calendar/user">Calendar</Link></li>
                <li><Link to="workout/gallery">Gallery</Link></li>
            </div>
            <div>
                <p>Workout templates</p>
                <li><Link to="workout/template/overview">Your Templates</Link></li>
                <li><Link to="workout/template/public">Public Templates</Link></li>
            </div>
            <div>
                <li><Link to={i18n.language + '/exercise/overview'}>Exercises</Link></li>
            </div>
            <div>
                <li><Link to={i18n.language + '/exercise/contribute'}>Add new exercise</Link></li>
            </div>
        </>
    );
};
