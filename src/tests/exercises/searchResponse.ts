import { Category } from "components/Exercises/models/category";
import { Exercise } from "components/Exercises/models/exercise";
import { Translation } from "components/Exercises/models/translation";

export const searchResponse: Exercise[] = [
    new Exercise({
        id: 998,
        uuid: "uuid-998",
        lastUpdateGlobal: new Date(),
        category: new Category(8, "Bauch"),
        equipment: [],
        muscles: [],
        musclesSecondary: [],
        images: [],
        variationGroup: null,
        translations: [
            new Translation({
                id: 1149,
                uuid: "uuid-1149",
                name: "Crunches an Negativbank",
                description: "",
                language: 1,
            })
        ],
        videos: [],
        authors: []
    }),
    new Exercise({
        id: 979,
        uuid: "uuid-979",
        lastUpdateGlobal: new Date(),
        category: new Category(11, "Brust"),
        equipment: [],
        muscles: [],
        musclesSecondary: [],
        images: [],
        variationGroup: null,
        translations: [
            new Translation({
                id: 1213,
                uuid: "uuid-1213",
                name: "Crunches am Seil",
                description: "",
                language: 1,
            })
        ],
        videos: [],
        authors: []
    })
];