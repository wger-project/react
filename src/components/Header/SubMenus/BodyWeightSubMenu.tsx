import { Link } from 'react-router-dom';

export const BodyWeightSubMenu = () => {

    return (
            <>
                <li><Link to="/weight/overview">Weight Overview</Link></li>
                <li><Link to="weight/add">Add Weight</Link></li>
            </>
    );
};
