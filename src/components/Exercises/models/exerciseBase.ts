import { Adapter } from "utils/Adapter";
import { ExerciseImage, ExerciseImageAdapter, } from "components/Exercises/models/image";
import { Equipment, EquipmentAdapter, } from "components/Exercises/models/equipment";
import { Muscle, MuscleAdapter } from "components/Exercises/models/muscle";
import { Category, CategoryAdapter, } from "components/Exercises/models/category";
import {
    ExerciseTranslation,
    ExerciseTranslationAdapter
} from "components/Exercises/models/exerciseTranslation";
import { ENGLISH_LANGUAGE_ID } from "utils/consts";
import { Language } from "components/Exercises/models/language";
import { ExerciseVideo, ExerciseVideoAdapter } from "components/Exercises/models/video";

export class ExerciseBase {
    translations: ExerciseTranslation[] = [];
    videos: ExerciseVideo[] = [];

    constructor(
        public id: number | null,
        public uuid: string | null,
        public category: Category,
        public equipment: Equipment[],
        public muscles: Muscle[],
        public musclesSecondary: Muscle[],
        public images: ExerciseImage[],
        public variationId: number | null,
        translations?: ExerciseTranslation[],
        videos?: ExerciseVideo[]
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
    }

    // Returns the users translation or english as a fallback
    //
    // Note that we still check for the case that no english translation can be
    // found. While this can't happen for the "regular" wger server, other local
    // instances might have deleted the english translation or added new exercises
    // without an english translation.
    getTranslation(userLanguage?: Language): ExerciseTranslation {
        const language = userLanguage != null ? userLanguage.id : ENGLISH_LANGUAGE_ID;

        let translation = this.translations.find(t => t.language === language);
        if (!translation) {
            translation = this.translations.find(t => t.language === ENGLISH_LANGUAGE_ID);
        }

        if (!translation) {
            console.warn(`No translation found for exercise base ${this.uuid} (${this.id}) for language ${language}`);
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


export class ExerciseBaseAdapter implements Adapter<ExerciseBase> {
    /*
     * needs the items from exercisebaseinfo
     */
    fromJson(item: any): ExerciseBase {
        const categoryAdapter = new CategoryAdapter();
        const equipmentAdapter = new EquipmentAdapter();
        const muscleAdapter = new MuscleAdapter();
        const imageAdapter = new ExerciseImageAdapter();
        const translationAdapter = new ExerciseTranslationAdapter();
        const videoAdapter = new ExerciseVideoAdapter();

        const base = new ExerciseBase(
            item.id,
            item.uuid,
            categoryAdapter.fromJson(item.category),
            item.equipment.map((e: any) => (equipmentAdapter.fromJson(e))),
            item.muscles.map((m: any) => (muscleAdapter.fromJson(m))),
            item.muscles_secondary.map((m: any) => (muscleAdapter.fromJson(m))),
            item.images.map((i: any) => (imageAdapter.fromJson(i))),
            item.variations,
            /*
            item.license,
            item.license_author,
            */
        );

        base.translations = item.exercises.map((t: any) => translationAdapter.fromJson(t));
        //base.videos = item.videos.map((t: any) => videoAdapter.fromJson(t));

        if (!base.translations.some(t => t.language === ENGLISH_LANGUAGE_ID)) {
            console.info(`No english translation found for exercise base ${base.uuid}!`);
        }

        if (base.translations.length === 0) {
            console.error(`No translations found for exercise base ${base.uuid}!`);
        }

        return base;
    }

    /**
     * Don't return all properties, since not all items can be updated (they would
     * be ignored by the server, but it's better to not send too much anyway)
     */
    toJson(item: ExerciseBase): any {
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

