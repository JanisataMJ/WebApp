package entity

import (
	"time"
	"gorm.io/gorm"
)

type MoodData struct {
	gorm.Model
	Date 		time.Time
	Water 		string
	ShortNote 	string

	UserID 			uint
	User   			*User `gorm:"foreignKey: UserID"`

	StressLevelID 	uint
	StressLevel   	*StressLevel `gorm:"foreignKey: StressLevelID"`

	MoodID 			uint
	Mood   			*Mood `gorm:"foreignKey: MoodID"`

	ToDoList		[]ToDoList 	`gorm:"foreignKey:MoodDataID"`
}