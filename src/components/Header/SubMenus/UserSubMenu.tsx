import { Link } from 'react-router-dom';

export const UserSubMenu = () => {
    return (
        <>
            <li><Link to="/user/preferences"> My Preferences</Link></li>
            <li><Link to="/login"> 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
            </Link></li>
        </>
    );
};
