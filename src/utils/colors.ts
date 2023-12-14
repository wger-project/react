import { LIST_OF_COLORS3, LIST_OF_COLORS5, LIST_OF_COLORS8 } from "utils/consts";

export function* generateChartColors(nrOfItems: number) {

    let colors;
    if (nrOfItems <= 3) {
        colors = LIST_OF_COLORS3;
    } else if (nrOfItems <= 5) {
        colors = LIST_OF_COLORS5;
    } else {
        colors = LIST_OF_COLORS8;
    }

    for (const i of colors) {
        yield i;
    }
}
