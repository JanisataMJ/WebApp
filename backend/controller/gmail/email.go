package gmail

import (
    "fmt"
    "log"
    "net/http"
    "os"
    "strconv"
    "time"

    "github.com/gin-gonic/gin"
    "gopkg.in/gomail.v2"
    "gorm.io/gorm"

    "github.com/JanisataMJ/WebApp/config"
    "github.com/JanisataMJ/WebApp/entity"
)

// sendEmail ส่งอีเมลแบบ production-ready
func sendEmail(to string, subject string, body string, attachments ...string) error {
    from := os.Getenv("EMAIL_USER")
    pass := os.Getenv("EMAIL_PASS")
    smtpHost := os.Getenv("SMTP_HOST")
    smtpPort := os.Getenv("SMTP_PORT")

    if from == "" || pass == "" || smtpHost == "" || smtpPort == "" {
        return fmt.Errorf("missing email environment variables")
    }

    port, err := strconv.Atoi(smtpPort)
    if err != nil {
        return fmt.Errorf("invalid SMTP_PORT: %v", err)
    }

    m := gomail.NewMessage()
    m.SetHeader("From", from)
    m.SetHeader("To", to)
    m.SetHeader("Subject", subject)
    m.SetBody("text/html", body) 

    for _, file := range attachments {
        if _, err := os.Stat(file); err == nil {
            m.Attach(file)
        } else {
            fmt.Printf("⚠️  Attachment not found: %s\n", file)
        }
    }

    d := gomail.NewDialer(smtpHost, port, from, pass)

    if err := d.DialAndSend(m); err != nil {
        fmt.Println("❌ Failed to send email:", err)
        return err
    }

    fmt.Println("✅ Email sent to:", to)
    return nil
}

// ✅ [แก้ไข] ฟังก์ชันนี้จะใช้สำหรับ API Endpoint เท่านั้น
func SendImmediateAlert(c *gin.Context, db *gorm.DB, user entity.User, healthTypeID uint, message string) {
	notification := entity.Notification{
		Timestamp:          time.Now(),
		Title:              "🚨 แจ้งเตือนสุขภาพผิดปกติ",
		Message:            message,
		UserID:             user.ID,
		HealthTypeID:       healthTypeID,
		NotificationStatusID: 2,
	}

	if err := db.Create(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ✅ โหลดข้อมูลกลับมาเฉพาะส่วนที่จำเป็น
	if err := db.Preload("HealthType").
		Preload("NotificationStatus").
		First(&notification, notification.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to preload notification"})
		return
	}

	err := sendEmail(user.Email, "แจ้งเตือนสุขภาพผิดปกติ", message)
	if err != nil {
		log.Println("❌ ส่ง Email ไม่สำเร็จ:", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ส่งแจ้งเตือนเรียบร้อย",
		"data":    notification,
	})
}

// ✅ [เพิ่ม] ฟังก์ชันใหม่สำหรับใช้ใน Goroutine Background
func SendImmediateAlertBackground(db *gorm.DB, user entity.User, healthTypeID uint, message string) {
	notification := entity.Notification{
		Timestamp:          time.Now(),
		Title:              "🚨 แจ้งเตือนสุขภาพผิดปกติ",
		Message:            message,
		UserID:             user.ID,
		HealthTypeID:       healthTypeID,
		NotificationStatusID: 2,
	}

	if err := db.Create(&notification).Error; err != nil {
		log.Printf("❌ Failed to save notification in background: %v\n", err)
		return
	}

	err := sendEmail(user.Email, "แจ้งเตือนสุขภาพผิดปกติ", message)
	if err != nil {
		log.Println("❌ ส่ง Email ไม่สำเร็จ:", err)
	}
}

// ✅ [แก้ไข] เปลี่ยนไปใช้ฟังก์ชันใหม่
func SendRealtimeAlert(c *gin.Context) {
    var data entity.HealthData
    if err := c.ShouldBindJSON(&data); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    db := config.DB()

    var user entity.User
    if err := db.First(&user, data.UserID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }

    alerts := ""
    if data.Bpm < 50 {
        alerts += fmt.Sprintf("- อัตราการเต้นหัวใจต่ำ: %d bpm\n", data.Bpm)
    } else if data.Bpm > 120 {
        alerts += fmt.Sprintf("- อัตราการเต้นหัวใจสูง: %d bpm\n", data.Bpm)
    }
    if data.Spo2 < 90 {
        alerts += fmt.Sprintf("- ค่าออกซิเจนในเลือดต่ำ: %.2f%%\n", data.Spo2)
    }

    if alerts != "" {
        if user.RoleID == 2 {
            go SendImmediateAlertBackground(db, user, 1, alerts)
            c.JSON(http.StatusOK, gin.H{"message": "Alert detected and email is being sent in the background."})
        } else {
            c.JSON(http.StatusOK, gin.H{"message": "Alert detected, but not sending email because Role != User"})
        }
    } else {
        c.JSON(http.StatusOK, gin.H{"message": "No critical values, no alert sent."})
    }
}

// แจ้งเตือนสรุปรายสัปดาห์ (เลือก UserID ได้)
func SendWeeklySummary(db *gorm.DB, userID uint) {
    var summary entity.HealthSummary

    if err := db.Preload("User").
        Where("user_id = ?", userID).
        Order("period_end desc").
        First(&summary).Error; err != nil {
        log.Printf("error fetching latest weekly summary: %v", err)
        return
    }

    if summary.User == nil || summary.User.RoleID != 2 {
        return // ส่งเฉพาะ role User
    }

    summaryText := fmt.Sprintf(
        "📊 Weekly Health Summary (Week %d)\n"+
            "ช่วงเวลา: %s ถึง %s\n\n"+
            "- Heart Rate: เฉลี่ย %.1f bpm (ต่ำสุด %d, สูงสุด %d)\n"+
            "- Steps: เฉลี่ย %.1f, รวม %d ก้าว\n"+
            "- Sleep: เฉลี่ย %.1f ชั่วโมง\n"+
            "- Calories: เฉลี่ย %.1f kcal\n"+
            "- SpO₂: เฉลี่ย %.1f%%\n"+
            "- Body Temp: เฉลี่ย %.1f °C (ต่ำสุด %.1f, สูงสุด %.1f)\n",
        summary.WeekNumber,
        summary.PeriodStart.Format("2006-01-02"),
        summary.PeriodEnd.Format("2006-01-02"),
        summary.AvgBpm, summary.MinBpm, summary.MaxBpm,
        summary.AvgSteps, summary.TotalSteps,
        summary.AvgSleep,
        summary.AvgCalories,
        summary.AvgSpo2,
    )

    if err := sendEmail(summary.User.Email, "Weekly Health Summary", summaryText); err != nil {
        log.Printf("failed to send email: %v", err)
    }

    notif := entity.Notification{
        Timestamp:          time.Now(),
        Title:              fmt.Sprintf("Weekly Health Summary (Week %d)", summary.WeekNumber),
        Message:            summaryText,
        UserID:             summary.UserID,
        HealthSummaryID:    &summary.ID,
        NotificationStatusID: 1,
    }
    if err := db.Create(&notif).Error; err != nil {
        log.Printf("failed to save weekly summary notification: %v", err)
    }
}