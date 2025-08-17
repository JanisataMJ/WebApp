package entity

import (
	"gorm.io/gorm"
)

type Trends struct {
	gorm.Model
	Trend string
	
	Notification []Notification `gorm:"foreignKey:TrendsID"`
}