package entity

import (
	"time"
	"gorm.io/gorm"
)

type HealthSummary struct {
	gorm.Model
	PeriodStart 	time.Time
	PeriodEnd 		time.Time
	AvgBpm 			float64
	MinBpm 			uint
	MaxBpm 			uint
	AvgSteps 		float64
	TotalSteps 		int
	AvgSleep		float64
	AvgCalories		float64
	AvgSpo2 		float64
	AvgBodyTemp 	float64
	MinBodyTemp 	float64
	MaxBodyTemp 	float64

	UserID 			uint
	User   			*User `gorm:"foreignKey: UserID"`

	Notification	[]Notification 	`gorm:"foreignKey:HealthSummaryID"`
}