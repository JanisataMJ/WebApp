package entity

import (
	"time"
	"gorm.io/gorm"
)

type Notification struct {
	gorm.Model
	Timestamp	time.Time
	Message 	string 

	UserID 			uint
	User   			*User `gorm:"foreignKey: UserID"`

	HealthTypeID 	uint
	HealthType   	*HealthType `gorm:"foreignKey: HealthTypeID"`

	NotificatonStatusID 	uint
	NotificatonStatus   	*NotificatonStatus `gorm:"foreignKey: NotificatonStatusID"`
}