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
// POST /health-data (Handler ที่รับข้อมูลและ Trigger การวิเคราะห์)
func SaveHealthDataHandler(c *gin.Context) {
    var newData entity.HealthData
    if err := c.ShouldBindJSON(&newData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    // ตรวจสอบ user_id ต้องไม่เป็น 0
    if newData.UserID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

    // 1. ดึงข้อมูลสุขภาพล่าสุดก่อนที่จะบันทึกรายการใหม่
    var lastRecordedData entity.HealthData
    // ใช้ Order("timestamp desc") เพื่อหาเวลาวัดค่าจริงล่าสุด
    config.DB().Where("user_id = ?", newData.UserID).
        Order("timestamp desc").
        Limit(1).
        Find(&lastRecordedData)

    // 2. บันทึกข้อมูลใหม่ลง DB
    if err := config.DB().Create(&newData).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save data"})
        return
    }

    // 3. ตรวจสอบเงื่อนไข "ข้อมูลใหม่ของวันใหม่"
    newDayStr := newData.Timestamp.Format("2006-01-02")
    lastDayStr := lastRecordedData.Timestamp.Format("2006-01-02")
    
    // เงื่อนไข: วันที่ต่างกัน และไม่ใช่การบันทึกครั้งแรก
    if newDayStr != lastDayStr && lastRecordedData.ID != 0 {
        // Trigger การวิเคราะห์รายสัปดาห์แบบ Asynchronous
        go func() {
            // ใช้ context.Background() สำหรับ Background Job
            ctx := context.Background() 
            // เรียกใช้ฟังก์ชันวิเคราะห์
            RunWeeklyAnalysisForSingleUser(ctx, newData.UserID) 
        }()
    }
    
    c.JSON(http.StatusOK, gin.H{"message": "Data saved and analysis triggered (if new day data)."})
}
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
        log.Printf("Starting scheduled weekly analysis for user ID: %d\n", user.ID)
        // ใช้ฟังก์ชันที่แยกออกมา
        RunWeeklyAnalysisForSingleUser(ctx, user.ID)
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

// runWeeklyAnalysisForSingleUser ดำเนินการวิเคราะห์รายสัปดาห์สำหรับผู้ใช้คนเดียว
// นี่คือฟังก์ชันที่ถูกเรียกใช้เพื่อ Trigger เมื่อมีข้อมูลใหม่ของวันใหม่
func RunWeeklyAnalysisForSingleUser(ctx context.Context, userID uint) {
    var user entity.User
    if err := config.DB().First(&user, userID).Error; err != nil {
        log.Printf("User not found for analysis: %d\n", userID)
        return
    }

    log.Printf("Starting on-demand weekly analysis for user ID: %d\n", user.ID)

    // 1. คำนวณช่วงเวลา: วันจันทร์ (00:00:00) ถึง ปัจจุบัน (now)
    now := time.Now()
    
    daysToMonday := int(now.Weekday() - time.Monday) 
    if daysToMonday < 0 {
        daysToMonday = 6
    }
    startOfWeek := now.AddDate(0, 0, -daysToMonday)
    startOfWeek = time.Date(startOfWeek.Year(), startOfWeek.Month(), startOfWeek.Day(), 0, 0, 0, 0, now.Location())
    endOfRange := now 

    var healthData []entity.HealthData
    
    // 2. ดึงข้อมูลในช่วงที่กำหนด โดยใช้คอลัมน์ 'timestamp'
    if err := config.DB().
        Where("user_id = ?", user.ID).
        Where("timestamp >= ? AND timestamp <= ?", startOfWeek, endOfRange).
        Order("timestamp ASC"). 
        Find(&healthData).Error; err != nil {
        
        log.Printf("Error retrieving health data for user %d: %v\n", user.ID, err)
        return
    }

    // 3. เรียกใช้ Gemini (ต้องแน่ใจว่า AnalyzeHealthDataWithGemini ใช้ item.Timestamp ในการสร้าง CSV แล้ว)
    analysis, err := AnalyzeHealthDataWithGemini(ctx, user.ID, healthData)
    if err != nil {
         log.Printf("Error analyzing data for user %d: %v\n", user.ID, err)
         return
    }
    
    // 4. จัดรูปแบบและส่ง Notification/Email (คัดลอก Logic ส่วนนี้จาก runWeeklyAnalysis เดิม)
    var htmlContent strings.Builder
    htmlContent.WriteString(fmt.Sprintf("<p>สวัสดีครับ/ค่ะ คุณ %s,</p>", user.FirstName))
    htmlContent.WriteString("<p>นี่คือสรุปข้อมูลสุขภาพรายสัปดาห์ของคุณจาก Gemini:</p>")
    htmlContent.WriteString("<ul>")

    lines := strings.Split(analysis, "\n")
    for _, line := range lines {
        trimmedLine := strings.TrimSpace(line)
        if len(trimmedLine) > 0 {
            htmlContent.WriteString("<li>" + trimmedLine + "</li>")
        }
    }
    htmlContent.WriteString("</ul>")

    // สร้าง entity.Notification
    notif := entity.Notification{
        Timestamp:time.Now(),
        Title: "สรุปข้อมูลสุขภาพรายสัปดาห์",
        Message: analysis,
        UserID:  user.ID,
        NotificationStatusID: 2,
    }
    if err := config.DB().Create(&notif).Error; err != nil {
        log.Printf("Failed to save weekly summary notification for user %d: %v", user.ID, err)
    }

    // ส่งอีเมลด้วยเนื้อหา HTML
    emailBody := htmlContent.String()
    if err := gmail.SendEmail(user.Email, "Weekly Health Summary Update", emailBody, "text/html"); err != nil {
        log.Printf("Failed to send email to user %d: %v", user.ID, err)
    }
    
    log.Printf("Completed analysis and notification for user ID: %d\n", user.ID)
}