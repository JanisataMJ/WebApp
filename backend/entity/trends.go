package entity

import (
	"gorm.io/gorm"
)

type Trends struct {
	gorm.Model
	Trend string
	
	HealthSummary []HealthSummary `gorm:"foreignKey:TrendsID"`
}