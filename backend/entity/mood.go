package entity

import (
	"gorm.io/gorm"
)

type Mood struct {
	gorm.Model
	Emotion string
	
	MoodData []MoodData `gorm:"foreignKey:MoodID"`
}