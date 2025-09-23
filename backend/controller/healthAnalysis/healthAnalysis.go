package healthAnalysis

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"

	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/controller/gmail"
	"github.com/JanisataMJ/WebApp/entity"
)

// GET /list-healthAnalysis
func ListHealthAnalysis(c *gin.Context) {
	var analysis []entity.HealthAnalysis

	// preload HealthData, RiskLevel, Notification
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

	// แปลง id เป็น uint
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
    Joins("JOIN health_data ON health_data.id = health_analysis.health_data_id").
    Where("health_analysis.category = ? AND health_data.user_id = ?", "การนอนหลับ", userId).
    Preload("HealthData").
    Preload("RiskLevel").
    Find(&analyses).Error; err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
    return
}

    c.JSON(http.StatusOK, analyses)
}


// วิเคราะห์ข้อมูลสุขภาพโดยใช้ Gemini สำหรับผู้ใช้เฉพาะราย
func AnalyzeHealthDataWithGemini(ctx context.Context, userID uint) error {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("GEMINI_API_KEY environment variable not set")
	}

	// ดึงข้อมูลสุขภาพของผู้ใช้รายนั้นจากฐานข้อมูล
	var healthData []entity.HealthData
	if err := config.DB().Where("user_id = ?", userID).Find(&healthData).Error; err != nil {
		return fmt.Errorf("failed to retrieve health data for user %d: %w", userID, err)
	}

	if len(healthData) == 0 {
		return fmt.Errorf("no health data found for user ID: %d", userID)
	}

	// เตรียม Prompt
	var dataString strings.Builder
	dataString.WriteString("Timestamp,Heart Rate,Steps,Blood Oxygen\n")
	for _, item := range healthData {
		dataString.WriteString(fmt.Sprintf("%s,%d,%d,%d\n", item.CreatedAt.Format("2006-01-02"), item.Bpm, item.Steps, item.Spo2))
	}

	promptText := fmt.Sprintf(
		"วิเคราะห์แนวโน้มสุขภาพจากข้อมูลดิบต่อไปนี้ และสรุปผลในรูปแบบที่เข้าใจง่าย\n"+
			"ข้อมูลประกอบด้วย: Heart Rate (อัตราการเต้นหัวใจ), Steps (จำนวนก้าว), และ Blood Oxygen (ออกซิเจนในเลือด)\n"+
			"ข้อมูลดิบ:\n"+
			"%s\n"+
			"โปรดสรุปแนวโน้มโดยรวมของสุขภาพจากข้อมูลนี้ และให้คำแนะนำที่สามารถนำไปปฏิบัติได้จริงเพื่อปรับปรุงสุขภาพ",
		dataString.String(),
	)

	// เรียกใช้ Gemini API
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return fmt.Errorf("failed to create Gemini client: %w", err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash-latest")
	resp, err := model.GenerateContent(ctx, genai.Text(promptText))
	if err != nil {
		return fmt.Errorf("failed to generate content from Gemini: %w", err)
	}

	// จัดการ Response
	var geminiResponse string
	if len(resp.Candidates) > 0 && resp.Candidates[0].Content != nil {
		for _, part := range resp.Candidates[0].Content.Parts {
			geminiResponse += fmt.Sprintf("%v", part)
		}
	} else {
		geminiResponse = "No content received from Gemini."
	}

	fmt.Printf("Analysis for user %d: %s\n", userID, geminiResponse)
	return nil
}

// ✅ Handler สำหรับ Endpoint API ที่เรียกใช้ Gemini
func AnalyzeWithGeminiHandler(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("userID"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	if err := AnalyzeHealthDataWithGemini(c.Request.Context(), uint(userID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Health analysis completed successfully"})
}

// ✅ Job สำหรับ Cron Job ที่จะทำงานทุกสัปดาห์
func WeeklyAnalysisJob(ctx context.Context) {
	var users []entity.User
	if err := config.DB().Find(&users).Error; err != nil {
		fmt.Printf("Error retrieving users for weekly analysis: %v\n", err)
		return
	}
	for _, user := range users {
		fmt.Printf("Starting weekly analysis for user ID: %d\n", user.ID)
		if err := AnalyzeHealthDataWithGemini(ctx, user.ID); err != nil {
			fmt.Printf("Error analyzing data for user %d: %v\n", user.ID, err)
		}
	}
}

// ✅ Goroutine สำหรับแจ้งเตือนแบบเรียลไทม์
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
            fmt.Printf("Error retrieving users for critical alerts: %v\n", err)
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
                alerts += fmt.Sprintf("- อัตราการเต้นหัวใจสูงผิดปกติ: %d bpm\n", latestHealthData.Bpm)
            }
            if latestHealthData.Spo2 <= criticalSpo2 {
                alerts += fmt.Sprintf("- ค่าออกซิเจนในเลือดต่ำผิดปกติ: %.2f%%\n", latestHealthData.Spo2)
            }

            if alerts != "" {
                if user.RoleID == 2 {
                    // ✅ เปลี่ยนมาเรียกใช้ฟังก์ชันสำหรับ background โดยเฉพาะ
                    gmail.SendImmediateAlertBackground(config.DB(), user, 1, alerts)
                }
            }
        }

        // หน่วงเวลาตามค่าที่ตั้งไว้ใน .env
        time.Sleep(checkInterval) 
    }
}
