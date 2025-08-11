package entity

import (
	"time"
	"gorm.io/gorm"
)

type SmartwatchDevice struct {
	gorm.Model
	Name 			string
	SerialNumber 	string
	ModelSmartwatch string
	ModelNumber 	string
	Brand 			string
	StartDate 		time.Time

	UserID 			uint
	User   			*User `gorm:"foreignKey: UserID"`
}