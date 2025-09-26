package seed

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/controller/healthAnalysis" // *** IMPORT healthAnalysis package ***
	"github.com/JanisataMJ/WebApp/controller/healthSummary"
	"github.com/JanisataMJ/WebApp/entity"

	"gorm.io/gorm"
)

func SeedHealthDataTwoWeeks(db *gorm.DB) {
	// ---------------------------
	// 1️⃣ สร้าง RiskLevel
	// ---------------------------
	var lNormal entity.RiskLevel // เก็บไว้แค่ lNormal สำหรับ HealthSummary (RiskLevelID: lNormal.ID)
	Rlevels := []entity.RiskLevel{
		{Rlevel: "ดี"},
		{Rlevel: "ปกติ"},
		{Rlevel: "เสี่ยง"},
	}
	for i, level := range Rlevels {
		db.FirstOrCreate(&Rlevels[i], entity.RiskLevel{Rlevel: level.Rlevel})
	}
	// lGood และ lBad ไม่จำเป็นต้องประกาศ/กำหนดค่า เพราะไม่ได้ถูกใช้ในส่วนนี้อีกแล้ว
	lNormal = Rlevels[1] // กำหนด lNormal เพื่อใช้ใน HealthSummary

	// ---------------------------
	// 2️⃣ สร้าง User ตัวอย่าง (UserID=4)
	// ---------------------------
	var user entity.User
	hashedPassword, _ := config.HashPassword("123456")

	db.FirstOrCreate(&user, entity.User{
		Email: "user6@gmail.com",
	}, entity.User{
		Username:    "user6",
		Password:    hashedPassword,
		FirstName: "User6",
		LastName:    "Fulldata",
		RoleID:      2, // User role
		GenderID:    1, // Male
	})

	rand.Seed(time.Now().UnixNano())
	now := time.Now().Truncate(24 * time.Hour)

	// ---------------------------
	// 3️⃣ สร้าง HealthData + HealthAnalysis ย้อนหลัง 2 สัปดาห์
	// ---------------------------
	for daysAgo := 13; daysAgo >= 0; daysAgo-- { // 14 วัน
		day := now.AddDate(0, 0, -daysAgo)

		sleepStart := 20 // เริ่มนอน 20.00
		sleepEnd := 5    // ตื่น 05.00

		for hour := 0; hour < 24; hour++ {
			hd := entity.HealthData{
				Timestamp:      day.Add(time.Duration(hour) * time.Hour),
				Bpm:            uint(60 + rand.Intn(40)),
				Steps:          int64(500 + rand.Intn(2000)),
				CaloriesBurned: 100 + rand.Float64()*50,
				Spo2:           95 + float64(rand.Intn(4)),
				SleepHours:     "0",
				UserID:         user.ID,
			}

			// ✅ ถ้าอยู่ในช่วงนอน
			if (hour >= sleepStart && hour <= 23) || (hour >= 0 && hour < sleepEnd) {
				hd.Bpm = uint(50 + rand.Intn(10))
				hd.Steps = 0
				hd.Spo2 = 96
				hd.SleepHours = "1" // หนึ่งชั่วโมงต่อ record
			}

			db.Create(&hd)

			// *** เปลี่ยนมาเรียกใช้ ProcessNewHealthData แทนการสร้าง analyses โดยตรง ***
			// ฟังก์ชันนี้จะจัดการสร้าง HealthAnalysis และดึง RiskLevel เอง
			healthAnalysis.ProcessNewHealthData(db, &hd) 
			
			// ลบโค้ดที่สร้าง analyses ที่ถูกย้ายไปแล้วออก
			/*
			analyses := []entity.HealthAnalysis{
				// ...
				{
					Category:       "อัตราการเต้นหัวใจ",
					Value:          fmt.Sprintf("%d bpm", hd.Bpm),
					Interpretation: interpretHeartRate(hd.Bpm),
					Suggestion:     suggestHeartRate(hd.Bpm),
					RiskLevelID:    mapRiskLevelHeartRate(hd.Bpm, lGood, lNormal, lBad),
					HealthDataID:   hd.ID,
				},
				// ...
			}
			db.Create(&analyses)
			*/
		}
	}

	// ---------------------------
	// 4️⃣ สร้าง HealthSummary รายสัปดาห์ 2 สัปดาห์
	// ---------------------------
	for week := 0; week < 2; week++ {
		start := now.AddDate(0, 0, -(13 - week*7))
		end := start.AddDate(0, 0, 6).Add(23*time.Hour + 59*time.Minute + 59*time.Second) // สิ้นสุดวันอาทิตย์

		_, currentWeekNum := now.ISOWeek() 

		var healthDatas []entity.HealthData
		db.Where("user_id = ? AND timestamp BETWEEN ? AND ?", user.ID, start, end).Find(&healthDatas)

		var totalSleep float64
		for _, hd := range healthDatas {
			totalSleep += healthSummary.ParseSleepHours(hd.SleepHours)
		}
		avgSleep := 0.0
		if len(healthDatas) > 0 {
			// คำนวณค่าเฉลี่ยชั่วโมงการนอนต่อวัน: (ชั่วโมงการนอนทั้งหมด) / (จำนวนวันทั้งหมด 7 วัน)
			avgSleep = totalSleep / float64(7) 
		}

		summary := entity.HealthSummary{
			PeriodStart: start,
			PeriodEnd:   end,
			AvgBpm:      70 + rand.Float64()*10,
			MinBpm:      55 + uint(rand.Intn(10)),
			MaxBpm:      100 + uint(rand.Intn(10)),
			AvgSteps:    7000 + rand.Float64()*2000,
			TotalSteps:  49000 + rand.Intn(10000),
			AvgSleep:    avgSleep, 
			AvgCalories: 2200 + rand.Float64()*500,
			AvgSpo2:     95 + rand.Float64()*3,
			WeekNumber:  uint(currentWeekNum) - uint(week), 
			UserID:      user.ID,
			TrendsID:    2,
			RiskLevelID: lNormal.ID, // <--- ใช้ lNormal ที่ประกาศไว้
		}
		db.Create(&summary)

		// Seed Notification สำหรับ summary
		notif := entity.Notification{
			Timestamp:            time.Now(),
			Title:                fmt.Sprintf("Weekly Health Summary Week %d", summary.WeekNumber),
			Message:              "ตัวอย่างข้อความสรุปสุขภาพ",
			UserID:               user.ID,
			HealthSummaryID:      &summary.ID,
			HealthTypeID:         1,
			NotificationStatusID: 2,
		}
		db.Create(&notif)
	}

	log.Println("Seed data for 2 weeks created successfully!")
}