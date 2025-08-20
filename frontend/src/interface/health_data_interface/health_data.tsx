export interface HealthDataInterface {
    ID:             number;       
    Timestamp:      string;           
    Bpm:            number;  
    Steps:          number;     
    SleepHours:     number;    
    CaloriesBurned: number;
    Spo2:           number;
    BodyTemp:       number;
    UserID?:        number;  
}