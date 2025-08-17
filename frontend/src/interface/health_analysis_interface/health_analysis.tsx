export interface HealthAnalysisInterface {
    ID:                 number;       
    Category:           string;           
    Value:              string;   
    Interpretation:     string;
    Suggestion:         string;         
    HealthDataID?:      number;   
    RiskLevelID?:       number;   
}