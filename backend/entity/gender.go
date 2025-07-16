package entity

import (
	"gorm.io/gorm"
)

type Gender struct {
	gorm.Model
	Name string
	
	User 	[]User 	`gorm:"foreignKey:RoleID"`
	Admin 	[]Admin `gorm:"foreignKey:RoleID"`
}