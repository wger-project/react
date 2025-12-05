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
        variationId: null,
        translations: [
            new Translation(
                1149, // id
                "uuid-1149", // uuid
                "Crunches an Negativbank", // name
                "", // description
                1 // language (German)
            )
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
        variationId: null,
        translations: [
            new Translation(
                1213, // id
                "uuid-1213", // uuid
                "Crunches am Seil", // name
                "", // description
                1 // language (German)
            )
        ],
        videos: [],
        authors: []
    })
];