import { HealthAnalysisInterface } from "../health_analysis_interface/health_analysis";

export interface RealTimeInterface {
    ID:             number;       
    Timestamp:           string;       
    Bpm:        number;
    Steps:          number;
    SleepHours:    number;
    CaloriesBurned:       number;
    Spo2:       number;

    HealthAnalysis: HealthAnalysisInterface[]; 
}