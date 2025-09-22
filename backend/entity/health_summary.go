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
	WeekNumber		uint

	UserID 			uint
	User   			*User `gorm:"foreignKey: UserID"`

	TrendsID 				uint
	Trends   				*Trends `gorm:"foreignKey: TrendsID"` 

	RiskLevelID				uint
	RiskLevel   			*RiskLevel `gorm:"foreignKey: RiskLevelID"`

	Notification	[]Notification 	`gorm:"foreignKey:HealthSummaryID"`
}