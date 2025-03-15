import { Adapter } from "utils/Adapter";

export interface EditProfileParams {
    email: string,
    height: number,
    weight_unit: 'kg' | 'lb',
    weight_rounding: number | null,
    repetitions_rounding: number | null,
}

export class Profile {
    public username: string;
    public email: string;
    public emailVerified: boolean;
    public dateJoined: Date;
    public isTrustworthy: boolean;
    public useMetric: boolean;
    public height: number;
    public weightRounding: number | null;
    public repetitionsRounding: number | null;

    constructor(data: {
        username: string,
        email: string,
        emailVerified: boolean,
        dateJoined: Date,
        isTrustworthy: boolean,
        useMetric: boolean,
        height: number,
        weightRounding: number | null,
        repetitionsRounding: number | null,
    }) {
        this.username = data.username;
        this.email = data.email;
        this.emailVerified = data.emailVerified;
        this.dateJoined = data.dateJoined;
        this.isTrustworthy = data.isTrustworthy;
        this.useMetric = data.useMetric;
        this.height = data.height;
        this.weightRounding = data.weightRounding;
        this.repetitionsRounding = data.repetitionsRounding;
    }
}

export class ProfileAdapter implements Adapter<Profile> {
    fromJson = (item: any): Profile => new Profile({
        username: item.username,
        email: item.email,
        emailVerified: item.email_verified,
        dateJoined: new Date(item.date_joined),
        isTrustworthy: item.is_trustworthy,
        useMetric: item.weight_unit === 'kg',
        height: item.height,
        weightRounding: item.weight_rounding !== null ? parseFloat(item.weight_rounding) : null,
        repetitionsRounding: item.repetitions_rounding !== null ? parseFloat(item.repetitions_rounding) : null,
    });


    toJson = (item: Profile): EditProfileParams => ({
        email: item.email,
        height: item.height,
        weight_unit: item.useMetric ? 'kg' : 'lb',
        weight_rounding: item.weightRounding,
        repetitions_rounding: item.repetitionsRounding,
    });
}