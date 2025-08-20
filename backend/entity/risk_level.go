package entity

import (
	"gorm.io/gorm"
)

type RiskLevel struct {
	gorm.Model
	Rlevel string
	
	HealthAnalysis []HealthAnalysis `gorm:"foreignKey:RiskLevelID"`
}