package entity

import (
	"gorm.io/gorm"
)

type ToDoList struct {
	gorm.Model
	List			string

	MoodDataID 		uint
	MoodData   		*MoodData `gorm:"foreignKey: MoodDataID"`
}