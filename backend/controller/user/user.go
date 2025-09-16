package users

import (
   "net/http"
   "time"
   "strconv"

   "github.com/gin-gonic/gin"
   "github.com/JanisataMJ/WebApp/config"
   "github.com/JanisataMJ/WebApp/entity"
)


func GetAll(c *gin.Context) {
    var users []entity.User

    db := config.DB()

    results := db.Preload("Gender").Preload("Role").Find(&users)

    if results.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
        return
    }
    c.JSON(http.StatusOK, users)
}


func Get(c *gin.Context) {
   ID := c.Param("id")

   var user entity.User

   db := config.DB()

   results := db.Preload("Gender").First(&user, ID)
   if results.Error != nil {
       c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
       return
   }

   if user.ID == 0 {
       c.JSON(http.StatusNoContent, gin.H{})
       return
   }
   c.JSON(http.StatusOK, user)
}


/*func Update(c *gin.Context) {
   var user entity.User

   UserID := c.Param("id")

   db := config.DB()

   result := db.First(&user, UserID)
   if result.Error != nil {
       c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
       return
   }

   if err := c.ShouldBindJSON(&user); err != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
       return
   }

   result = db.Save(&user)
   if result.Error != nil {
       c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
       return
   }
   c.JSON(http.StatusOK, gin.H{"message": "Updated successful"})
}*/
func Update(c *gin.Context) {
	var user entity.User

	UserID := c.Param("id")
	db := config.DB()

	result := db.First(&user, UserID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	// รับค่าฟอร์มทั่วไป
	if username := c.PostForm("username"); username != "" {
		user.Username = username
	}
	if email := c.PostForm("email"); email != "" {
		user.Email = email
	}
	if firstName := c.PostForm("firstName"); firstName != "" {
		user.FirstName = firstName
	}
	if lastName := c.PostForm("lastName"); lastName != "" {
		user.LastName = lastName
	}
	if birthdate := c.PostForm("birthdate"); birthdate != "" {
		if t, err := time.Parse("2006-01-02", birthdate); err == nil {
			user.Birthdate = t
		}
	}
	if genderID := c.PostForm("genderID"); genderID != "" {
		if id, err := strconv.ParseUint(genderID, 10, 32); err == nil {
			user.GenderID = uint(id)
		}
	}
	if phonenumber := c.PostForm("phonenumber"); phonenumber != "" {
		user.Phonenumber = phonenumber
	}

	// รับค่าตัวเลขร่างกาย
	if height := c.PostForm("height"); height != "" {
		if h, err := strconv.ParseFloat(height, 64); err == nil {
			user.Height = h
		}
	}
	if weight := c.PostForm("weight"); weight != "" {
		if w, err := strconv.ParseFloat(weight, 64); err == nil {
			user.Weight = w
		}
	}
	if bust := c.PostForm("bust"); bust != "" {
		if b, err := strconv.ParseFloat(bust, 64); err == nil {
			user.Bust = b
		}
	}
	if waist := c.PostForm("waist"); waist != "" {
		if w, err := strconv.ParseFloat(waist, 64); err == nil {
			user.Waist = w
		}
	}
	if hip := c.PostForm("hip"); hip != "" {
		if h, err := strconv.ParseFloat(hip, 64); err == nil {
			user.Hip = h
		}
	}

	// รับไฟล์รูป
	file, err := c.FormFile("profile")
	if err == nil {
		filePath := "uploads/" + file.Filename
		if err := c.SaveUploadedFile(file, filePath); err == nil {
			user.Profile = filePath
		}
	}

	// บันทึกลง DB
	result = db.Save(&user)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Updated successful"})
}



/*func Delete(c *gin.Context) {
   id := c.Param("id")

   db := config.DB()

   if tx := db.Exec("DELETE FROM users WHERE id = ?", id); tx.RowsAffected == 0 {
       c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
       return
   }
   c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})
}*/
func Delete(c *gin.Context) {
    id := c.Param("id")
    currentAdminID := c.GetString("currentUserID") // สมมติคุณเก็บ ID ของผู้ล็อกอินไว้ใน context

    if id == currentAdminID {
        c.JSON(http.StatusForbidden, gin.H{"error": "ไม่สามารถลบบัญชีของตัวเองได้"})
        return
    }

    db := config.DB()

    if tx := db.Exec("DELETE FROM users WHERE id = ?", id); tx.RowsAffected == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})
}
