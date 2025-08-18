package entity

import (
	"gorm.io/gorm"
)

type NotificationStatus struct {
	gorm.Model
	Status string
	
	Notification []Notification `gorm:"foreignKey:NotificationStatusID"`
}