package entity

import (
	"gorm.io/gorm"
)

type HealthAnalysis struct {
	gorm.Model
	Category 		string
	Value          	string   // เช่น "38.5°C"
    Interpretation 	string   // เช่น "High Fever"
    Suggestion     	string   // เช่น "ควรพักผ่อนและดื่มน้ำ" หรือ "พบแพทย์"
	
	HealthDataID 			uint
	HealthData   			*HealthData `gorm:"foreignKey: HealthDataID"`

	RiskLevelID 			uint
	RiskLevel   			*RiskLevel `gorm:"foreignKey: RiskLevelID"`

	Notification	[]Notification 	`gorm:"foreignKey:HealthAnalysisID"`
}