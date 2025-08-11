package entity

import (
	"time"
	"gorm.io/gorm"
)

type HealthData struct {
	gorm.Model
	Timestamp 		time.Time
	Bpm 			uint
	Steps 			uint
	SleepHours 		float64
	CaloriesBurned 	float64
	Spo2 			float64
	BodyTemp 		float64

	UserID 			uint
	User   			*User `gorm:"foreignKey: UserID"`

	// Many-to-Many
	AnalysisResults []AnalysisResult `gorm:"many2many:HealthDataAnalysis;"`
}