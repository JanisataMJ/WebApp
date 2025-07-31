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

	

	//ไม่ใช้
	Title     		string    `valid:"required~Title is required,length(1|100)~Title must be between 1 and 100 characters"`
	CalendarDate 	time.Time `valid:"required~Start date is required"`
	AllDay    		bool      `valid:"-"` 

}