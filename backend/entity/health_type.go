package entity

import (
	"gorm.io/gorm"
)

type HealthType struct {
	gorm.Model
	Type uint
	
	Notification []Notification `gorm:"foreignKey:HealthTypeID"`
}