package entity

import (
	"time"
	"gorm.io/gorm"
)

type HealthData struct {
	gorm.Model
	Timestamp 		time.Time
	Bpm 			uint 	// ดึงได้
	Steps 			int64  	// ดึงได้
	SleepHours 		string	// ดึงได้
	CaloriesBurned 	float64	// ดึงได้
	Spo2 			float64 // ดึงได้
	BodyTemp 		float64

	UserID 			uint
	User   			*User `gorm:"foreignKey: UserID"`

	HealthAnalysis		[]HealthAnalysis 	`gorm:"foreignKey:HealthDataID"`
}