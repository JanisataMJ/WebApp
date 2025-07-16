package entity

import (
	"gorm.io/gorm"
)

type StressLevel struct {
	gorm.Model
	Level uint
	
	MoodData []MoodData `gorm:"foreignKey:StressLevelID"`
}