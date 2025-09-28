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

func SeedHealthData(db *gorm.DB) {
	// ---------------------------
	// Risk Levels
	// ---------------------------
	var lGood entity.RiskLevel // เหลือแค่ lGood ที่จำเป็นต้องใช้ใน HealthSummary
	Rlevels := []entity.RiskLevel{
		{Rlevel: "ดี"},
		{Rlevel: "ปกติ"},
		{Rlevel: "เสี่ยง"},
	}
	for i, level := range Rlevels {
		db.FirstOrCreate(&Rlevels[i], entity.RiskLevel{Rlevel: level.Rlevel})
	}
	// ดึงค่า RiskLevel 'ดี' มาใช้สำหรับ HealthSummary
	// (Rlevels[0] คือ 'ดี')
	lGood = Rlevels[0] 

	// ---------------------------
	// HealthData + HealthAnalysis
	// ---------------------------
	userID := uint(1)
	now := time.Now().Truncate(24 * time.Hour)
	rand.Seed(time.Now().UnixNano())

	for hour := 0; hour < 24; hour++ {
		hd := entity.HealthData{
			Timestamp:      now.Add(time.Duration(hour) * time.Hour),
			Bpm:            uint(60 + rand.Intn(40)),
			Steps:          int64(500 + rand.Intn(2000)),
			CaloriesBurned: 100 + rand.Float64()*50,
			Spo2:           95 + float64(rand.Intn(4)),
			SleepHours:     "0",
			UserID:         userID,
		}

		if hour >= 0 && hour < 6 {
			hd.Bpm = uint(50 + rand.Intn(10))
			hd.Steps = 0
			hd.Spo2 = 96
			hd.SleepHours = fmt.Sprintf("%d h.", hour+1)
		}

		db.Create(&hd)

		// *** เรียกใช้ฟังก์ชันใหม่เพื่อสร้าง HealthAnalysis ***
		// ฟังก์ชันนี้จะดึง RiskLevel จาก DB ภายในตัวมันเอง
		healthAnalysis.ProcessNewHealthData(db, &hd) 
	}

	// ---------------------------
	// HealthSummary (weekly) for UserID = 1 only
	// ---------------------------
	var user entity.User
	if err := db.First(&user, 1).Error; err != nil {
		log.Printf("ไม่พบ user id=1: %v", err)
		return
	}

	start := now.Truncate(24 * time.Hour)
	end := start.AddDate(0, 0, 1).Add(-time.Nanosecond)

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
		PeriodStart: time.Now().AddDate(0, 0, -7),
		PeriodEnd:   time.Now(),
		AvgBpm:      75.0,
		MinBpm:      60,
		MaxBpm:      120,
		AvgSteps:    8000,
		TotalSteps:  56000,
		AvgSleep:    avgSleep,
		AvgCalories: 2500,
		AvgSpo2:     97,
		WeekNumber:  35,
		UserID:      user.ID,
		TrendsID:    1,
		RiskLevelID: lGood.ID, // <--- ใช้ lGood ที่ยังจำเป็นอยู่
	}
	db.Create(&summary)

	notif := entity.Notification{
		Timestamp:            time.Now(),
		Title:                "Weekly Health Summary",
		Message:              "ตัวอย่างข้อความสรุปสุขภาพ",
		UserID:               user.ID,
		HealthSummaryID:      &summary.ID,
		HealthTypeID:         1, 
		NotificationStatusID: 2,
	}
	db.Create(&notif)

}
// ลบฟังก์ชัน helper ทั้งหมดที่อยู่ท้ายไฟล์นี้ออกแล้ว