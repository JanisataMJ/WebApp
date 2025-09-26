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
	"regexp"

    "github.com/gin-gonic/gin"
    "github.com/google/generative-ai-go/genai"
    "google.golang.org/api/option"

    "github.com/JanisataMJ/WebApp/config"
    "github.com/JanisataMJ/WebApp/controller/gmail"
    "github.com/JanisataMJ/WebApp/entity"
)


func AnalyzeHealthData(hd entity.HealthData) []entity.HealthAnalysis {
    var results []entity.HealthAnalysis

    if hd.Bpm > 0 {
        results = append(results, InterpretHeartRate(hd))
    }
    if hd.Spo2 > 0 {
        results = append(results, InterpretSpO2(hd))
    }
    if hd.Steps > 0 {
        results = append(results, InterpretSteps(hd))
    }
    if hd.CaloriesBurned > 0 {
        results = append(results, InterpretCalories(hd))
    }
    if hd.SleepHours != "" {
        results = append(results, InterpretSleep(hd))
    }

    return results
}

func InterpretHeartRate(hd entity.HealthData) entity.HealthAnalysis {
	var interpretation, suggestion string
	if hd.Bpm < 60 {
		interpretation = "หัวใจเต้นช้า"
		suggestion = "ควรตรวจร่างกายเพิ่มเติม"
	} else if hd.Bpm > 100 {
		interpretation = "หัวใจเต้นเร็ว"
		suggestion = "ควรพักผ่อน หลีกเลี่ยงความเครียด"
	} else {
		interpretation = "ปกติ"
		suggestion = "สุขภาพดี"
	}

	return entity.HealthAnalysis{
		Category:       "Heart Rate",
		Value:          fmt.Sprintf("%d bpm", hd.Bpm),
		Interpretation: interpretation,
		Suggestion:     suggestion,
		HealthDataID:   hd.ID,
		RiskLevelID:    1,
	}
}

func InterpretSpO2(hd entity.HealthData) entity.HealthAnalysis {
	var interpretation, suggestion string
	if hd.Spo2 >= 96 {
		interpretation = "ปกติ"
		suggestion = "สุขภาพดี"
	} else if hd.Spo2 >= 90 {
		interpretation = "ต่ำ"
		suggestion = "ควรเฝ้าระวัง"
	} else {
		interpretation = "อันตราย"
		suggestion = "ควรพบแพทย์ทันที"
	}

	return entity.HealthAnalysis{
		Category:       "SpO2",
		Value:          fmt.Sprintf("%.2f%%", hd.Spo2),
		Interpretation: interpretation,
		Suggestion:     suggestion,
		HealthDataID:   hd.ID,
		RiskLevelID:    1,
	}
}

func InterpretSteps(hd entity.HealthData) entity.HealthAnalysis {
	interpretation := "ดี"
	suggestion := "ทำต่อไป"
	if hd.Steps < 5000 {
		interpretation = "น้อย"
		suggestion = "ควรเดินเพิ่ม"
	}

	return entity.HealthAnalysis{
		Category:       "Steps",
		Value:          fmt.Sprintf("%d", hd.Steps),
		Interpretation: interpretation,
		Suggestion:     suggestion,
		HealthDataID:   hd.ID,
		RiskLevelID:    1,
	}
}

func InterpretCalories(hd entity.HealthData) entity.HealthAnalysis {
	return entity.HealthAnalysis{
		Category:       "Calories",
		Value:          fmt.Sprintf("%.2f kcal", hd.CaloriesBurned),
		Interpretation: "การเผาผลาญ",
		Suggestion:     "ติดตามผลอย่างต่อเนื่อง",
		HealthDataID:   hd.ID,
		RiskLevelID:    1,
	}
}

func InterpretSleep(hd entity.HealthData) entity.HealthAnalysis {
	return entity.HealthAnalysis{
		Category:       "Sleep",
		Value:          fmt.Sprintf("%s ชั่วโมง", hd.SleepHours),
		Interpretation: "คุณภาพการนอน",
		Suggestion:     "ควรนอน 7-8 ชั่วโมง",
		HealthDataID:   hd.ID,
		RiskLevelID:    1,
	}
}

// POST /sync-health-analysis
/* func SyncHealthAnalysis(c *gin.Context) {
    db := config.DB()

    var healthDataList []entity.HealthData

    // โหลด HealthData ทั้งหมด พร้อม HealthAnalysis ที่มีอยู่แล้ว
    if err := db.
        Preload("HealthAnalysis").
        Find(&healthDataList).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    var created []entity.HealthAnalysis

    for _, hd := range healthDataList {
        // map category ที่มีอยู่แล้ว
        existingCategories := map[string]bool{}
        for _, ha := range hd.HealthAnalysis {
            existingCategories[ha.Category] = true
        }

        // วิเคราะห์ใหม่
        analyses := AnalyzeHealthData(hd)
        for _, a := range analyses {
            if !existingCategories[a.Category] {
                if err := db.Create(&a).Error; err != nil {
                    c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
                    return
                }
                created = append(created, a)
            }
        }
    }

    c.JSON(http.StatusOK, gin.H{
        "message": fmt.Sprintf("✅ สร้าง HealthAnalysis ใหม่ %d รายการ", len(created)),
        "data":    created,
    })
} */

// POST /create-health-analysis/:healthDataID
func CreateHealthAnalysis(c *gin.Context) {
    db := config.DB()

    // ดึง healthDataID จาก param
    id := c.Param("healthDataID")
    healthDataID, err := strconv.ParseUint(id, 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid healthDataID"})
        return
    }

    // ค้นหา HealthData
    var hd entity.HealthData
    if err := db.Preload("HealthAnalysis").First(&hd, healthDataID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "HealthData not found"})
        return
    }

    // เก็บ category ที่มีอยู่แล้ว
    existingCategories := map[string]bool{}
    for _, ha := range hd.HealthAnalysis {
        existingCategories[ha.Category] = true
    }

    // วิเคราะห์ใหม่
    analyses := AnalyzeHealthData(hd)

    var created []entity.HealthAnalysis
    for _, a := range analyses {
        if !existingCategories[a.Category] {
            if err := db.Create(&a).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
                return
            }
            created = append(created, a)
        }
    }

    c.JSON(http.StatusOK, gin.H{
        "message": fmt.Sprintf("✅ HealthAnalysis created for HealthDataID %d", hd.ID),
        "created": created,
    })
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

// AnalyzeHealthDataWithGemini ส่งข้อมูลสุขภาพไปให้ Gemini วิเคราะห์ (ฟังก์ชันนี้ไม่ขึ้นกับ Gin)
func AnalyzeHealthDataWithGemini(ctx context.Context, userID uint, healthData []entity.HealthData) (string, error) {
    apiKey := os.Getenv("GEMINI_API_KEY")
    if apiKey == "" {
        return "", fmt.Errorf("GEMINI_API_KEY environment variable not set")
    }
    if len(healthData) == 0 {
        return "No health data found for this period.", nil
    }

    var dataString strings.Builder
dataString.WriteString("Timestamp,Heart Rate,Steps,Blood Oxygen,Sleep,Calories,Body Temperature\n")

// ✅ สร้าง Regular Expression เพื่อค้นหาตัวเลข
re := regexp.MustCompile(`\d+(\.\d+)?`)

for _, item := range healthData {
    // 1. ค้นหาตัวเลขทั้งหมดในสตริง SleepHours
    matches := re.FindAllString(item.SleepHours, -1)
    
    var sleepValue float64
    if len(matches) > 0 {
        if len(matches) == 1 {
            // กรณีมีแค่ตัวเลขชั่วโมง เช่น "6"
            sleepValue, _ = strconv.ParseFloat(matches[0], 64)
        } else if len(matches) >= 2 {
            // กรณีมีทั้งชั่วโมงและนาที เช่น "10 h. 30 m."
            hours, _ := strconv.ParseFloat(matches[0], 64)
            minutes, _ := strconv.ParseFloat(matches[1], 64)
            sleepValue = hours + (minutes / 60.0) // แปลงนาทีเป็นส่วนของชั่วโมง
        }
    } else {
        log.Printf("No numeric sleep data found for user %d: '%s'", userID, item.SleepHours)
    }

        dataString.WriteString(fmt.Sprintf("%s,%d,%d,%.2f,%.2f,%.2f\n",
            item.CreatedAt.Format("2006-01-02"),
            item.Bpm,
            item.Steps,
            item.Spo2,
            sleepValue,
            item.CaloriesBurned,
        ))
    }

    promptText := fmt.Sprintf(
        "วิเคราะห์แนวโน้มสุขภาพจากข้อมูลดิบต่อไปนี้ สรุปผลในรูปแบบที่เข้าใจง่ายและให้คำแนะนำสุขภาพที่เป็นประโยชน์ (ตอบเป็นภาษาไทย)\n"+
            "ข้อมูลประกอบด้วย: อัตราการเต้นหัวใจ (BPM), จำนวนก้าว, ออกซิเจนในเลือด (SpO2), ชั่วโมงการนอนหลับ, แคลอรี่ที่ใช้ไป, และอุณหภูมิร่างกาย\n"+
            "ข้อมูลดิบ:\n"+
            "%s\n"+
            "โปรดสรุปแนวโน้มโดยรวมของสุขภาพ และให้คำแนะนำที่สามารถนำไปปฏิบัติได้จริงเพื่อปรับปรุงสุขภาพ",
        dataString.String(),
    )

    client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
    if err != nil {
        return "", fmt.Errorf("failed to create Gemini client: %w", err)
    }
    defer client.Close()

    model := client.GenerativeModel("gemini-1.5-flash-latest")
    resp, err := model.GenerateContent(ctx, genai.Text(promptText))
    if err != nil {
        return "", fmt.Errorf("failed to generate content from Gemini: %w", err)
    }

    var geminiResponse string
    if len(resp.Candidates) > 0 && resp.Candidates[0].Content != nil {
        for _, part := range resp.Candidates[0].Content.Parts {
            geminiResponse += fmt.Sprintf("%v", part)
        }
    } else {
        geminiResponse = "ไม่สามารถรับการวิเคราะห์จาก Gemini ได้"
    }
    return geminiResponse, nil
}

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
        // เรียกใช้ Gemini เพื่อรับข้อความวิเคราะห์
analysis, err := AnalyzeHealthDataWithGemini(ctx, user.ID, healthData)
if err != nil {
    log.Printf("Error analyzing data for user %d: %v\n", user.ID, err)
    continue
}

// ✅ จัดรูปแบบข้อความให้สวยงามด้วยการสร้าง HTML
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
    NotificationStatusID: 1,
}
if err := config.DB().Create(&notif).Error; err != nil {
    log.Printf("Failed to save weekly summary notification for user %d: %v", user.ID, err)
}

// ✅ ส่งอีเมลด้วยเนื้อหา HTML
emailBody := htmlContent.String()
if err := gmail.SendEmail(user.Email, "Weekly Health Summary", emailBody, "text/html"); err != nil {
    log.Printf("Failed to send email to user %d: %v", user.ID, err)
}
    }
}