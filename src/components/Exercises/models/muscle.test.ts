import { Muscle } from "components/Exercises/models/muscle";


describe("Muscle model tests", () => {

    test('Test name helper', () => {

        // Arrange
        const m1 = new Muscle(2, "Anterior deltoid", "Shoulders", true);
        const m2 = new Muscle(2, "Anterior deltoid", "", true);

        // Assert
        expect(m1.getName()).toBe("Anterior deltoid (Shoulders)");
        expect(m2.getName()).toBe("Anterior deltoid");
    });
});

