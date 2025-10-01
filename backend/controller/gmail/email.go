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

// ... (SendEmail และ SendImmediateAlertBackground ฟังก์ชันอื่น ๆ ยังคงอยู่) ...

// ✅ [เพิ่ม] ฟังก์ชันใหม่สำหรับใช้ใน Goroutine Background
func SendImmediateAlertBackground(db *gorm.DB, user entity.User, healthTypeID uint, message string) {
    // ... (โค้ดสำหรับสร้าง Notification และส่ง Email) ...
    notification := entity.Notification{
        Timestamp:time.Now(),
        Title:"🚨 แจ้งเตือนสุขภาพผิดปกติ",
        Message: message,
        UserID: user.ID,
        HealthTypeID:2,
        NotificationStatusID: 2,
    }

    if err := db.Create(&notification).Error; err != nil {
        log.Printf("❌ Failed to save notification in background: %v\n", err)
        return
    }

    err := SendEmail(user.Email, "แจ้งเตือนสุขภาพผิดปกติ", message)
    if err != nil {
        log.Println("❌ ส่ง Email ไม่สำเร็จ:", err)
    }
}


// POST /check-realtime-alert
// 🚩 [ปรับปรุง] ทำหน้าที่รับข้อมูล, บันทึก DB, และตอบกลับอย่างรวดเร็ว
// การตรวจสอบ Alert จะถูกจัดการโดย Goroutine ชื่อ StartUserRealtimeAlertMonitoring
func SendRealtimeAlert(c *gin.Context) {
    type HealthInput struct {
        UserID uint    `json:"userID"`
        Bpm    int     `json:"bpm"`
        Spo2   float64 `json:"spo2"`
        // หากมีข้อมูลอื่นที่ต้องการบันทึกเพิ่ม ให้เพิ่มที่นี่
    }

    var input HealthInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format: " + err.Error()})
        return
    }

    // 🚩 [สำคัญ] Logic การบันทึกข้อมูลที่รับมาลงในตาราง HealthData
    healthData := entity.HealthData{
        UserID:  input.UserID,
        Timestamp: time.Now(),
        Bpm:    uint(input.Bpm),
        Spo2:    input.Spo2,
        // เพิ่มฟิลด์อื่น ๆ เช่น DeviceID, Temperature ถ้ามี
    }

    db := config.DB()
    if err := db.Create(&healthData).Error; err != nil {
        log.Printf("❌ Failed to save real-time health data: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save health data"})
        return
    }
    
    // 💡 ไม่ต้องมีการตรวจสอบ Alert ตรงนี้แล้ว
    // เพราะ StartUserRealtimeAlertMonitoring จะทำงานใน Background
    // โดยการดึงข้อมูลล่าสุด (รวมถึงข้อมูลที่เพิ่งบันทึกนี้) มาตรวจสอบเอง
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Health data received and saved. Realtime monitoring is active and will check for alerts shortly.",
    })
}

func SendEmail(to string, subject string, body string, attachments ...string) error {
    from := os.Getenv("EMAIL_USER")
    pass := os.Getenv("EMAIL_PASS")
    smtpHost := os.Getenv("SMTP_HOST")
    smtpPort := os.Getenv("SMTP_PORT")

    if from == "" || pass == "" || smtpHost == "" || smtpPort == "" {
        // NOTE: Make sure the os package is imported!
        return fmt.Errorf("missing email environment variables")
    }

    port, err := strconv.Atoi(smtpPort)
    if err != nil {
        return fmt.Errorf("invalid SMTP_PORT: %v", err)
    }

    // NOTE: Make sure the gopkg.in/gomail.v2 package is imported!
    m := gomail.NewMessage()
    m.SetHeader("From", from)
    m.SetHeader("To", to)
    m.SetHeader("Subject", subject)
    m.SetBody("text/html", body) 

    for _, file := range attachments {
        // NOTE: Make sure the os package is imported!
        if _, err := os.Stat(file); err == nil {
            m.Attach(file)
        } else {
            fmt.Printf("⚠️ Attachment not found: %s\n", file)
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