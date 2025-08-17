package entity

import (
	"gorm.io/gorm"
	"time"
)

type User struct {
	gorm.Model
	Username    string    `json:"username"`
	Password    string    `json:"password"`
	Email       string    `json:"email"`
	FirstName   string    `json:"firstName"`
	LastName    string    `json:"lastName"`
	Birthdate   time.Time `json:"birthdate"`
	Phonenumber string    `json:"phonenumber"`
	Picture     string    `json:"picture"`
	Height      float64   `json:"height"`
	Weight      float64   `json:"weight"`
	Bust        float64   `json:"bust"`
	Waist       float64   `json:"waist"`
	Hip         float64   `json:"hip"`

	RoleID uint  `json:"RoleID"`
	Role   *Role `gorm:"foreignKey:RoleID"`

	GenderID uint    `json:"genderID"`
	Gender   *Gender `gorm:"foreignKey:GenderID"`

	AnalysisResult   []AnalysisResult  `gorm:"foreignKey:UserID"`
	HealthData       []HealthData      `gorm:"foreignKey:UserID"`
	SmartwatchDevice *SmartwatchDevice `gorm:"foreignKey:UserID"`
	MoodData         []MoodData        `gorm:"foreignKey:UserID"`
	Notification     []Notification    `gorm:"foreignKey:UserID"`
}
