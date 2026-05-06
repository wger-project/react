import axios from "axios";
import { Profile } from "@/components/User/models/profile";
import { editProfile, getProfile } from "@/services";
import { testProfileApiResponse, testProfileDataVerified } from "@/tests/userTestdata";
import type { Mock } from 'vitest';

vi.mock("axios");


describe("Profile API tests", () => {

    beforeEach(() => {
        vi.resetAllMocks();
    });


    test('get the user profile (logged in)', async () => {

        // Arrange
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: testProfileApiResponse }));

        // Act
        const result = await getProfile();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(testProfileDataVerified);
    });

    test('get the user profile (logged out)', async () => {

        // Arrange
        (axios.get as Mock).mockImplementation(() => Promise.reject(new Error("403")));

        // Act
        const result = await getProfile();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(result).toEqual(null);
    });

    test('editProfile renames weightRounding/repetitionsRounding to snake_case keys', async () => {
        (axios.post as Mock).mockResolvedValue({ data: testProfileApiResponse });

        const result = await editProfile({
            email: "new@example.com",
            height: 175,
            weightRounding: 2.5,
            repetitionsRounding: 1,
        });

        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/userprofile\/$/);
        expect(body).toEqual({
            email: "new@example.com",
            height: 175,
            // eslint-disable-next-line camelcase
            weight_rounding: 2.5,
            // eslint-disable-next-line camelcase
            repetition_rounding: 1,
        });
        expect(result).toBeInstanceOf(Profile);
    });

    test('editProfile omits the rounding fields when they are undefined', async () => {
        (axios.post as Mock).mockResolvedValue({ data: testProfileApiResponse });

        await editProfile({ email: "x@example.com", height: 180 });

        const [, body] = (axios.post as Mock).mock.calls[0];
        expect(body).toEqual({ email: "x@example.com", height: 180 });
        expect(body).not.toHaveProperty("weight_rounding");
        expect(body).not.toHaveProperty("repetition_rounding");
    });

    test('editProfile sends null rounding values explicitly (different from undefined)', async () => {
        (axios.post as Mock).mockResolvedValue({ data: testProfileApiResponse });

        await editProfile({
            weightRounding: null,
            repetitionsRounding: null,
        });

        const [, body] = (axios.post as Mock).mock.calls[0];
        // eslint-disable-next-line camelcase
        expect(body).toEqual({ weight_rounding: null, repetition_rounding: null });
    });
});
