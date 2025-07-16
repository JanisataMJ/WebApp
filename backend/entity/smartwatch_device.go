package entity

import (
	"time"
	"gorm.io/gorm"
)

type SmartwatchDevice struct {
	gorm.Model
	Name 			string 
	Picture 		string
	ReceivedDate 	time.Time

	UserID 			uint
	User   			*User `gorm:"foreignKey: UserID"`
}