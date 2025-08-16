package entity

import (
	"gorm.io/gorm"
	"time"
)

type User struct {
	gorm.Model
	Username    string
	Password    string
	Email       string
	FirstName   string
	LastName    string
	Birthdate   time.Time
	Phonenumber string
	Picture     string
	Height      float64
	Weight      float64
	Bust        float64
	Waist       float64
	Hip         float64

	RoleID uint
	Role   *Role `gorm:"foreignKey: RoleID" `

	GenderID uint
	Gender   *Gender `gorm:"foreignKey: GenderID"`

	AnalysisResult   []AnalysisResult  `gorm:"foreignKey:UserID"`
	HealthData       []HealthData      `gorm:"foreignKey:UserID"`
	SmartwatchDevice *SmartwatchDevice `gorm:"foreignKey:UserID"`
	MoodData         []MoodData        `gorm:"foreignKey:UserID"`
	Notification     []Notification    `gorm:"foreignKey:UserID"`
}
