package entity

import (
	"gorm.io/gorm"
)

type NotificatonStatus struct {
	gorm.Model
	Status uint
	
	Notification []Notification `gorm:"foreignKey:NotificatonStatusID"`
}