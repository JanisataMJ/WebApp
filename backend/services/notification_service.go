package services

/*import (
    "log"
    "time"
    "fmt"
    "strconv"
    "net/http"
    "github.com/gin-gonic/gin"

    "github.com/JanisataMJ/WebApp/config"
    "github.com/JanisataMJ/WebApp/entity"
    "github.com/JanisataMJ/WebApp/utils"
)*/


// ตัวอย่างฟังก์ชันสร้าง HealthSummary จาก HealthData
/*func GenerateHealthSummary(data *entity.HealthData) entity.HealthSummary {
    sleepFloat, err := strconv.ParseFloat(data.SleepHours, 64)
    if err != nil {
        log.Printf("error parsing sleep hours: %v", err)
        sleepFloat = 0
    }

    return entity.HealthSummary{
        AvgBpm:      float64(data.Bpm),
        MinBpm:      data.Bpm,
        MaxBpm:      data.Bpm,
        TotalSteps:  int(data.Steps),
        AvgSleep:    sleepFloat,
        AvgCalories: data.CaloriesBurned,
        AvgSpo2:     data.Spo2,
        AvgBodyTemp: data.BodyTemp,
        MinBodyTemp: data.BodyTemp,
        MaxBodyTemp: data.BodyTemp,
    }
}


// แจ้งเตือนเมื่อสุขภาพผิดปกติ
func SaveHealthAnalysis(c *gin.Context) {
    var analysis entity.HealthAnalysis
    if err := c.ShouldBindJSON(&analysis); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if err := config.DB().Create(&analysis).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // ตรวจสอบความเสี่ยง -> ส่ง email
    go CheckAndNotifyAbnormalAnalysis(&analysis)

    c.JSON(http.StatusOK, gin.H{"message": "Analysis saved", "analysis": analysis})
}


func CheckAndNotifyAbnormalAnalysis(analysis *entity.HealthAnalysis) {
    var user entity.User
    config.DB().
        Joins("JOIN health_data ON health_data.id = ?", analysis.HealthDataID).
        Joins("JOIN users ON users.id = health_data.user_id").
        First(&user)

    if user.Email == "" {
        return
    }

    if analysis.RiskLevelID == 3 { // High risk
        // ใช้ SendHealthNotificationEmail แบบ alert เดี่ยวก็ได้
        htmlBody := fmt.Sprintf(`<h3 style="color:red;">⚠️ Health Alert</h3>
            <p>Category: %s<br>
            Value: %s<br>
            Interpretation: %s<br>
            Suggestion: %s</p>`,
            analysis.Category, analysis.Value, analysis.Interpretation, analysis.Suggestion)

        err := utils.SendEmail(user.Email, "⚠️ Health Alert", htmlBody) // ใช้ SendEmail แบบ HTML
        if err != nil {
            log.Println("Failed to send alert to", user.Email)
        }

        notif := entity.Notification{
            UserID:             user.ID,
            HealthAnalysisID:   &analysis.ID,
            Title:              "Health Alert",
            Message:            htmlBody,
            Timestamp:          time.Now(),
            NotificationStatusID: 2,
        }
        config.DB().Create(&notif)
    }
}


func CheckAndNotifyRealtimeHealth(data *entity.HealthData) {
    var user entity.User
    config.DB().First(&user, data.UserID)
    if user.Email == "" {
        return
    }

    alerts := []string{}

    // เงื่อนไขเสี่ยง
    if data.Bpm > 120 {
        alerts = append(alerts, fmt.Sprintf("⚠️ หัวใจเต้นเร็วเกินไป: %d bpm", data.Bpm))
    } else if data.Bpm < 50 {
        alerts = append(alerts, fmt.Sprintf("⚠️ หัวใจเต้นช้าเกินไป: %d bpm", data.Bpm))
    }

    if data.Spo2 < 90 {
        alerts = append(alerts, fmt.Sprintf("⚠️ ค่าออกซิเจนในเลือดต่ำ: %.1f%%", data.Spo2))
    }

    if len(alerts) == 0 {
        return
    }

    // ส่งทีละอัน
    for _, alert := range alerts {
        err := utils.SendEmail(user.Email, "🚨 Health Alert", alert)
        if err != nil {
            log.Println("Failed to send alert to", user.Email)
        }

        notif := entity.Notification{
            UserID:               user.ID,
            Title:                "Health Alert",
            Message:              alert,
            Timestamp:            time.Now(),
            NotificationStatusID: 2,
        }
        config.DB().Create(&notif)
    }
}

func SendWeeklyHealthSummary() {
	db := config.DB()
	var users []entity.User
	db.Preload("HealthData").Find(&users)

	now := time.Now()
	year, week := now.ISOWeek() // หาเลขสัปดาห์ปัจจุบัน

	for _, user := range users {
		if user.Email == "" {
			continue
		}

		// ตรวจว่ามีสรุปของสัปดาห์นี้แล้วหรือยัง
		var existingSummary int64
		db.Model(&entity.HealthSummary{}).
			Where("user_id = ? AND strftime('%Y', period_start) = ? AND strftime('%W', period_start) = ?",
				user.ID, fmt.Sprint(year), fmt.Sprint(week)).
			Count(&existingSummary)

		if existingSummary > 0 {
			log.Println("✅ Weekly summary already sent for user", user.ID)
			continue
		}

		// หา HealthData ของสัปดาห์นี้
		weekStart := now.AddDate(0, 0, -int(now.Weekday())) // เริ่มต้นสัปดาห์
		weekEnd := weekStart.AddDate(0, 0, 7)

		var healthData []entity.HealthData
		db.Where("user_id = ? AND timestamp >= ? AND timestamp < ?", user.ID, weekStart, weekEnd).
			Find(&healthData)

		if len(healthData) == 0 {
			continue
		}

		// คำนวณ summary
		var totalBpm, totalSteps uint
		var totalSpo2, totalTemp, totalSleep, totalCalories float64
		minBpm, minTemp, minSpo2 := uint(9999), 999.0, 999.0
		maxBpm, maxTemp, maxSpo2 := uint(0), 0.0, 0.0

		for _, d := range healthData {
			totalBpm += d.Bpm
			totalSteps += d.Steps
			totalSpo2 += d.Spo2
			totalTemp += d.BodyTemp
			s, _ := strconv.ParseFloat(d.SleepHours, 64)
			totalSleep += s
			totalCalories += d.CaloriesBurned

			if d.Bpm < minBpm { minBpm = d.Bpm }
			if d.Bpm > maxBpm { maxBpm = d.Bpm }
			if d.Spo2 < minSpo2 { minSpo2 = d.Spo2 }
			if d.Spo2 > maxSpo2 { maxSpo2 = d.Spo2 }
			if d.BodyTemp < minTemp { minTemp = d.BodyTemp }
			if d.BodyTemp > maxTemp { maxTemp = d.BodyTemp }
		}

		count := float64(len(healthData))
		summary := entity.HealthSummary{
			PeriodStart:  weekStart,
			PeriodEnd:    weekEnd,
			AvgBpm:       float64(totalBpm)/count,
			MinBpm:       minBpm,
			MaxBpm:       maxBpm,
			AvgSteps:     float64(totalSteps)/count,
			TotalSteps:   int(totalSteps),
			AvgSleep:     totalSleep / count,
			AvgCalories:  totalCalories / count,
			AvgSpo2:      totalSpo2 / count,
			AvgBodyTemp:  totalTemp / count,
			MinBodyTemp:  minTemp,
			MaxBodyTemp:  maxTemp,
			UserID:       user.ID,
		}

		if err := db.Create(&summary).Error; err != nil {
			log.Println("❌ Failed to save health summary:", err)
			continue
		}

		// ส่ง Email
		msg := fmt.Sprintf(
			"📊 Weekly Health Summary\nAvg BPM: %.1f\nMin BPM: %d\nMax BPM: %d\nTotal Steps: %d\nAvg SpO2: %.1f%%\nAvg Temp: %.1f°C",
			summary.AvgBpm, summary.MinBpm, summary.MaxBpm, summary.TotalSteps, summary.AvgSpo2, summary.AvgBodyTemp,
		)

		if err := utils.SendEmail(user.Email, "📅 Weekly Health Summary", msg); err != nil {
			log.Println("❌ Failed to send email:", err)
		} else {
			log.Println("✅ Weekly summary sent to:", user.Email)
		}

		// บันทึก Notification
		noti := entity.Notification{
			Title: "📅 Weekly Health Summary",
			Message: msg,
			UserID: user.ID,
			Timestamp: time.Now(),
			NotificationStatusID: 2,
			HealthSummaryID: &summary.ID,
		}
		db.Create(&noti)
	}
}*/
