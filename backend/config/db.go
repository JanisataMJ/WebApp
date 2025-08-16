package config

import (
	"fmt"
	"time"

	"github.com/JanisataMJ/WebApp/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

// ConnectionDB เชื่อมต่อ SQLite และแสดง error จริง ๆ
func ConnectionDB() {
	// ใช้ path แบบเต็มเพื่อป้องกันปัญหา Windows
	databasePath := "C:/Users/VICTUS/Desktop/Project/WebApp/backend/sa.db"
	database, err := gorm.Open(sqlite.Open(databasePath+"?cache=shared"), &gorm.Config{})
	if err != nil {
		panic(fmt.Sprintf("failed to connect database: %v", err))
	}
	fmt.Println("connected database")
	db = database
}

// SetupDatabase สร้าง table และ seed ข้อมูลเริ่มต้น
func SetupDatabase() {
	// ตรวจสอบว่า db ถูกเชื่อมต่อแล้ว
	if db == nil {
		panic("database not connected. Call ConnectionDB() first")
	}

	// AutoMigrate
	db.AutoMigrate(
		&entity.User{},
		&entity.Gender{},
		&entity.MoodData{},
	)

	// Seed Gender
	GenderMale := entity.Gender{Gender: "Male"}
	GenderFemale := entity.Gender{Gender: "Female"}
	db.FirstOrCreate(&GenderMale, entity.Gender{Gender: "Male"})
	db.FirstOrCreate(&GenderFemale, entity.Gender{Gender: "Female"})

	// Seed User
	hashedPassword, _ := HashPassword("123456")
	BirthDay, _ := time.Parse("2006-01-02", "1988-11-12")
	User := &entity.User{
		FirstName: "Software",
		LastName:  "Analysis",
		Email:     "sa@gmail.com",
		Password:  hashedPassword,
		Birthdate: BirthDay,
		GenderID:  1,
		Picture:   "",
	}
	db.FirstOrCreate(User, entity.User{Email: "sa@gmail.com"})

	// Seed MoodData
	initialCalendars := []entity.MoodData{
		{
			UserID:       1,
			Title:        "Animal Feeding",
			CalendarDate: time.Date(2024, 12, 20, 8, 0, 0, 0, time.UTC),
			AllDay:       true,
		},
		{
			UserID:       1,
			Title:        "Health Checkup",
			CalendarDate: time.Date(2024, 12, 22, 10, 0, 0, 0, time.UTC),
			AllDay:       true,
		},
	}

	for _, calendar := range initialCalendars {
		db.FirstOrCreate(&calendar, entity.MoodData{
			Title:        calendar.Title,
			CalendarDate: calendar.CalendarDate,
		})
	}
}
