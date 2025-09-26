package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/controller/admin_count"
	"github.com/JanisataMJ/WebApp/controller/article"
	"github.com/JanisataMJ/WebApp/controller/gender"
	"github.com/JanisataMJ/WebApp/controller/gmail"
	"github.com/JanisataMJ/WebApp/controller/healthAnalysis"
	"github.com/JanisataMJ/WebApp/controller/healthData"
	"github.com/JanisataMJ/WebApp/controller/healthSummary"
	"github.com/JanisataMJ/WebApp/controller/notification"
	"github.com/JanisataMJ/WebApp/controller/smartwatchDevice"
	"github.com/JanisataMJ/WebApp/controller/user"
	"github.com/JanisataMJ/WebApp/middlewares"
	"github.com/JanisataMJ/WebApp/seed"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

const PORT = "8000"

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func getClient(config *oauth2.Config) *http.Client {
	tokFile := "token.json"
	tok, err := tokenFromFile(tokFile)
	if err != nil {
		tok = getTokenFromWeb(config)
		saveToken(tokFile, tok)
	}
	return config.Client(context.Background(), tok)
}

func getTokenFromWeb(config *oauth2.Config) *oauth2.Token {
	authURL := config.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	fmt.Printf("Go to the following link in your browser then type the " +
		"authorization code: \n%v\n", authURL)

	var authCode string
	if _, err := fmt.Scan(&authCode); err != nil {
		log.Fatalf("Unable to read authorization code: %v", err)
	}

	tok, err := config.Exchange(context.TODO(), authCode)
	if err != nil {
		log.Fatalf("Unable to retrieve token from web: %v", err)
	}
	return tok
}

func tokenFromFile(file string) (*oauth2.Token, error) {
	f, err := os.Open(file)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	tok := &oauth2.Token{}
	err = json.NewDecoder(f).Decode(tok)
	return tok, err
}

func saveToken(path string, token *oauth2.Token) {
	fmt.Printf("Saving credential file to: %s\n", path)
	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		log.Fatalf("Unable to cache oauth token: %v", err)
	}
	defer f.Close()
	err = json.NewEncoder(f).Encode(token)
	if err != nil {
		log.Fatalf("Unable to save oauth token: %v", err)
	}
}

func findColumnIndex(header []interface{}, name string) (int, error) {
	for i, col := range header {
		if col.(string) == name {
			return i, nil
		}
	}
	return -1, fmt.Errorf("column '%s' not found in header", name)
}

func parseTime(timeStr string) (time.Time, error) {
    layouts := []string{
        "2/1/2006, 15:04:05", 
        "2/1/2006 15:04:05",  
    }

    for _, layout := range layouts {
        t, err := time.Parse(layout, timeStr)
        if err == nil {
            return t, nil
        }
    }
    return time.Time{}, fmt.Errorf("failed to parse time string '%s' with any known layout", timeStr)
}

func importHealthData(db *sql.DB, spreadsheetID, readRange string) {
	b, err := os.ReadFile("credentials.json")
	if err != nil {
		log.Fatalf("Unable to read client secret file: %v", err)
	}
	config, err := google.ConfigFromJSON(b, sheets.SpreadsheetsReadonlyScope)
	if err != nil {
		log.Fatalf("Unable to parse client secret file to config: %v", err)
	}
	client := getClient(config)
	srv, err := sheets.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		log.Fatalf("Unable to retrieve Sheets client: %v", err)
	}

	resp, err := srv.Spreadsheets.Values.Get(spreadsheetID, readRange).Do()
	if err != nil || resp.Values == nil {
		log.Fatalf("Unable to retrieve data from sheet: %v", err)
	}
	fmt.Println("Data retrieved from Google Sheets. Now importing to SQLite...")

	sqlStmt := `
	CREATE TABLE IF NOT EXISTS health_data (
		user_id INTEGER,
		timestamp DATETIME,
		bpm INTEGER,
		steps INTEGER,
		spo2 INTEGER,
		sleep_hours TEXT,
		calories_burned INTEGER,
		UNIQUE(user_id, timestamp)
	);
	`
	_, err = db.Exec(sqlStmt)
	if err != nil {
		log.Printf("Failed to create table: %v", err)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		log.Fatal(err)
	}
	stmt, err := tx.Prepare("INSERT OR IGNORE INTO health_data(user_id, timestamp, bpm, steps , spo2, sleep_hours, calories_burned) VALUES(?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()

	if len(resp.Values) < 2 {
		log.Println("No data to import (header only or empty sheet)")
		return
	}

	header := resp.Values[0]
	dataRows := resp.Values[1:]

	userIndex, err := findColumnIndex(header, "user_id")
	if err != nil {
		log.Fatal(err)
	}
	timeIndex, err := findColumnIndex(header, "Time")
	if err != nil {
		log.Fatal(err)
	}
	heartRateIndex, err := findColumnIndex(header, "HeartRate")
	if err != nil {
		log.Fatal(err)
	}
	stepsIndex, err := findColumnIndex(header, "Steps")
	if err != nil {
		log.Fatal(err)
	}
	spo2Index, err := findColumnIndex(header, "SpO2")
	if err != nil {
		log.Fatal(err)
	}
	sleepIndex, err := findColumnIndex(header, "Sleep")
	if err != nil {
		log.Fatal(err)
	}
	caloriesIndex, err := findColumnIndex(header, "Calories")
	if err != nil {
		log.Fatal(err)
	}
	
	for _, row := range dataRows {
		if len(row) > caloriesIndex { 
			userID, err := strconv.Atoi(row[userIndex].(string))
			if err != nil {
				log.Printf("Failed to parse user_id '%s': %v", row[userIndex], err)
				continue
			}

			timeStr := row[timeIndex].(string)
			t, err := parseTime(timeStr)
			if err != nil {
				log.Printf("Failed to parse time string '%s': %v", timeStr, err)
				continue
			}

			formattedTime := t.Format("2006-01-02 15:04:05")

			bpm, _ := strconv.Atoi(row[heartRateIndex].(string))
			steps, _ := strconv.Atoi(row[stepsIndex].(string))
			
			var spo2 int
			if row[spo2Index] != nil && row[spo2Index].(string) != "" {
				spo2, _ = strconv.Atoi(row[spo2Index].(string))
			}
			
			sleepHours := row[sleepIndex].(string)
			
			var caloriesBurned int
			if row[caloriesIndex] != nil && row[caloriesIndex].(string) != "" {
				caloriesBurned, _ = strconv.Atoi(row[caloriesIndex].(string))
			}
		
			_, err = stmt.Exec(userID, formattedTime, bpm, steps, spo2, sleepHours, caloriesBurned)
			if err != nil {
				log.Printf("Failed to insert row for user %d at time %s: %v", userID, formattedTime, err)
			}
		} else {
			log.Printf("Skipping row due to insufficient columns: %v", row)
		}
	}
	tx.Commit()
	fmt.Println("Data has been successfully imported to the database.")
}

func startDataImportJob(sqlDB *sql.DB, spreadsheetID, readRange string) {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			log.Println("Running scheduled health data import...")
			importHealthData(sqlDB, spreadsheetID, readRange)
		}
	}
}


func main() {
	emailUser := os.Getenv("EMAIL_USER")
	emailPass := os.Getenv("EMAIL_PASS")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")

	log.Println("Email User:", emailUser)
	log.Println("Email Pass:", emailPass)
	log.Println("SMTP Host:", smtpHost, "Port:", smtpPort)

	config.ConnectionDB()
	gormDB := config.DB()
	config.SetupDatabase()

	seed.SeedHealthData(gormDB)
	seed.SeedHealthDataTwoWeeks(gormDB)

	sqlDB, err := gormDB.DB()
	if err != nil {
		log.Fatalf("Failed to get *sql.DB from GORM: %v", err)
	}

	importHealthData(sqlDB, "1sX8ZK_x9bYX14IrAUvPjw_tj8ASTbvB0z8BleX9gCuE", "Data!A1:G")

	go startDataImportJob(sqlDB, "1sX8ZK_x9bYX14IrAUvPjw_tj8ASTbvB0z8BleX9gCuE", "Data!A1:G")

	// Gin framework setup
	r := gin.Default()
	r.Use(CORSMiddleware())
	r.Use(middlewares.DBMiddleware(config.DB()))

	// Define routes...
	r.POST("/signup", users.SignUp)
	r.POST("/signin", users.SignIn)
	r.POST("/create-admin", users.CreateAdmin)

	router := r.Group("/")
	{
		router.Use(middlewares.Authorizes())
		r.Static("/uploads", "./uploads")
		router.PUT("/user/:id", users.Update)
		router.GET("/users", users.GetAll)
		router.GET("/user/:id", users.Get)
		router.DELETE("/user/:id", users.Delete)
		router.POST("/create-notification/:id", notification.CreateNotification)
		router.GET("/notification/:id", notification.GetNotificationsByUserID)
		router.PATCH("/notification/:id/status", notification.UpdateNotificationStatusByID)
		router.GET("/send-weekly-summary/:userID", func(c *gin.Context) {
			id, _ := strconv.Atoi(c.Param("userID"))
			go gmail.SendWeeklySummary(config.DB(), uint(id))
			c.JSON(200, gin.H{"message": "Weekly summary email process started", "userID": id})
		})
		router.POST("/check-realtime-alert", gmail.SendRealtimeAlert)
		router.POST("/create-article/:id", article.CreateArticle)
		router.GET("/list-article", article.ListArticles)
		router.GET("/article/:id", article.GetArticleByID)
		router.PUT("/update-article/:id", article.UpdateArticle)
		router.DELETE("/delete-article/:id", article.DeleteArticle)
		router.PUT("/article/:id/publishArticleNow", article.PublishArticleNow)
		router.PUT("/article/:id/unpublishArticle", article.UnpublishArticle)
		router.GET("/list-healthSummary", healthSummary.ListHealthSummary)
		router.GET("/healthSummary/:id", healthSummary.GetHealthSummary)
		router.GET("/healthSummary/weekly/:id", healthSummary.GetWeeklySummary)
		router.GET("/list-healthAnalysis", healthAnalysis.ListHealthAnalysis)
		router.GET("/healthAnalysis/:id", healthAnalysis.GetHealthAnalysis)
		router.GET("/sleep-analysis/:id", healthAnalysis.GetSleepAnalysisByUser)
		router.POST("/analyze-with-gemini/:userID", healthAnalysis.AnalyzeWithGeminiHandler)
		router.POST("/create-healthAnalysis/:id", healthAnalysis.CreateHealthAnalysis)
		router.GET("/list-healthData", healthData.ListHealthData)
		router.GET("/healthData/:id", healthData.GetHealthDataByUserID)
		router.GET("/healthData/weekly/:id", healthData.GetWeeklyHealthData)
		router.GET("/daily-heart-rate", healthData.GetDailyHeartRate)
		router.GET("/daily-steps", healthData.GetDailySteps)
		router.GET("/daily-calories", healthData.GetDailyCalories)
		router.GET("/daily-spo2", healthData.GetDailySpo2)
		router.GET("/daily-sleep", healthData.GetDailySleep)
		router.POST("/create-smartwatch/:id", smartwatchDevice.CreateSmartwatchDevice)
		router.GET("/smartwatch/:id", smartwatchDevice.GetSmartwatchDevice)
		router.GET("/admin-counts", count.GetAdminCounts)
	}

	r.GET("/genders", genders.GetAll)
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	go healthAnalysis.CheckForCriticalAlerts(context.Background())
	go healthAnalysis.WeeklyAnalysisJob(context.Background())
	r.Run("localhost:" + PORT)
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}