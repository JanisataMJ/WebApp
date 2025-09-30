
package healthAnalysis

import (
	"context"
	"fmt"
	"log"
	"os"
	"regexp"
	"strconv"
	"strings"

	"github.com/JanisataMJ/WebApp/entity"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// parseSleepHours แปลงค่า SleepHours (เช่น "10 h. 30 m.") เป็นชั่วโมงทศนิยม
func ParseSleepHours(sleepStr string, userID uint) float64 {
	// ใช้ Regular Expression เพื่อค้นหาตัวเลขทั้งหมด
	re := regexp.MustCompile(`\d+(\.\d+)?`)
	matches := re.FindAllString(sleepStr, -1)

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
		log.Printf("No numeric sleep data found for user %d: '%s'", userID, sleepStr)
	}
	return sleepValue
}

// AnalyzeHealthDataWithGemini ส่งข้อมูลสุขภาพไปให้ Gemini วิเคราะห์
func AnalyzeHealthDataWithGemini(ctx context.Context, userID uint, healthData []entity.HealthData) (string, error) {
	log.Printf("Analyzing health data for UserID: %d. Number of records received: %d", userID, len(healthData))
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY environment variable not set")
	}
	if len(healthData) == 0 {
		return "No health data found for this period.", nil
	}

	// 1. สร้างข้อมูล CSV string สำหรับส่งให้ Gemini
	var dataString strings.Builder
	dataString.WriteString("Timestamp,Heart Rate,Steps,Blood Oxygen,Sleep (Hours),Calories\n") // ลบ Body Temperature ออกถ้าไม่มีข้อมูล

	for _, item := range healthData {
		sleepValue := ParseSleepHours(item.SleepHours, userID)
		
		dataString.WriteString(fmt.Sprintf("%s,%d,%d,%.2f,%.2f,%f\n",
			item.Timestamp.Format("2006-01-02"), // ✅ ถูกต้อง
			item.Bpm,
			item.Steps,
			item.Spo2,
			sleepValue,
			item.CaloriesBurned,
		))
	}

	// 2. สร้าง Prompt
	promptText := fmt.Sprintf(
		"วิเคราะห์แนวโน้มสุขภาพจากข้อมูลดิบต่อไปนี้ สรุปผลในรูปแบบที่เข้าใจง่ายและให้คำแนะนำสุขภาพที่เป็นประโยชน์ (ตอบเป็นภาษาไทย)\n"+
			"ข้อมูลประกอบด้วย: อัตราการเต้นหัวใจ (BPM), จำนวนก้าว, ออกซิเจนในเลือด (SpO2), ชั่วโมงการนอนหลับ (แปลงเป็นทศนิยม), และแคลอรี่ที่ใช้ไป\n"+
			"ข้อมูลดิบ:\n"+
			"%s\n"+
			"โปรดสรุปแนวโน้มโดยรวมของสุขภาพสั้นกระชับ ไม่ยาวจนเกินไป และให้คำแนะนำที่สามารถนำไปปฏิบัติได้จริงเพื่อปรับปรุงสุขภาพ โปรดเว้นวรรค ย่อหน้า ให้สวยงามด้วย",
		dataString.String(),
	)

	// 3. เรียกใช้ Gemini API
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return "", fmt.Errorf("failed to create Gemini client: %w", err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash")
	resp, err := model.GenerateContent(ctx, genai.Text(promptText))
	if err != nil {
		return "", fmt.Errorf("failed to generate content from Gemini: %w", err)
	}

	// 4. ประมวลผล Response
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
