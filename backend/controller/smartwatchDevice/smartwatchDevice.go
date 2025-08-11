package smartwatchDevice

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/JanisataMJ/WebApp/config"
	"github.com/JanisataMJ/WebApp/entity"
)

// POST /smartwatch-devices
func CreateSmartwatchDevice(c *gin.Context) {
	var input struct {
		Name            string    `json:"name" binding:"required"`
		SerialNumber    string    `json:"serial_number"`
		ModelSmartwatch string    `json:"model_smartwatch"`
		ModelNumber     string    `json:"model_number"`
		Brand           string    `json:"brand"`
		StartDate       time.Time `json:"start_date"`
		UserID          uint      `json:"user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	device := entity.SmartwatchDevice{
		Name:            input.Name,
		SerialNumber:    input.SerialNumber,
		ModelSmartwatch: input.ModelSmartwatch,
		ModelNumber:     input.ModelNumber,
		Brand:           input.Brand,
		StartDate:       input.StartDate,
		UserID:          input.UserID,
	}

	if err := config.DB().Create(&device).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, device)
}

// GET /smartwatch-devices/:id
func GetSmartwatchDevice(c *gin.Context) {
	id := c.Param("id")

	deviceID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	var device entity.SmartwatchDevice

	if err := config.DB().
		Preload("User").
		First(&device, deviceID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "SmartwatchDevice not found"})
		return
	}

	c.JSON(http.StatusOK, device)
}