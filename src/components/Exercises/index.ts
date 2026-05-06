/**
 * Public surface of the Exercises domain.
 *
 * Other code may only import from `@/components/Exercises`, never from
 * internal sub-paths.
 */
export { AddExerciseStepper } from "./screens/Add/AddExerciseStepper";
export { NotEnoughRights } from "./screens/Add/NotEnoughRights";
export { ExerciseDetails } from "./screens/Detail/ExerciseDetails";
export { ExerciseImageAvatar } from "./screens/Detail/ExerciseImageAvatar";
export { ExerciseOverview } from "./screens/ExerciseOverview";
export { NameAutocompleter } from "./widgets/Filter/NameAutcompleter";

// Models
export { Alias, AliasAdapter } from "./models/alias";
export { Category, CategoryAdapter } from "./models/category";
export { Equipment, EquipmentAdapter } from "./models/equipment";
export { Exercise, ExerciseAdapter, type ImageFormData } from "./models/exercise";
export { ExerciseImage, ExerciseImageAdapter, ImageStyle } from "./models/image";
export { getLanguageByShortName, Language, LanguageAdapter } from "./models/language";
export { Muscle, MuscleAdapter } from "./models/muscle";
export { Note, NoteAdapter } from "./models/note";
export { Translation, TranslationAdapter } from "./models/translation";
export { ExerciseVideo, ExerciseVideoAdapter } from "./models/video";

// Query hooks
export { useLanguageQuery, useMusclesQuery } from "./queries";
