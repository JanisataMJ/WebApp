import { HealthAnalysisInterface } from "../health_analysis_interface/health_analysis";

export interface HealthDataInterface {
    ID:             number;       
    Timestamp:      string;           
    Bpm:            number;  
    Steps:          number;     
    SleepHours:     string;    
    CaloriesBurned: number;
    Spo2:           number;
    BodyTemp:       number;
    UserID?:        number;  

    HealthAnalysis?: HealthAnalysisInterface[];  
}