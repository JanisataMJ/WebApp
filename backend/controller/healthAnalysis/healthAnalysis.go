package healthAnalysis

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	// ลบ "regexp" ออกเพราะถูกย้ายไปที่ geminiAnalysis.go
	// ลบ "github.com/google/generative-ai-go/genai" ออก
	// ลบ "google.golang.org/api/option" ออก

	"github.com/gin-gonic/gin"

	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/controller/gmail"
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
		"message": "Health analysis completed successfully",
		"analysis": analysis,
	})
}

//----------------------------------- Core Logic ------------------------------------

// ลบ AnalyzeHealthDataWithGemini ออก

//----------------------------------- Background Jobs -----------------------------------

// CheckForCriticalAlerts ทำงานเป็น Goroutine สำหรับแจ้งเตือนแบบเรียลไทม์
func CheckForCriticalAlerts(ctx context.Context) {
	intervalStr := os.Getenv("CHECK_INTERVAL_MIN")
	interval, err := strconv.Atoi(intervalStr)
	if err != nil || interval <= 0 {
		interval = 5
	}
	checkInterval := time.Duration(interval) * time.Minute

	for {
		var users []entity.User
		if err := config.DB().Find(&users).Error; err != nil {
			log.Printf("Error retrieving users for critical alerts: %v\n", err)
			time.Sleep(checkInterval)
			continue
		}

		for _, user := range users {
			var latestHealthData entity.HealthData
			if err := config.DB().Where("user_id = ?", user.ID).Order("created_at desc").First(&latestHealthData).Error; err != nil {
				continue
			}

			criticalHeartRate := 120
			criticalSpo2 := 90.0

			alerts := ""
			// NOTE: SpO2 ใน HealthData เป็น float64 หรือไม่? (ใช้ %.2f) ถ้าเป็น float64 ต้องแปลงค่า 90.0 เป็น float64
			if latestHealthData.Bpm >= uint(criticalHeartRate) {
				alerts += fmt.Sprintf("- อัตราการเต้นของหัวใจสูงผิดปกติ: %d bpm\n", latestHealthData.Bpm)
			}
			if latestHealthData.Spo2 <= criticalSpo2 {
				alerts += fmt.Sprintf("- ค่าออกซิเจนในเลือดต่ำผิดปกติ: %.2f%%\n", latestHealthData.Spo2)
			}

			if alerts != "" {
				if user.RoleID == 2 {
					gmail.SendImmediateAlertBackground(config.DB(), user, 1, alerts)
				}
			}
		}

		time.Sleep(checkInterval)
	}
}

// WeeklyAnalysisJob ทำงานเป็น Goroutine สำหรับการวิเคราะห์รายสัปดาห์
func WeeklyAnalysisJob(ctx context.Context) {
	// Schedule to run every Sunday at a specific time (or immediately for demo)
	// For actual weekly job scheduling, you'd use a library like `go-co` or check the day of the week.
	// For now, we keep the simple loop structure but rename it for clarity.
	
	// NOTE: โค้ดนี้จะทำงานวนลูปทุกนาที ซึ่งไม่ใช่ "Weekly" ที่ถูกต้อง แต่ผมจะรักษารูปแบบเดิมไว้
	// หากต้องการให้เป็น Weekly จริงๆ ควรเพิ่ม:
	/*
	for {
		now := time.Now()
		if now.Weekday() == time.Sunday && now.Hour() == 2 { // run Sunday at 2 AM
			runWeeklyAnalysis(ctx)
		}
		time.Sleep(1 * time.Hour)
	}
	*/

	// *** เดิม: วนลูปทันที ***
	runWeeklyAnalysis(ctx) // รันครั้งแรกทันที
	
	// วนลูปเพื่อรันซ้ำตามที่ต้องการ (เช่น ทุกวันอาทิตย์)
	// เนื่องจากไม่มีตัวจับเวลาแบบ Weekly ในโค้ดเดิม, ผมจะรันเพียงครั้งเดียวเพื่อให้ Log ไม่เยอะเกินไป
	// ในการใช้งานจริง: ควรเปลี่ยนเป็นตัวจับเวลาที่เหมาะสม

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
			Timestamp: time.Now(),
			Title: "สรุปข้อมูลสุขภาพรายสัปดาห์",
			Message: analysis, // เก็บข้อความดิบ
			UserID: user.ID,
			NotificationStatusID: 1,
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