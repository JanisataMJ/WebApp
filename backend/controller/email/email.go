package email

import (
	"net/http"
	"fmt"
	"gopkg.in/gomail.v2"

	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
	"github.com/gin-gonic/gin"
)

// ส่งสรุปสุขภาพประจำสัปดาห์
func SendWeeklySummary(c *gin.Context) {
	db := config.DB()

	// ดึงผู้ใช้ทั้งหมด
	var users []entity.User
	if err := db.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	for _, user := range users {
		// หา HealthSummary ล่าสุดของผู้ใช้ (อาทิตย์ล่าสุด)
		var summary entity.HealthSummary
		if err := db.Where("user_id = ?", user.ID).
			Order("period_end desc").
			First(&summary).Error; err != nil {
			continue
		}

		// สร้างข้อความอีเมล
		subject := fmt.Sprintf("สรุปสุขภาพประจำสัปดาห์ (%s - %s)", 
			summary.PeriodStart.Format("02/01/2006"), summary.PeriodEnd.Format("02/01/2006"))

		body := fmt.Sprintf(`
		สวัสดีคุณ %s,

		นี่คือสรุปสุขภาพของคุณในสัปดาห์ที่ผ่านมา:
		- อัตราการเต้นหัวใจเฉลี่ย: %.2f bpm
		- จำนวนก้าวรวม: %d
		- ชั่วโมงการนอนเฉลี่ย: %.2f
		- แคลอรี่ที่เผาผลาญเฉลี่ย: %.2f
		- ค่าออกซิเจนในเลือดเฉลี่ย: %.2f%%
		- อุณหภูมิร่างกายเฉลี่ย: %.2f°C

		ขอให้สุขภาพดีตลอดสัปดาห์!
		`, user.Username, summary.AvgBpm, summary.TotalSteps, summary.AvgSleep, summary.AvgCalories, summary.AvgSpo2, summary.AvgBodyTemp)

		// ส่งอีเมล
		sendEmail(user.Email, subject, body)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Weekly summaries sent successfully"})
}

// ตรวจสอบค่า HealthData แบบเรียลไทม์
func SendRealtimeAlert(c *gin.Context) {
	var data entity.HealthData
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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
		var user entity.User
		if err := config.DB().First(&user, data.UserID).Error; err == nil {
			subject := "แจ้งเตือนสุขภาพด่วน!"
			body := fmt.Sprintf("สวัสดีคุณ %s,\n\nระบบตรวจพบค่าผิดปกติ:\n%s\nกรุณาติดต่อแพทย์หากจำเป็น.", user.FirstName, alerts)
			sendEmail(user.Email, subject, body)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Realtime alert processed"})
}


func sendEmail(to, subject, body string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", "your_email@gmail.com") // ใส่อีเมลผู้ส่ง
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)

	d := gomail.NewDialer("smtp.gmail.com", 587, "your_email@gmail.com", "your_password") // ใส่รหัสผ่านแอป Gmail หรือ SMTP ของคุณ

	if err := d.DialAndSend(m); err != nil {
		fmt.Println("Failed to send email:", err)
		return err
	}
	return nil
}
