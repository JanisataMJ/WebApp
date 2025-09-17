package entity

import (
	"time"
	"gorm.io/gorm"
)

type HealthData struct {
	gorm.Model
	Timestamp 		time.Time
	Bpm 			uint 	
	Steps 			int64  	
	SleepHours 		string	
	CaloriesBurned 	float64	
	Spo2 			float64 

	UserID 			uint
	User   			*User `gorm:"foreignKey: UserID"`

	HealthAnalysis		[]HealthAnalysis 	`gorm:"foreignKey:HealthDataID"`
}