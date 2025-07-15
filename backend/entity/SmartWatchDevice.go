package entity

import "gorm.io/gorm"

type CatagoryOfFood struct {
	gorm.Model
	StockfoodType string 
	Description   string

	StockOfFood []StockOfFood `gorm:"foreignkey:CatagoryOfFoodID"`
}