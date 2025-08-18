package entity

import (
	"time"
	"gorm.io/gorm"
)

type Notification struct {
	gorm.Model
	Timestamp	time.Time
	Title		string
	Message 	string 

	UserID 			uint
	User   			*User `gorm:"foreignKey: UserID"`

	HealthTypeID 	uint
	HealthType   	*HealthType `gorm:"foreignKey: HealthTypeID"`

	NotificationStatusID 	uint
	NotificationStatus   	*NotificationStatus `gorm:"foreignKey: NotificationStatusID"`
}