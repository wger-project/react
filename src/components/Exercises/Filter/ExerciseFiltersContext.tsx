import { createContext } from 'react';
import { Equipment } from '../models/equipment';
import { Muscle } from '../models/muscle';
import { Category } from '../models/category';


type ExerciseContext = {
    selectedEquipment: Equipment[];
    setSelectedEquipment: (equipment: Equipment[]) => void;
    selectedMuscles: Muscle[];
    setSelectedMuscles: (muscles: Muscle[]) => void;
    selectedCategories: Category[];
    setSelectedCategories: (exercises: Category[]) => void;
}

export const ExerciseFiltersContext = createContext<ExerciseContext>({} as unknown as ExerciseContext);
