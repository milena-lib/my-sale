# MySale
 MySale

# Prod Branch
master

# Test Branch
dev

# Version control
In my-sale\android\app\build.gradle:
defaultConfig {
        ...
##  מספר פנימי של הגרסה, שמשתנה בכל עדכון (חייב להיות מספר שלם ועולה, יכול להיות פשוט מספר שרץ, משמש לזיהוי גרסה בגוגל פליי)     
        versionCode 1 
##  מספר הגרסה שמוצג למשתמשים         
        versionName "1.0.0"
    }

# Environment 

## Environment Identification
In app.json:
### Test
"name": "MySaleTest"
### Prod
"name": "MySale"

### Environment Name (displayed under app icon)
In my-sale\\android\app\src\main\res\values\strings.xml
<resources>
  <string name="app_name">MySale Test</string>
</resources>

