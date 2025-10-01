// three weeks

package seed

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/JanisataMJ/WebApp/controller/healthAnalysis"
	"github.com/JanisataMJ/WebApp/controller/healthSummary"
	"github.com/JanisataMJ/WebApp/entity"

	"gorm.io/gorm"
)

func SeedHealthDataThreeWeeks(db *gorm.DB) {
	// ---------------------------
	// 1️⃣ สร้าง RiskLevel
	// ---------------------------
	var lNormal entity.RiskLevel
	Rlevels := []entity.RiskLevel{
		{Rlevel: "ดี"},
		{Rlevel: "ปกติ"},
		{Rlevel: "เสี่ยง"},
	}
	for i, level := range Rlevels {
		db.FirstOrCreate(&Rlevels[i], entity.RiskLevel{Rlevel: level.Rlevel})
	}
	lNormal = Rlevels[1]

	// ---------------------------
	// 2️⃣ ดึง User
	// ---------------------------
	var user entity.User
	if err := db.Where("email = ?", "usercpe21@gmail.com").First(&user).Error; err != nil {
		log.Fatalf("ไม่พบ User ที่ต้องการใช้งาน: %v", err)
	}

	rand.Seed(time.Now().UnixNano())
	now := time.Now().Truncate(24 * time.Hour)

	// ---------------------------
	// 3️⃣ สร้าง HealthData ย้อนหลัง 3 สัปดาห์
	// ---------------------------
	today := time.Now()
	startOfDay := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, today.Location())

	for daysAgo := 20; daysAgo >= 0; daysAgo-- { // 🔥 เปลี่ยนจาก 13 → 20 (3 สัปดาห์ = 21 วัน)
		day := startOfDay.AddDate(0, 0, -daysAgo)

		sleepDuration := 6 + rand.Float64()*3
		hours := int(sleepDuration)
		minutes := int((sleepDuration - float64(hours)) * 60)
		sleepString := fmt.Sprintf("%dh %dm", hours, minutes)

		maxHour := 23
		if day.Year() == today.Year() && day.YearDay() == today.YearDay() {
			maxHour = today.Hour() - 1
			if maxHour < 0 {
				maxHour = 0
			}
		}

		cumulativeSteps := int64(0)
		cumulativeCalories := 0.0

		for hour := 0; hour <= maxHour; hour++ {
			stepsThisHour := int64(rand.Intn(200) + 50)
			cumulativeSteps += stepsThisHour

			caloriesThisHour := 50 + rand.Float64()*30
			cumulativeCalories += caloriesThisHour

			hd := entity.HealthData{
				Timestamp:      day.Add(time.Duration(hour) * time.Hour),
				Bpm:            uint(60 + rand.Intn(40)),
				Steps:          cumulativeSteps,
				CaloriesBurned: cumulativeCalories,
				Spo2:           95 + float64(rand.Intn(4)),
				SleepHours:     sleepString,
				UserID:         user.ID,
			}

			if hour == 0 {
				hd.SleepHours = sleepString
			}

			db.Create(&hd)
			healthAnalysis.ProcessNewHealthData(db, &hd)
		}
	}

	// ---------------------------
	// 4️⃣ สร้าง HealthSummary รายสัปดาห์ 3 สัปดาห์
	// ---------------------------
	for week := 0; week < 3; week++ { // 🔥 เปลี่ยนจาก 2 → 3
		start := now.AddDate(0, 0, -(20 - week*7))
		end := start.AddDate(0, 0, 6).Add(23*time.Hour + 59*time.Minute + 59*time.Second)

		_, currentWeekNum := now.ISOWeek()

		var healthDatas []entity.HealthData
		db.Where("user_id = ? AND timestamp BETWEEN ? AND ?", user.ID, start, end).Find(&healthDatas)

		var totalSleep float64
		for _, hd := range healthDatas {
			totalSleep += healthSummary.ParseSleepHours(hd.SleepHours)
		}
		avgSleep := 0.0
		if len(healthDatas) > 0 {
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
			RiskLevelID: lNormal.ID,
		}
		db.Create(&summary)
	}

	log.Println("Seed data for 3 weeks created successfully!")
}
