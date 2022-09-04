import { Patient } from './patient';

export class VitalSign {
    idVitalSign: number;
    patient: Patient;
    temperature: string;
    pulse: string;
    swing: string;
    vitalSignDate:string;
}
