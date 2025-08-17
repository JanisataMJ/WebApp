package entity

import (
	"gorm.io/gorm"
)

type SmartwatchDevice struct {
	gorm.Model
	Name 			string
	SerialNumber 	string
	ModelSmartwatch string
	ModelNumber 	string
	Brand 			string

	UserID 			uint
	User   			*User `gorm:"foreignKey: UserID"`
}