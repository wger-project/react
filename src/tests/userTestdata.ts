import { Profile } from "components/User/models/profile";

export const testProfileDataVerified = new Profile({
    username: 'admin',
    email: 'root@example.com',
    emailVerified: true,
    dateJoined: new Date("2022-04-27 17:52:38.867000+00:00"),
    isTrustworthy: true,
    useMetric: true,
    height: 180,
    weightRounding: null,
    repetitionsRounding: null,
});

export const testProfileDataNotVerified = new Profile({
    username: 'user',
    email: 'hi@example.com',
    emailVerified: false,
    dateJoined: new Date(2022, 3, 27, 19, 52, 38, 867),
    isTrustworthy: false,
    useMetric: true,
    height: 180,
    weightRounding: null,
    repetitionsRounding: null,
});

export const testProfileApiResponse = {
    username: 'admin',
    email: 'root@example.com',
    // eslint-disable-next-line camelcase
    email_verified: true,
    // eslint-disable-next-line camelcase
    date_joined: "2022-04-27 17:52:38.867000+00:00",
    // eslint-disable-next-line camelcase
    is_trustworthy: true,
    weight_unit: 'kg',
    height: 180,
    weight_rounding: null,
    repetitions_rounding: null,
};
