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
	Image			string
	Order			uint
	PublishDate 	*time.Time
	Published    	bool `gorm:"default:false"` // ยังไม่เผยแพร่
	
	UserID 	uint
	User   	*User `gorm:"foreignKey: UserID"`
}