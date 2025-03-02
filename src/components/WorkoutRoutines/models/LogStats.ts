import { Adapter } from "utils/Adapter";

export class LogData {
    exercises: { [exerciseId: number]: number } = {};
    muscle: { [muscleId: number]: number } = {};
    upper_body: number = 0;
    lower_body: number = 0;
    total: number = 0;

    constructor(data?: Partial<LogData>) {
        Object.assign(this, data);

        // if (data) {
        //     this.exercises = data.exercises || {};
        //     this.muscle = data.muscle || {};
        //     this.upperBody = parseFloat(data.upper_body);
        //     this.lowerBody = parseFloat(data.lower_body);
        //     this.total = parseFloat(data.total);
        // }
    }
}

export class GroupedLogData {
    mesocycle: LogData = new LogData();
    iteration: { [iteration: number]: LogData } = {};
    weekly: { [week: number]: LogData } = {};
    daily: { [date: string]: LogData } = {};

    constructor(data?: Partial<GroupedLogData>) {
        Object.assign(this, data);
    }
}

export class RoutineStatsData {
    volume: GroupedLogData = new GroupedLogData();
    intensity: GroupedLogData = new GroupedLogData();
    sets: GroupedLogData = new GroupedLogData();


    constructor(data?: Partial<RoutineStatsData>) {
        Object.assign(this, data);
    }
}


export class RoutineStatsDataAdapter implements Adapter<RoutineStatsData> {

    fromJson(item: any): RoutineStatsData {

        const convertLogDataToClass = (logData: any): LogData => {

            const exercises: { [exerciseId: number]: number } = {};
            for (const exerciseId in logData.exercises) {
                exercises[parseInt(exerciseId)] = parseFloat(logData.exercises[exerciseId]);
            }

            const muscle: { [muscleId: number]: number } = {};
            for (const muscleId in logData.muscle) {
                muscle[parseInt(muscleId)] = parseFloat(logData.muscle[muscleId]);
            }

            return new LogData({
                exercises: exercises,
                muscle: muscle,
                upper_body: parseFloat(logData.upper_body),
                lower_body: parseFloat(logData.lower_body),
                total: parseFloat(logData.total),
            });
        };

        const convertGroupedLogDataToClass = (groupedLogData: GroupedLogData): GroupedLogData => {

            const iteration: { [key: number]: LogData } = {};
            for (const key in groupedLogData.iteration) {
                iteration[key] = convertLogDataToClass(groupedLogData.iteration[key]);
            }

            const weekly: { [key: number]: LogData } = {};
            for (const key in groupedLogData.weekly) {
                weekly[key] = convertLogDataToClass(groupedLogData.weekly[key]);
            }


            const daily: { [key: string]: LogData } = {};
            for (const key in groupedLogData.daily) {
                daily[key] = convertLogDataToClass(groupedLogData.daily[key]);
            }

            return new GroupedLogData({
                mesocycle: convertLogDataToClass(groupedLogData.mesocycle),
                iteration: iteration,
                weekly: weekly,
                daily: daily
            });
        };


        return new RoutineStatsData({
            volume: convertGroupedLogDataToClass(item.volume),
            intensity: convertGroupedLogDataToClass(item.intensity),
            sets: convertGroupedLogDataToClass(item.sets)
        });
    }

}