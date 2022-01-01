import { Link } from 'react-router-dom';

export const NutritionSubMenu = () => {
    return (
        <>
            <li><Link to="/nutrition/overview">Nutritions Plan</Link></li>
            <li><Link to="/nutrition/calculator/bmi">BMI Calculator</Link></li>
            <li><Link to="/nutrition/calculator/calories">Daily calories calculator</Link></li>
            <li><Link to="/nutrition/ingredient/overview">Ingredient overview</Link></li>
        </>
    );
};
