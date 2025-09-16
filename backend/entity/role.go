package entity

import (
	"gorm.io/gorm"
)

type Role struct {
	gorm.Model
	Name string
	
	User 	[]User 	`gorm:"foreignKey:RoleID"`
}