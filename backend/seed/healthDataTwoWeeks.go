package seed

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/controller/healthSummary"
	"github.com/JanisataMJ/WebApp/entity"

	"gorm.io/gorm"
)

func SeedHealthDataTwoWeeks(db *gorm.DB) {
	// ---------------------------
	// 1️⃣ สร้าง RiskLevel
	// ---------------------------
	var lGood, lNormal, lBad entity.RiskLevel
	Rlevels := []entity.RiskLevel{
		{Rlevel: "ดี"},
		{Rlevel: "ปกติ"},
		{Rlevel: "เสี่ยง"},
	}
	for i, level := range Rlevels {
		db.FirstOrCreate(&Rlevels[i], entity.RiskLevel{Rlevel: level.Rlevel})
	}
	lGood = Rlevels[0]
	lNormal = Rlevels[1]
	lBad = Rlevels[2]

	// ---------------------------
	// 2️⃣ สร้าง User ตัวอย่าง (UserID=4)
	// ---------------------------
	var user entity.User
	hashedPassword, _ := config.HashPassword("123456")

	db.FirstOrCreate(&user, entity.User{
		Email: "user6@gmail.com",
	}, entity.User{
		Username:  "user6",
		Password:  hashedPassword,
		FirstName: "User6",
		LastName:  "Fulldata",
		RoleID:    2, // User role
		GenderID:  1, // Male
	})

	rand.Seed(time.Now().UnixNano())
	now := time.Now().Truncate(24 * time.Hour)

	// ---------------------------
	// 3️⃣ สร้าง HealthData + HealthAnalysis ย้อนหลัง 2 สัปดาห์
	// ---------------------------
	today := time.Now() // เก็บวันที่และเวลาปัจจุบัน
	startOfDay := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, today.Location())

	for daysAgo := 13; daysAgo >= 0; daysAgo-- {
		day := startOfDay.AddDate(0, 0, -daysAgo)

		// ✅ สุ่มชั่วโมงการนอนของวันนั้น (6.0 - 9.0 ชั่วโมง)
		sleepDuration := 6 + rand.Float64()*3 // 6-9 ชม.
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

		for hour := 0; hour <= maxHour; hour++ {
			hd := entity.HealthData{
				Timestamp:      day.Add(time.Duration(hour) * time.Hour),
				Bpm:            uint(60 + rand.Intn(40)),
				Steps:          int64(500 + rand.Intn(2000)),
				CaloriesBurned: 100 + rand.Float64()*50,
				Spo2:           95 + float64(rand.Intn(4)),
				SleepHours:     "", // ส่วนใหญ่เป็นค่าว่าง
				UserID:         user.ID,
			}

			// ✅ ใส่ SleepHours แค่ record แรกของวัน (เช่น 00:00)
			if hour == 0 {
				hd.SleepHours = sleepString
			}

			db.Create(&hd)

			analyses := []entity.HealthAnalysis{
				{
					Category:       "อัตราการเต้นหัวใจ",
					Value:          fmt.Sprintf("%d bpm", hd.Bpm),
					Interpretation: interpretHeartRate(hd.Bpm),
					Suggestion:     suggestHeartRate(hd.Bpm),
					RiskLevelID:    mapRiskLevelHeartRate(hd.Bpm, lGood, lNormal, lBad),
					HealthDataID:   hd.ID,
				},
				{
					Category:       "จำนวนก้าว",
					Value:          fmt.Sprintf("%d ก้าว", hd.Steps),
					Interpretation: interpretSteps(hd.Steps),
					Suggestion:     suggestSteps(hd.Steps),
					RiskLevelID:    mapRiskLevelSteps(hd.Steps, lGood, lNormal, lBad),
					HealthDataID:   hd.ID,
				},
				{
					Category:       "การนอนหลับ",
					Value:          hd.SleepHours,
					Interpretation: interpretSleep(hd.SleepHours),
					Suggestion:     suggestSleep(hd.SleepHours),
					RiskLevelID:    lNormal.ID,
					HealthDataID:   hd.ID,
				},
				{
					Category:       "พลังงานที่ใช้ไป",
					Value:          fmt.Sprintf("%.2f kcal", hd.CaloriesBurned),
					Interpretation: interpretCalories(hd.CaloriesBurned),
					Suggestion:     suggestCalories(hd.CaloriesBurned),
					RiskLevelID:    mapRiskLevelCalories(hd.CaloriesBurned, lGood, lNormal, lBad),
					HealthDataID:   hd.ID,
				},
				{
					Category:       "ออกซิเจนในเลือด",
					Value:          fmt.Sprintf("%.0f %%", hd.Spo2),
					Interpretation: interpretSpo2(hd.Spo2),
					Suggestion:     suggestSpo2(hd.Spo2),
					RiskLevelID:    mapRiskLevelSpo2(hd.Spo2, lGood, lNormal, lBad),
					HealthDataID:   hd.ID,
				},
			}
			db.Create(&analyses)
		}
	}

	// ---------------------------
	// 4️⃣ สร้าง HealthSummary รายสัปดาห์ 2 สัปดาห์
	// ---------------------------
	for week := 0; week < 2; week++ {
		start := now.AddDate(0, 0, -(13 - week*7)) // วันจันทร์
		end := start.AddDate(0, 0, 6)              // วันอาทิตย์

		_, week := now.ISOWeek() // คำนวณ ISO week ก่อน

		var healthDatas []entity.HealthData
		db.Where("user_id = ? AND timestamp BETWEEN ? AND ?", user.ID, start, end).Find(&healthDatas)

		var totalSleep float64
		for _, hd := range healthDatas {
			totalSleep += healthSummary.ParseSleepHours(hd.SleepHours)
		}
		avgSleep := 0.0
		if len(healthDatas) > 0 {
			avgSleep = totalSleep / float64(len(healthDatas))
		}

		summary := entity.HealthSummary{
			PeriodStart: start,
			PeriodEnd:   end,
			AvgBpm:      70 + rand.Float64()*10,
			MinBpm:      55 + uint(rand.Intn(10)),
			MaxBpm:      100 + uint(rand.Intn(10)),
			AvgSteps:    7000 + rand.Float64()*2000,
			TotalSteps:  49000 + rand.Intn(10000),
			AvgSleep:    avgSleep, // ✅ ใช้ avgSleep จาก HealthData
			AvgCalories: 2200 + rand.Float64()*500,
			AvgSpo2:     95 + rand.Float64()*3,
			WeekNumber:  uint(week),
			UserID:      user.ID,
			TrendsID:    2,
			RiskLevelID: lNormal.ID,
		}
		db.Create(&summary)

		// Seed Notification สำหรับ summary
		notif := entity.Notification{
			Timestamp:       time.Now(),
			Title:           fmt.Sprintf("Weekly Health Summary Week %d", week+1),
			Message:         "ตัวอย่างข้อความสรุปสุขภาพ",
			UserID:          user.ID,
			HealthSummaryID: &summary.ID,
			HealthTypeID:    1,
			//TrendsID:             2,
			NotificationStatusID: 2,
		}
		db.Create(&notif)
	}

	log.Println("Seed data for 2 weeks created successfully!")
}
