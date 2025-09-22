export interface HealthSummaryInterface {
    ID:             number;       
    period_start:    string;    
    period_end:      string;           
    avg_bpm:         number;  
    min_bpm:         number;     
    max_bpm:         number;    
    avg_steps:       number;
    total_steps:     number;
    avg_sleep:       number;
    avg_calories:    number;
    avg_spo2:        number;
    risk_level:      string; 
    UserID?:         number;  
}