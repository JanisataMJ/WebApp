package healthAnalysis

import (
	"context"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	//"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/controller/gmail"
	/* "github.com/JanisataMJ/WebApp/controller/notification" */
	"github.com/JanisataMJ/WebApp/entity"
)

//----------------------------------- API Handlers ------------------------------------

// GET /list-healthAnalysis
func ListHealthAnalysis(c *gin.Context) {
	var analysis []entity.HealthAnalysis
	if err := config.DB().
		Preload("HealthData").
		Preload("RiskLevel").
		Preload("Notification").
		Find(&analysis).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, analysis)
}

// GET /healthAnalysis/:id
func GetHealthAnalysis(c *gin.Context) {
	id := c.Param("id")
	analysisID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	var analysis entity.HealthAnalysis
	if err := config.DB().
		Preload("HealthData").
		Preload("RiskLevel").
		Preload("Notification").
		First(&analysis, analysisID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "HealthAnalysis not found"})
		return
	}
	c.JSON(http.StatusOK, analysis)
}

// GET /sleep-analysis/:userId
func GetSleepAnalysisByUser(c *gin.Context) {
	userId := c.Param("userId")

	var analyses []entity.HealthAnalysis
	if err := config.DB().
		Model(&entity.HealthAnalysis{}).
		Joins("JOIN health_data ON health_data.id = health_analyses.health_data_id").
		Where("health_analyses.category = ? AND health_data.user_id = ?", "การนอนหลับ", userId).
		Preload("HealthData").
		Preload("RiskLevel").
		Find(&analyses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, analyses)
}

// ✅ Handler สำหรับ Endpoint API ที่เรียกใช้ Gemini
func AnalyzeWithGeminiHandler(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("userID"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var healthData []entity.HealthData
	if err := config.DB().Where("user_id = ?", userID).Find(&healthData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// *** เรียกใช้ฟังก์ชันจาก geminiAnalysis.go โดยตรง ***
	analysis, err := AnalyzeHealthDataWithGemini(c.Request.Context(), uint(userID), healthData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Health analysis completed successfully",
		"analysis": analysis,
	})
}

//----------------------------------- Core Logic ------------------------------------

// ลบ AnalyzeHealthDataWithGemini ออก

//----------------------------------- Background Jobs -----------------------------------

// CheckForCriticalAlerts ทำงานเป็น Goroutine สำหรับแจ้งเตือนแบบเรียลไทม์
/* func CheckForCriticalAlerts(userID uint) {
    intervalStr := os.Getenv("CHECK_INTERVAL_MIN")
    interval, err := strconv.Atoi(intervalStr)
    if err != nil || interval <= 0 {
        interval = 5
    }
    checkInterval := time.Duration(interval) * time.Minute

    for {
        // ดึง HealthData ล่าสุดของ user
        var latestHealthData entity.HealthData
        if err := config.DB().
            Where("user_id = ?", userID).
            Order("created_at desc").
            First(&latestHealthData).Error; err != nil {
            time.Sleep(checkInterval)
            continue
        }

        alerts := ""
        if latestHealthData.Bpm >= 120 {
            alerts += fmt.Sprintf("- อัตราการเต้นหัวใจสูงผิดปกติ: %d bpm\n", latestHealthData.Bpm)
        }
        if latestHealthData.Bpm <= 50 {
            alerts += fmt.Sprintf("- อัตราการเต้นหัวใจต่ำผิดปกติ: %d bpm\n", latestHealthData.Bpm)
        }
        if latestHealthData.Spo2 <= 90.0 {
            alerts += fmt.Sprintf("- ค่าออกซิเจนในเลือดต่ำผิดปกติ: %.2f%%\n", latestHealthData.Spo2)
        }

        if alerts != "" {
            var user entity.User
            if err := config.DB().First(&user, userID).Error; err == nil {
                gmail.SendImmediateAlertBackground(config.DB(), user, 1, alerts)
            }
        }

        time.Sleep(checkInterval)
    }
} */
/*  func CheckCriticalAlertOnce(userID uint) {
    var latestHealthData entity.HealthData
    err := config.DB().
        Where("user_id = ?", userID).
        Order("created_at desc").
        First(&latestHealthData).Error
    if err != nil {
        return
    }

    alerts := ""
    if latestHealthData.Bpm >= 120 {
        alerts += fmt.Sprintf("- อัตราการเต้นหัวใจสูงผิดปกติ: %d bpm\n", latestHealthData.Bpm)
    }
    if latestHealthData.Bpm <= 50 {
        alerts += fmt.Sprintf("- อัตราการเต้นหัวใจต่ำผิดปกติ: %d bpm\n", latestHealthData.Bpm)
    }
    if latestHealthData.Spo2 <= 90.0 {
        alerts += fmt.Sprintf("- ค่าออกซิเจนในเลือดต่ำผิดปกติ: %.2f%%\n", latestHealthData.Spo2)
    }

    if alerts != "" {
        // ส่งแจ้งเตือนไปที่ email
        var user entity.User
        if err := config.DB().First(&user, userID).Error; err == nil {
            gmail.SendImmediateAlertBackground(config.DB(), user, 1, alerts)
        }
    }
} */

// WeeklyAnalysisJob ทำงานเป็น Goroutine สำหรับการวิเคราะห์รายสัปดาห์
func WeeklyAnalysisJob(ctx context.Context) {
	// *** เดิม: วนลูปทันที ***
	runWeeklyAnalysis(ctx) // รันครั้งแรกทันที

	select {
	case <-ctx.Done():
		log.Println("Weekly analysis job stopped.")
		return
	default:
		// ทำงานต่อ
	}
}

// runWeeklyAnalysis โค้ดหลักของการวิเคราะห์รายสัปดาห์
func runWeeklyAnalysis(ctx context.Context) {
	var users []entity.User
	if err := config.DB().Find(&users).Error; err != nil {
		log.Printf("Error retrieving users for weekly analysis: %v\n", err)
		return
	}

	for _, user := range users {
		log.Printf("Starting weekly analysis for user ID: %d\n", user.ID)

		lastWeek := time.Now().AddDate(0, 0, -7)
		var healthData []entity.HealthData
		if err := config.DB().Where("user_id = ? AND created_at >= ?", user.ID, lastWeek).Find(&healthData).Error; err != nil {
			log.Printf("Error retrieving health data for user %d: %v\n", user.ID, err)
			continue
		}

		// *** เรียกใช้ฟังก์ชันจาก geminiAnalysis.go ***
		analysis, err := AnalyzeHealthDataWithGemini(ctx, user.ID, healthData)
		if err != nil {
			log.Printf("Error analyzing data for user %d: %v\n", user.ID, err)
			continue
		}

		// จัดรูปแบบข้อความให้สวยงามด้วยการสร้าง HTML
		var htmlContent strings.Builder
		htmlContent.WriteString(fmt.Sprintf("<p>สวัสดีครับ/ค่ะ คุณ %s,</p>", user.FirstName))
		htmlContent.WriteString("<p>นี่คือสรุปข้อมูลสุขภาพรายสัปดาห์ของคุณจาก Gemini:</p>")
		htmlContent.WriteString("<ul>")

		// แยกข้อความเป็นบรรทัด และสร้างเป็นรายการแบบจุด
		lines := strings.Split(analysis, "\n")
		for _, line := range lines {
			trimmedLine := strings.TrimSpace(line)
			if len(trimmedLine) > 0 {
				// ใช้ <li> สำหรับสร้างรายการ bullet point
				htmlContent.WriteString("<li>" + trimmedLine + "</li>")
			}
		}
		htmlContent.WriteString("</ul>")

		// สร้าง entity.Notification (ใช้ข้อความดิบเพื่อบันทึกลงฐานข้อมูล)
		notif := entity.Notification{
			Timestamp:            time.Now(),
			Title:                "สรุปข้อมูลสุขภาพรายสัปดาห์",
			Message:              analysis, // เก็บข้อความดิบ
			UserID:               user.ID,
			NotificationStatusID: 2,
		}
		if err := config.DB().Create(&notif).Error; err != nil {
			log.Printf("Failed to save weekly summary notification for user %d: %v", user.ID, err)
		}

		// ส่งอีเมลด้วยเนื้อหา HTML
		emailBody := htmlContent.String()
		if err := gmail.SendEmail(user.Email, "Weekly Health Summary", emailBody, "text/html"); err != nil {
			log.Printf("Failed to send email to user %d: %v", user.ID, err)
		}
	}
}

// เก็บสถานะ alert ของ user เดียว
var userAlertStatus = struct {
	sync.RWMutex
	alertSent bool
}{alertSent: false}

// StartUserRealtimeAlertMonitoring เริ่มตรวจสอบ HealthData สำหรับ userID เฉพาะ
func StartUserRealtimeAlertMonitoring(userID uint, intervalSeconds int) {
	for {
		checkUserHealth(userID)
		time.Sleep(time.Duration(intervalSeconds) * time.Second)
	}
}

func checkUserHealth(userID uint) {
	var latest entity.HealthData
	if err := config.DB().
		Where("user_id = ?", userID).
		Order("created_at desc").
		First(&latest).Error; err != nil {
		log.Printf("No health data for user %d yet", userID)
		return
	}

	shouldAlert := latest.Bpm >= 120 || latest.Bpm <= 50 || latest.Spo2 <= 90.0

	userAlertStatus.RLock()
	alertAlreadySent := userAlertStatus.alertSent
	userAlertStatus.RUnlock()

	if shouldAlert && !alertAlreadySent {
		/* // สร้าง Notification และส่ง SSE
		notif := entity.Notification{
			Title:                "Realtime Health Alert",
			Message:              fmt.Sprintf("BPM: %d, SpO2: %.2f%%", latest.Bpm, latest.Spo2),
			Timestamp:            time.Now(),
			UserID:               userID,
			NotificationStatusID: 1,
		} */

		/* // บันทึกและส่ง SSE
		if err := notification.CreateAndBroadcastNotification(notif); err != nil {
			log.Printf("Error creating notification: %v", err)
		} */

		// ส่งอีเมลแจ้งเตือน background
		alertText := ""
		if latest.Bpm >= 120 {
			alertText += fmt.Sprintf("- อัตราการเต้นหัวใจสูง : %d bpm\n", latest.Bpm)
		}
		if latest.Bpm <= 50 {
			alertText += fmt.Sprintf("- อัตราการเต้นหัวใจต่ำ: %d bpm\n", latest.Bpm)
		}
		if latest.Spo2 <= 90.0 {
			alertText += fmt.Sprintf("- ออกซิเจนในเลือดต่ำ: %.2f%%\n", latest.Spo2)
		}

		var user entity.User
		user.ID = userID
		go gmail.SendImmediateAlertBackground(config.DB(), user, 1, alertText)

		// อัปเดตสถานะ alert
		userAlertStatus.Lock()
		userAlertStatus.alertSent = true
		userAlertStatus.Unlock()
	}

	// ถ้าค่ากลับสู่ปกติ ให้รีเซ็ตสถานะ alert
	if !shouldAlert && alertAlreadySent {
		userAlertStatus.Lock()
		userAlertStatus.alertSent = false
		userAlertStatus.Unlock()
	}
}
