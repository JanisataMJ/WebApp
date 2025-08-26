package services

import (
    "log"
    "time"
    "fmt"
    "net/http"
    "github.com/gin-gonic/gin"

    "github.com/JanisataMJ/WebApp/config"
    "github.com/JanisataMJ/WebApp/entity"
    "github.com/JanisataMJ/WebApp/utils"
)

// SendPendingNotifications ดึง Notification ที่ยังไม่ส่ง (status = 1) และส่งอีเมล
func SendPendingNotifications() {
	var notifs []entity.Notification

	// Preload ความสัมพันธ์ HealthAnalysis -> HealthData -> User
	config.DB().
		Preload("HealthAnalysis.HealthData.User").
		Where("notification_status_id = ?", 1).
		Find(&notifs)

	for _, n := range notifs {
		user := n.HealthAnalysis.HealthData.User
		if user == nil {
			log.Println("No user associated with notification ID:", n.ID)
			continue
		}

		// ดึง HealthSummary และ HealthAnalysis ของผู้ใช้สำหรับส่งอีเมล
		var summary entity.HealthSummary
		var analyses []entity.HealthAnalysis

		// สมมติคุณมีวิธีสร้าง HealthSummary จาก HealthData
		summary = GenerateHealthSummary(n.HealthAnalysis.HealthData)

		// analyses อาจเป็น slice ของ HealthAnalysis ที่เกี่ยวข้อง
		analyses = append(analyses, *n.HealthAnalysis)

		// ส่งอีเมล
		err := utils.SendHealthNotificationEmail(*user, summary, analyses)
		if err != nil {
			log.Println("Failed to send email to:", user.Email, "Error:", err)
			continue
		}

		// อัปเดตสถานะ Notification เป็นส่งแล้ว (2)
		config.DB().Model(&n).Update("notification_status_id", 2)
		log.Println("Notification sent to:", user.Email)
	}
}

// ตัวอย่างฟังก์ชันสร้าง HealthSummary จาก HealthData
func GenerateHealthSummary(data *entity.HealthData) entity.HealthSummary {
	return entity.HealthSummary{
		AvgBpm:      float64(data.Bpm),
		MinBpm:      data.Bpm,
		MaxBpm:      data.Bpm,
		TotalSteps:  int(data.Steps),
		AvgSleep:    data.SleepHours,
		AvgCalories: data.CaloriesBurned,
		AvgSpo2:     data.Spo2,
		AvgBodyTemp: data.BodyTemp,
		MinBodyTemp: data.BodyTemp,
		MaxBodyTemp: data.BodyTemp,
	}
}


// ส่งแจ้งเตือนอีเมล สรุปภาพรวมสุขภาพ ทุก 1 ชม.
/*func SendHourlyHealthSummary() {
    var users []entity.User
    config.DB().Find(&users)

    for _, u := range users {
        if u.Email == "" {
            continue
        }

        // ดึง HealthSummary ล่าสุดของ user
        var summary entity.HealthSummary
        config.DB().Where("user_id = ?", u.ID).
            Order("period_end desc").First(&summary)

        if summary.ID == 0 {
            continue
        }

        // ทำสรุป
        report := fmt.Sprintf(
            "สรุปสุขภาพรอบชั่วโมง:\n" +
                "HR: Avg %.1f (Min %d / Max %d)\n" +
                "Steps: Avg %.1f, รวม %d\n" +
                "Sleep: %.1f ชั่วโมง\n" +
                "Calories: %.1f kcal\n" +
                "SpO₂: %.1f%%\n" +
                "Temp: Avg %.1f (%.1f - %.1f)",
            summary.AvgBpm, summary.MinBpm, summary.MaxBpm,
            summary.AvgSteps, summary.TotalSteps,
            summary.AvgSleep,
            summary.AvgCalories,
            summary.AvgSpo2,
            summary.AvgBodyTemp, summary.MinBodyTemp, summary.MaxBodyTemp,
        )

        utils.SendEmail(u.Email, "📊 รายงานสุขภาพรายชั่วโมง", report)

        notif := entity.Notification{
            UserID:               u.ID,
            HealthSummaryID:      summary.ID,
            Title:                "Health Summary",
            Message:              report,
            Timestamp:            time.Now(),
            NotificationStatusID: 2,
        }
        config.DB().Create(&notif)
    }
}*/
func SendHourlyHealthSummary() {
	db := config.DB()
	var users []entity.User
	db.Preload("HealthData.HealthAnalysis").Find(&users) // preload analyses ผ่าน HealthData

	for _, user := range users {
		if user.Email == "" || len(user.HealthData) == 0 {
			continue
		}

		// ดึง HealthData ล่าสุด
		latestData := user.HealthData[len(user.HealthData)-1]

		// ดึง HealthAnalysis ของ HealthData ล่าสุด
		analyses := latestData.HealthAnalysis

		// ถ้าอยากรวมสรุปค่าต่าง ๆ ต้องแปลง HealthData เป็น HealthSummary
		summary := GenerateHealthSummary(&latestData)

		err := utils.SendHealthNotificationEmail(user, summary, analyses)
		if err != nil {
			log.Println("Failed to send email to", user.Email, ":", err)
		}
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
