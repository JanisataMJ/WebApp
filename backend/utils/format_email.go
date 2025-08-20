package utils

import (
	"fmt"
	"os"
	"strconv"
	"gopkg.in/gomail.v2"
	"github.com/JanisataMJ/WebApp/entity"
)

// ส่ง HTML email
func SendHealthNotificationEmail(user entity.User, summary entity.HealthSummary, analyses []entity.HealthAnalysis) error {
    m := gomail.NewMessage()
    m.SetHeader("From", os.Getenv("EMAIL_USER"))
    m.SetHeader("To", user.Email)
    m.SetHeader("Subject", "Hourly Health Summary & Alerts")

    body := GenerateHealthNotificationHTML(user.Username, summary, analyses)
    m.SetBody("text/html", body)

    port, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))
    d := gomail.NewDialer(os.Getenv("SMTP_HOST"), port, os.Getenv("EMAIL_USER"), os.Getenv("EMAIL_PASS"))
    return d.DialAndSend(m)
}


// สร้าง HTML email
func GenerateHealthNotificationHTML(username string, summary entity.HealthSummary, analyses []entity.HealthAnalysis) string {
	alertRows := ""
	if len(analyses) > 0 {
		alertRows += `<h3 style="color:red;">⚠️ Health Alerts</h3>
		<table style="width:100%; border-collapse: collapse;">
		<tr style="background-color:#eee;"><th>Category</th><th>Value</th><th>Interpretation</th><th>Suggestion</th></tr>`
		for _, a := range analyses {
			alertRows += fmt.Sprintf(`
				<tr>
					<td style="padding:10px;">%s</td>
					<td style="padding:10px;">%s</td>
					<td style="padding:10px; color:red;">%s</td>
					<td style="padding:10px;">%s</td>
				</tr>`,
				a.Category, a.Value, a.Interpretation, a.Suggestion)
		}
		alertRows += `</table><br>`
	}

	summaryHTML := fmt.Sprintf(`
	<h3>Health Summary</h3>
	<table style="width:100%%; border-collapse: collapse;">
	<tr style="background-color:#eee;"><th>Metric</th><th>Value</th></tr>
	<tr><td style="padding:10px;">Average BPM</td><td style="padding:10px;">%.1f</td></tr>
	<tr><td style="padding:10px;">Min BPM</td><td style="padding:10px;">%d</td></tr>
	<tr><td style="padding:10px;">Max BPM</td><td style="padding:10px;">%d</td></tr>
	<tr><td style="padding:10px;">Total Steps</td><td style="padding:10px;">%d</td></tr>
	<tr><td style="padding:10px;">Average Sleep (hrs)</td><td style="padding:10px;">%.1f</td></tr>
	<tr><td style="padding:10px;">Average Calories</td><td style="padding:10px;">%.1f</td></tr>
	<tr><td style="padding:10px;">Average SpO2</td><td style="padding:10px;">%.1f%%</td></tr>
	<tr><td style="padding:10px;">Average Body Temp</td><td style="padding:10px;">%.1f°C</td></tr>
	<tr><td style="padding:10px;">Min Body Temp</td><td style="padding:10px;">%.1f°C</td></tr>
	<tr><td style="padding:10px;">Max Body Temp</td><td style="padding:10px;">%.1f°C</td></tr>
	</table>`,
		summary.AvgBpm, summary.MinBpm, summary.MaxBpm, summary.TotalSteps,
		summary.AvgSleep, summary.AvgCalories, summary.AvgSpo2,
		summary.AvgBodyTemp, summary.MinBodyTemp, summary.MaxBodyTemp)

	return fmt.Sprintf(`
	<html>
	<body style="font-family:Arial,sans-serif; background-color:#f7f7f7; padding:20px;">
		<div style="max-width:600px; margin:auto; background:#fff; padding:20px; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.1);">
			<h2>Hello %s,</h2>
			<p>Here is your latest health summary and alerts:</p>
			%s
			%s
			<p style="color:#555; margin-top:20px;">Stay healthy!</p>
		</div>
	</body>
	</html>
	`, username, alertRows, summaryHTML)
}
