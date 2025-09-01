package entity

import (
	"time"
	"gorm.io/gorm"
)

type Article struct {
	gorm.Model
	Title			string
	Information 	string
	Reference		string
	PublishDate 	time.Time
	Image			string
	Order			uint
	
	UserID 	uint
	User   	*User `gorm:"foreignKey: UserID"`
}