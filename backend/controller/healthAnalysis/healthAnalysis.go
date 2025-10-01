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
	"github.com/JanisataMJ/WebApp/entity"
)

// ----------------------------------- API Handlers ------------------------------------
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
	// Map: Key = UserID (uint), Value = true/false (Alert กำลังถูกส่ง/ถูกส่งไปแล้ว)
	alerts map[uint]struct{
		IsAlert bool
		LastSent time.Time
		LastAlertedID uint
	} 
}{alerts: make(map[uint]struct{
	IsAlert bool 
	LastSent time.Time
	LastAlertedID uint
})} 

// StartUserRealtimeAlertMonitoring เริ่มตรวจสอบ HealthData สำหรับ userID เฉพาะ
func StartUserRealtimeAlertMonitoring(userID uint, intervalSeconds int) {
	for {
		checkUserHealth(userID)
		time.Sleep(time.Duration(intervalSeconds) * time.Second)
	}
}

func checkUserHealth(userID uint) {
	var latest entity.HealthData
	
	// 1. ดึงข้อมูลล่าสุดโดยเรียงตาม ID DESC เพื่อรับประกันว่าได้รายการล่าสุดที่ถูกบันทึก
	if err := config.DB().
		Where("user_id = ?", userID).
		Order("id desc"). // 🚩 แก้ไข: ใช้ ID desc เพื่อดึงรายการที่ถูกบันทึกใหม่ล่าสุด
		Limit(1).
		First(&latest).Error; err != nil {
		log.Printf("No health data for user %d yet: %v", userID, err)
		return
	}

	// 2. ตรวจสอบเงื่อนไขวิกฤต (Alert Condition)
	shouldAlert := latest.Bpm >= 120 || latest.Bpm <= 50 || latest.Spo2 <= 90.0

	userAlertStatus.RLock()
	status := userAlertStatus.alerts[userID]
	userAlertStatus.RUnlock()
    
    // 🚩 Logic การแจ้งเตือนที่แท้จริง: แจ้งเตือนเมื่อ ID ใหม่และวิกฤตเท่านั้น
    isNewData := latest.ID > status.LastAlertedID
    shouldSendAlert := false

    if isNewData && shouldAlert {
        shouldSendAlert = true 
    }
    
	if shouldSendAlert {
        
        // --- 3. เตรียมข้อมูล User และ Alert Text ---
		var user entity.User
		if err := config.DB().First(&user, userID).Error; err != nil {
			log.Printf("❌ Failed to fetch user %d for alert email: %v", userID, err)
			return 
		}

		alertText := ""
		if latest.Bpm >= 120 {
			alertText += fmt.Sprintf("- อัตราการเต้นหัวใจสูงผิดปกติ: %d bpm\n", latest.Bpm)
		}
		if latest.Bpm <= 50 {
			alertText += fmt.Sprintf("- อัตราการเต้นหัวใจต่ำผิดปกติ: %d bpm\n", latest.Bpm)
		}
		if latest.Spo2 <= 90.0 {
			alertText += fmt.Sprintf("- ค่าออกซิเจนในเลือดต่ำผิดปกติ: %.2f%%\n", latest.Spo2)
		}

		go gmail.SendImmediateAlertBackground(config.DB(), user, 1, alertText)

		// 🚩 5. อัปเดตสถานะและเวลาที่ส่งล่าสุด (พร้อม ID ใหม่)
		userAlertStatus.Lock()
		userAlertStatus.alerts[userID] = struct{
			IsAlert bool
			LastSent time.Time
			LastAlertedID uint
		}{
			IsAlert: true,
			LastSent: time.Now(), 
			LastAlertedID: latest.ID, // บันทึก ID ของข้อมูลที่เพิ่งใช้ส่ง Alert
		}
		userAlertStatus.Unlock()
	}

	// 🚩 6. เงื่อนไขการรีเซ็ตสถานะ (Resetting)
	// ถ้าค่ากลับสู่ปกติ (!shouldAlert) AND เคย Alert มาก่อน (status.IsAlert เป็น true)
	if !shouldAlert && status.IsAlert { 
		userAlertStatus.Lock()
		userAlertStatus.alerts[userID] = struct{
			IsAlert bool
			LastSent time.Time
			LastAlertedID uint
		}{
			IsAlert: false, // รีเซ็ตสถานะเป็นปกติ
			LastSent: time.Time{}, 
			LastAlertedID: status.LastAlertedID, // คง ID สุดท้ายที่เคย Alert ไว้
		}
		userAlertStatus.Unlock()
	}
}


// RunWeeklyAnalysisForSingleUser ดำเนินการวิเคราะห์รายสัปดาห์สำหรับผู้ใช้คนเดียว
// นี่คือฟังก์ชันที่ถูกเรียกใช้เพื่อ Trigger เมื่อมีข้อมูลใหม่ของวันใหม่
func RunWeeklyAnalysisForSingleUser(ctx context.Context, userID uint) {
	var user entity.User
	if err := config.DB().First(&user, userID).Error; err != nil {
		log.Printf("User not found for analysis: %d\n", userID)
		return
	}

	log.Printf("Starting on-demand weekly analysis for user ID: %d\n", user.ID)

	// --- 1. คำนวณช่วงเวลาเริ่มต้นของสัปดาห์ปัจจุบัน (วันจันทร์ 00:00:00) ---
	now := time.Now()

	// หาวันจันทร์ล่าสุด
	daysToMonday := int(now.Weekday() - time.Monday)
	if daysToMonday < 0 {
		daysToMonday += 7
	}
	currentWeekStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()).AddDate(0, 0, -daysToMonday)

	// --- 2. ดึงข้อมูลสัปดาห์ปัจจุบัน (จันทร์ถึงปัจจุบัน) ---
	var healthData []entity.HealthData

	if err := config.DB().
		Where("user_id = ?", user.ID).
		Where("timestamp >= ? AND timestamp <= ?", currentWeekStart, now).
		Order("timestamp ASC").
		Find(&healthData).Error; err != nil {

		log.Printf("Error retrieving current week health data for user %d: %v\n", user.ID, err)
		return
	}

	// --- 3. LOGIC ตรวจสอบข้อมูลและย้อนกลับไปสัปดาห์ที่แล้ว ---

	// เกณฑ์ขั้นต่ำ (สามารถปรับได้ตามความถี่ข้อมูล)
	minRecordsThreshold := 4

	analysisRangeStart := currentWeekStart
	analysisRangeEnd := now

	// 🚩 ตรวจสอบเงื่อนไขหลัก:
	// A. ถ้าวันนี้ยังไม่ใช่วันจันทร์ (คือเรายังอยู่ในสัปดาห์นั้นๆ)
	// B. หรือข้อมูลสัปดาห์ปัจจุบันมีน้อยเกินไป (ไม่ครบ 7 วันเต็ม)
	// ให้พิจารณาย้อนไปสัปดาห์ที่แล้ว

	shouldConsiderPreviousWeek := now.Weekday() != time.Monday || len(healthData) < minRecordsThreshold

	// ถ้าเข้าเงื่อนไขในการพิจารณาสัปดาห์ที่แล้ว
	if shouldConsiderPreviousWeek {
		log.Printf("Current week data is incomplete/early (%d records). Considering previous week data for user %d.\n", len(healthData), user.ID)

		// คำนวณช่วงเวลาสัปดาห์ที่แล้ว (จันทร์-อาทิตย์)
		previousWeekStart := currentWeekStart.AddDate(0, 0, -7)
		previousWeekEnd := currentWeekStart.AddDate(0, 0, -1)
		previousWeekEnd = time.Date(previousWeekEnd.Year(), previousWeekEnd.Month(), previousWeekEnd.Day(), 23, 59, 59, 999999999, now.Location())

		var previousWeekData []entity.HealthData
		if err := config.DB().
			Where("user_id = ?", user.ID).
			Where("timestamp >= ? AND timestamp <= ?", previousWeekStart, previousWeekEnd).
			Order("timestamp ASC").
			Find(&previousWeekData).Error; err != nil {

			log.Printf("Error retrieving previous week health data for user %d: %v\n", user.ID, err)
			return
		}

		// ถ้าสัปดาห์ที่แล้วมีข้อมูลพอ
		if len(previousWeekData) >= minRecordsThreshold {
			healthData = previousWeekData // ใช้ชุดข้อมูลสัปดาห์ที่แล้ว
			analysisRangeStart = previousWeekStart
			analysisRangeEnd = previousWeekEnd
			log.Printf("Successfully switched to previous week data (%d records) for user %d. Range: %s to %s\n",
				len(healthData), user.ID, analysisRangeStart.Format("2006-01-02"), analysisRangeEnd.Format("2006-01-02"))
		} else if len(healthData) >= minRecordsThreshold {
			// ถ้าสัปดาห์ที่แล้วข้อมูลไม่พอ แต่สัปดาห์ปัจจุบันข้อมูลพอ
			log.Printf("Previous week data insufficient. Reverting to current week data (%d records) for user %d.\n", len(healthData), user.ID)
			// ใช้ค่า analysisRangeStart, analysisRangeEnd เดิม (currentWeekStart, now)
		} else {
			log.Printf("Data still insufficient (%d records in previous week, %d in current). Aborting analysis for user %d.\n", len(previousWeekData), len(healthData), user.ID)
			return // ข้อมูลไม่พอทั้งสองสัปดาห์
		}
	} else {
		// ถ้าวันนี้เป็นวันจันทร์ และข้อมูลสัปดาห์ที่เพิ่งจบไป (currentWeekStart ถึง now) มีเพียงพอ
		log.Printf("Current week data is sufficient (%d records). Analyzing current week for user %d.\n", len(healthData), user.ID)
		// ใช้ค่า analysisRangeStart, analysisRangeEnd เดิม
	}

	log.Printf("Final analysis range: %s to %s (%d records) for user %d.\n",
		analysisRangeStart.Format("2006-01-02"),
		analysisRangeEnd.Format("2006-01-02"),
		len(healthData), user.ID)

	// --- 4. เรียกใช้ Gemini ---
	analysis, err := AnalyzeHealthDataWithGemini(ctx, user.ID, healthData)
	if err != nil {
		log.Printf("Error analyzing data for user %d: %v\n", user.ID, err)
		return
	}

	// --- 5. จัดรูปแบบและส่ง Notification/Email ---

	// เตรียมเนื้อหา HTML สำหรับ Email
	var htmlContent strings.Builder
	htmlContent.WriteString(fmt.Sprintf("<p>สวัสดีครับ/ค่ะ คุณ %s,</p>", user.FirstName))
	htmlContent.WriteString(fmt.Sprintf("<p>นี่คือสรุปข้อมูลสุขภาพสำหรับช่วง <b>%s ถึง %s</b> ของคุณจาก Gemini:</p>",
		analysisRangeStart.Format("2006-01-02"),
		analysisRangeEnd.Format("2006-01-02")))
	htmlContent.WriteString("<ul>")

	// ลบเครื่องหมาย Markdown และแปลงเป็น <li>
	lines := strings.Split(analysis, "\n")
	for _, line := range lines {
		// ลบ ** และ *
		cleanedLine := strings.ReplaceAll(line, "**", "")
		cleanedLine = strings.ReplaceAll(cleanedLine, "*", "")
		cleanedLine = strings.TrimSpace(cleanedLine)

		if len(cleanedLine) > 0 {
			htmlContent.WriteString("<li>" + cleanedLine + "</li>")
		}
	}
	htmlContent.WriteString("</ul>")

	// 5.1 สร้าง entity.Notification
	notif := entity.Notification{
		Timestamp: time.Now(),
		Title: fmt.Sprintf("สรุปสุขภาพรายสัปดาห์ (%s - %s)",
			analysisRangeStart.Format("01/02"),
			analysisRangeEnd.Format("01/02")),
		Message:              analysis, // Message ยังคงเก็บข้อความต้นฉบับที่มี \n และ ** เพื่อให้ Frontend จัดการได้
		UserID:               user.ID,
		NotificationStatusID: 2,
	}
	if err := config.DB().Create(&notif).Error; err != nil {
		log.Printf("Failed to save weekly summary notification for user %d: %v", user.ID, err)
	}

	// 5.2 ส่งอีเมลด้วยเนื้อหา HTML
	emailBody := htmlContent.String()
	if err := gmail.SendEmail(user.Email, "Weekly Health Summary Update", emailBody); err != nil {
		log.Printf("Failed to send email to user %d: %v", user.ID, err)
	}

	log.Printf("Completed analysis and notification for user ID: %d\n", user.ID)
}
