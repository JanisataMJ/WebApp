package entity

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username  	string
	Password  	string
	Email     	string
	FirstName 	string
	LastName  	string
	Birthdate 	time.Time
	Phonenumber	string
	Picture		string
	Height		float64
	weight		float64
	bust		float64
	waist		float64
	hip			float64

	RoleID 		uint
	Role   		*Role `gorm:"foreignKey: RoleID" `

	GenderID 	uint
	Gender   	*Gender `gorm:"foreignKey: GenderID"`

	AnalysisResult		[]AnalysisResult 	`gorm:"foreignKey:UserID"`
	HealthData 			[]HealthData 		`gorm:"foreignKey:UserID"`
	SmartwatchDevice 	*SmartwatchDevice 	`gorm:"foreignKey:UserID"`
	MoodData 			[]MoodData 			`gorm:"foreignKey:UserID"`
	Notification 		[]Notification 		`gorm:"foreignKey:UserID"`
}
