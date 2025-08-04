package entity

import (
	"gorm.io/gorm"
)

type Gender struct {
	gorm.Model
	Gender string
	
	User 	[]User 	`gorm:"foreignKey:RoleID"`
	Admin 	[]Admin `gorm:"foreignKey:RoleID"`
}