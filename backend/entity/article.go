package entity

import (
	"time"
	"gorm.io/gorm"
)

type Article struct {
	gorm.Model
	Article 	string
	CreateDate 	time.Time
	
	AdminID 	uint
	Admin   	*Admin `gorm:"foreignKey: AdminID"`
}