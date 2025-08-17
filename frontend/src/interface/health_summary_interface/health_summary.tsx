export interface HealthSummaryInterface {
    ID:             number;       
    PeriodStart:    string;    
    PeriodEnd:      string;           
    AvgBpm:         number;  
    MinBpm:         number;     
    MaxBpm:         number;    
    AvgSteps:       number;
    TotalSteps:     number;
    AvgSleep:       number;
    AvgCalories:    number;
    AvgSpo2:        number;
    AvgBodyTemp:    number;
    MinBodyTemp:    number;
    MaxBodyTemp:    number;
    UserID?:        number;  
}