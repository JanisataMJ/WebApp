package entity

import (
	"time"
	"gorm.io/gorm"
)

type Admin struct {
	gorm.Model
	Username  	string
	Password  	string
	Email     	string
	FirstName 	string
	LastName  	string
	Birthdate 	time.Time
	Phonenumber	string
	Picture		string

	RoleID 		uint
	Role   		*Role `gorm:"foreignKey: RoleID" `

	GenderID 	uint
	Gender   	*Gender `gorm:"foreignKey: GenderID"`

	Article		[]Article 	`gorm:"foreignKey:AdminID"`
}