package entity

import (
	"gorm.io/gorm"
)

type HealthType struct {
	gorm.Model
	Type string
	
	Notification []Notification `gorm:"foreignKey:HealthTypeID"`
}