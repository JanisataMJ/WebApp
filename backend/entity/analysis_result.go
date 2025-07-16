package entity

import (
	"time"
	"gorm.io/gorm"
)

type AnalysisResult struct {
	gorm.Model
	Timestamp 		time.Time
	AnalysisType 	float64
	Value 			float64
	SumText 		string

	UserID 			uint
	User   			*User `gorm:"foreignKey: UserID"`

	// Many-to-Many
	AnalysisResults []AnalysisResult `gorm:"many2many:HealthDataAnalysis;"`
}