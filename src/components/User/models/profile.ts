import { Adapter } from "utils/Adapter";

export class Profile {
    constructor(
        public username: string,
        public email: string,
        public emailVerified: boolean,
        public dateJoined: Date,
        public isTrustworthy: boolean,
        public useMetric: boolean,
        public height: number,
    ) {
    }
}

export class ProfileAdapter implements Adapter<Profile> {
    fromJson = (item: any) => new Profile(
        item.username,
        item.email,
        item.email_verified,
        new Date(item.date_joined),
        item.is_trustworthy,
        item.weight_unit === 'kg',
        item.height,
    );


    toJson = (item: Profile) => ({
        email: item.email,
        height: item.height,
        weight_unit: item.useMetric ? 'kg' : 'lb',
    });
}