import { Category, CategoryAdapter, } from "components/Exercises/models/category";
import { Equipment, EquipmentAdapter, } from "components/Exercises/models/equipment";
import { ExerciseImage, ExerciseImageAdapter, } from "components/Exercises/models/image";
import { Language } from "components/Exercises/models/language";
import { Muscle, MuscleAdapter } from "components/Exercises/models/muscle";
import { Translation, TranslationAdapter } from "components/Exercises/models/translation";
import { ExerciseVideo, ExerciseVideoAdapter } from "components/Exercises/models/video";
import { Adapter } from "utils/Adapter";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";

export class Exercise {
    translations: Translation[] = [];
    videos: ExerciseVideo[] = [];
    authors: string[] = [];

    constructor(
        public id: number | null,
        public uuid: string | null,
        public category: Category,
        public equipment: Equipment[],
        public muscles: Muscle[],
        public musclesSecondary: Muscle[],
        public images: ExerciseImage[],
        public variationId: number | null,
        translations?: Translation[],
        videos?: ExerciseVideo[],
        authors?: string[]
        /*
            license: number,
            licenseAuthorS: string[],
         */
    ) {
        if (translations) {
            this.translations = translations;
        }

        if (videos) {
            this.videos = videos;
        }

        if (authors) {
            this.authors = authors;
        }
    }

    // Returns the users translation or english as a fallback
    //
    // Note that we still check for the case that no english translation can be
    // found. While this can't happen for the "regular" wger server, other local
    // instances might have deleted the english translation or added new exercises
    // without an english translation.
    getTranslation(userLanguage?: Language): Translation {
        const language = userLanguage != null ? userLanguage.id : ENGLISH_LANGUAGE_ID;

        let translation = this.translations.find(t => t.language === language);
        if (!translation) {
            translation = this.translations.find(t => t.language === ENGLISH_LANGUAGE_ID);
        }

        if (!translation) {
            //console.warn(`No translation found for exercise base ${this.uuid} (${this.id}) for language ${language}`);
            return this.translations[0];
        }
        return translation!;
    }


    /**
     * Returns a list with the available languages for this exercise
     */
    get availableLanguages(): number[] {
        return this.translations.map(t => t.language);
    }

    get mainImage(): ExerciseImage | undefined {
        return this.images.find(i => i.isMain);
    }

    get sideImages(): ExerciseImage[] {
        return this.images.filter(i => !i.isMain);
    }

}


export class ExerciseAdapter implements Adapter<Exercise> {
    /*
     * needs the items from exercisebaseinfo
     */
    fromJson(item: any): Exercise {
        const categoryAdapter = new CategoryAdapter();
        const equipmentAdapter = new EquipmentAdapter();
        const muscleAdapter = new MuscleAdapter();
        const imageAdapter = new ExerciseImageAdapter();
        const translationAdapter = new TranslationAdapter();
        const videoAdapter = new ExerciseVideoAdapter();

        const base = new Exercise(
            item.id,
            item.uuid,
            categoryAdapter.fromJson(item.category),
            item.equipment.map((e: any) => (equipmentAdapter.fromJson(e))),
            item.muscles.map((m: any) => (muscleAdapter.fromJson(m))),
            item.muscles_secondary.map((m: any) => (muscleAdapter.fromJson(m))),
            item.images.map((i: any) => (imageAdapter.fromJson(i))),
            item.variations,
            item.exercises.map((t: any) => translationAdapter.fromJson(t)),
            item.videos.map((t: any) => videoAdapter.fromJson(t)),
            item.author_history
        );

        if (!base.translations.some(t => t.language === ENGLISH_LANGUAGE_ID)) {
            console.info(`No english translation found for exercise base ${base.uuid}!`);
        }

        if (base.translations.length === 0) {
            throw new Error(`No translations found for exercise base ${base.uuid}!`);
        }

        return base;
    }

    /**
     * Don't return all properties, since not all items can be updated (they would
     * be ignored by the server, but it's better to not send too much anyway)
     */
    toJson(item: Exercise) {
        return {
            id: item.id,
            uuid: item.uuid,
            category: item.category.id,
            equipment: item.equipment.map(e => e.id),
            muscles: item.muscles.map(m => m.id),
            // eslint-disable-next-line camelcase
            muscles_secondary: item.musclesSecondary.map(m => m.id),
            images: item.images.map(i => new ExerciseImageAdapter().toJson(i)),
        };
    }
}

export type ImageFormData = {
    url: string;
    file: File;
};

