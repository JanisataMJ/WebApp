package notification

import (
	"net/http"
	"time"
	"fmt"
	"strconv"

	"gorm.io/gorm"
	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
	"github.com/JanisataMJ/WebApp/controller/gmail"
	"github.com/gin-gonic/gin"
)

func CreateNotification(c *gin.Context) {
	var input struct {
		Title                string    `json:"title"`
		Message              string    `json:"message"`
		Timestamp            time.Time `json:"timestamp"`
		UserID               uint      `json:"user_id"`
		HealthTypeID         uint      `json:"health_type_id"`
		NotificationStatusID uint      `json:"notification_status_id"`
		HealthSummaryID      *uint     `json:"health_summary_id"`
		HealthAnalysisID     *uint     `json:"health_analysis_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}

	notification := entity.Notification{
		Title:                input.Title,
		Message:              input.Message,
		Timestamp:            input.Timestamp,
		UserID:               input.UserID,
		HealthTypeID:         input.HealthTypeID,
		NotificationStatusID: input.NotificationStatusID,
		HealthSummaryID:      input.HealthSummaryID,
		HealthAnalysisID:     input.HealthAnalysisID,
	}

	db := config.DB()
	if err := db.Create(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":      "Notification created",
		"notification": notification,
	})
}

func GetNotificationsByUserID(c *gin.Context) {
	userID := c.Param("id")
	var notifications []entity.Notification
	db := config.DB()

	result := db.Preload("User").
		Preload("HealthType").
		Preload("NotificationStatus").
		Preload("HealthSummary").
		Preload("HealthAnalysis").
		Where("user_id = ?", userID).
		Order("timestamp desc").
		Find(&notifications)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, notifications)
}

func UpdateNotification(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Title                string    `json:"title"`
		Message              string    `json:"message"`
		Timestamp            time.Time `json:"timestamp"`
		NotificationStatusID uint      `json:"notification_status_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}

	db := config.DB()
	var notification entity.Notification
	if err := db.First(&notification, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	notification.Title = input.Title
	notification.Message = input.Message
	notification.Timestamp = input.Timestamp
	notification.NotificationStatusID = input.NotificationStatusID

	if err := db.Save(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Notification updated",
		"notification": notification,
	})
}

func DeleteNotification(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	var notification entity.Notification
	if err := db.First(&notification, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	if err := db.Delete(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification deleted"})
}

func UpdateNotificationStatusByID(c *gin.Context) {
	// ดึง ID ของ Notification จาก URL param
	id := c.Param("id")

	// สร้าง struct สำหรับรับ JSON body
	var body struct {
		Status uint `json:"status"` // Status ID ตรง ๆ
	}

	// Bind JSON
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	// ค้นหา Notification
	var noti entity.Notification
	if err := db.First(&noti, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	// ตรวจสอบ Status ที่ส่งมาว่ามีอยู่ใน DB หรือไม่
	var newStatus entity.NotificationStatus
	if err := db.First(&newStatus, body.Status).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status ID"})
		return
	}

	// อัปเดต NotificationStatusID
	if err := db.Model(&noti).Update("notification_status_id", newStatus.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	// โหลด Notification ที่อัปเดตพร้อม relation
	if err := db.Preload("NotificationStatus").
		Preload("HealthType").
		First(&noti, noti.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated notification"})
		return
	}

	// ส่ง response กลับ
	c.JSON(http.StatusOK, gin.H{
		"ID":        noti.ID,
		"Timestamp": noti.Timestamp.Format(time.RFC3339),
		"Title":     noti.Title,
		"Message":   noti.Message,
		"UserID":    noti.UserID,
		"HealthType": func() interface{} {
			if noti.HealthType != nil {
				return gin.H{"ID": noti.HealthType.ID, "Type": noti.HealthType.Type}
			}
			return nil
		}(),
		"NotificationStatus": gin.H{
			"ID":     noti.NotificationStatus.ID,
			"Status": noti.NotificationStatus.Status,
		},
	})
}






var clients = map[uint]chan entity.Notification{} // map[userID]chan

// เชื่อมต่อ SSE
func ConnectSSE(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("userID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Streaming unsupported"})
		return
	}

	// สร้าง channel สำหรับ user นี้
	msgChan := make(chan entity.Notification)
	clients[uint(userID)] = msgChan

	defer func() {
		close(msgChan)
		delete(clients, uint(userID))
	}()

	for {
		select {
		case notif := <-msgChan:
			fmt.Fprintf(c.Writer, "data: %v\n\n", notif)
			flusher.Flush()
		case <-c.Request.Context().Done():
			return
		}
	}
}

// ฟังก์ชันส่ง Notification ให้ SSE
func BroadcastNotification(notif entity.Notification) {
	if ch, ok := clients[notif.UserID]; ok {
		select {
		case ch <- notif:
		default:
			// ถ้า channel เต็ม ให้ drop ไม่บล็อก
		}
	}
}

// สร้าง Notification + ส่ง SSE
func CreateAndBroadcastNotification(notif entity.Notification) error {
	db := config.DB()
	if err := db.Create(&notif).Error; err != nil {
		return err
	}
	BroadcastNotification(notif)
	return nil
}



////////////////////////////////////////////////////////////////
type HealthAlertController struct {
	DB *gorm.DB
}

// ฟังก์ชันตรวจสอบค่าผิดปกติ
func (h *HealthAlertController) CheckHealth(c *gin.Context) {
	userIDStr := c.Param("userID")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// ดึงข้อมูลล่าสุดของ health data
	var health entity.HealthData
	if err := h.DB.Where("user_id = ?", userID).
		Order("timestamp desc").
		First(&health).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลสุขภาพ"})
		return
	}

	// ตั้งค่าช่วงปกติ
	isAbnormal := false
	alertMsg := ""

	if health.Bpm < 50 || health.Bpm > 120 {
		isAbnormal = true
		alertMsg += "อัตราการเต้นหัวใจผิดปกติ (" + strconv.Itoa(int(health.Bpm)) + " bpm)\n"
	}

	if health.Spo2 < 95 {
		isAbnormal = true
		alertMsg += "ค่าออกซิเจนในเลือดต่ำ (" + strconv.FormatFloat(health.Spo2, 'f', 1, 64) + "%)\n"
	}

	if isAbnormal {
		// 1. บันทึกแจ้งเตือนลง DB
		noti := entity.Notification{
			UserID: uint(userID),
			Title:  "แจ้งเตือนสุขภาพ",
			Message: alertMsg,
			Timestamp: time.Now(),
			HealthTypeID: 2, // เช่น 2 = อันตราย
			NotificationStatusID: 1, // ยังไม่อ่าน
		}
		if err := h.DB.Create(&noti).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกแจ้งเตือน"})
			return
		}

		// 2. ส่งอีเมลไปหาผู้ใช้
		var user entity.User
		if err := h.DB.First(&user, userID).Error; err == nil {
			go gmail.SendEmail(user.Email, "แจ้งเตือนสุขภาพ", alertMsg)
		}

		c.JSON(http.StatusOK, gin.H{
			"status": "abnormal",
			"message": alertMsg,
		})
		return
	}

	// ถ้าปกติ
	c.JSON(http.StatusOK, gin.H{
		"status": "normal",
		"message": "สุขภาพอยู่ในเกณฑ์ปกติ",
	})
}