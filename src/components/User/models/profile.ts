/* eslint-disable camelcase */

import { Adapter } from "@/core/lib/Adapter";

// Note that the email is read-only in the API, it is managed via allauth
export interface EditProfileParams {
    height: number,
    weight_unit: 'kg' | 'lb',
    weightRounding: number | null,
    repetitionsRounding: number | null,
    time_zone: string,
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
    public timeZone: string;

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
        timeZone: string,
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
        this.timeZone = data.timeZone;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(json: any) {
        return adapter.fromJson(json);
    }

    toJson() {
        return adapter.toJson(this);
    }
}

class ProfileAdapter implements Adapter<Profile> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        timeZone: item.time_zone ?? '',
    });


    toJson = (item: Profile) => ({
        email: item.email,
        height: item.height,
        weight_unit: item.useMetric ? 'kg' : 'lb',
        weight_rounding: item.weightRounding,
        repetitions_rounding: item.repetitionsRounding,
        time_zone: item.timeZone,
    });
}


const adapter = new ProfileAdapter();