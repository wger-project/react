import { Link } from 'react-router-dom';

export const TrainingSubMenu = () => {

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
                <li><Link to="/exercise/category">Exercise overview</Link></li>
            </div>
            <div><Link to="/exercise/add">Add new exercise</Link></div>
        </>
    );
};
