package notification

import (
	"net/http"
	"time"

	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
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
		HealthSummaryID      uint      `json:"health_summary_id"`
		HealthAnalysisID     uint      `json:"health_analysis_id"`
		TrendsID             uint      `json:"trends_id"`
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
		TrendsID:             input.TrendsID,
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
		Preload("Trends").
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