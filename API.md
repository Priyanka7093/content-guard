# Content Guard API Documentation

## 1. Overview

Content Guard is a real-time multi-modal AI content moderation system that provides APIs for analyzing text and images.

The system follows a microservices architecture. The frontend communicates with the **API Gateway**, which coordinates requests between the moderation, decision, and logging services.

### Main capabilities

* Text toxicity detection
* Image object detection
* Weapon detection
* NSFW image classification
* Moderation decision generation
* Moderation history
* Moderation statistics
* Service health monitoring

---

## 2. Architecture

The API Gateway acts as the main entry point for the frontend.

```text
Frontend
   │
   │ HTTP
   ▼
API Gateway
   │
   ├──► Text Moderation Service
   │
   ├──► Image Moderation Service
   │
   ├──► Moderation Decision Service
   │
   └──► Logging Service
```

The API Gateway combines the results from the individual services and returns a final moderation response to the client.

---

# 3. API Gateway

The API Gateway is the primary API consumed by the frontend.

## Base URL

```text
http://localhost:<API_GATEWAY_PORT>
```

> Replace `<API_GATEWAY_PORT>` with the port configured for the API Gateway.

---

## 3.1 Health Check

### `GET /health`

Checks whether the API Gateway is running.

### Response

```json
{
  "status": "healthy"
}
```

---

# 4. Text Moderation API

## 4.1 Moderate Text

### `POST /moderate/text`

Analyzes submitted text for toxic content.

The API Gateway internally:

1. Sends the text to the Text Moderation Service.
2. Receives toxicity and confidence information.
3. Sends the result to the Moderation Decision Service.
4. Stores the moderation result through the Logging Service.
5. Returns the final moderation result.

### Request

Content-Type:

```text
application/json
```

### Request Body

```json
{
  "text": "Example text to moderate"
}
```

### Response

```json
{
  "input": "Example text to moderate",
  "toxic": false,
  "confidence": 0.1234,
  "verdict": "SAFE",
  "reasons": []
}
```

### Response Fields

| Field        | Type    | Description                          |
| ------------ | ------- | ------------------------------------ |
| `input`      | string  | Original submitted text              |
| `toxic`      | boolean | Whether toxic content was detected   |
| `confidence` | float   | Model confidence score               |
| `verdict`    | string  | Final moderation decision            |
| `reasons`    | array   | Reasons associated with the decision |

---

# 5. Image Moderation API

## 5.1 Moderate Image

### `POST /moderate/image`

Analyzes an uploaded image using multiple AI models.

The API Gateway internally:

1. Sends the image to the Image Moderation Service.
2. Performs general object detection.
3. Performs weapon detection.
4. Performs NSFW classification.
5. Sends these results to the Moderation Decision Service.
6. Logs the moderation result.
7. Returns the combined result to the client.

### Request

Content-Type:

```text
multipart/form-data
```

### Form Field

```text
file
```

The `file` field must contain the image to be analyzed.

### Example

```text
POST /moderate/image

file = image.jpg
```

### Response

```json
{
  "filename": "image.jpg",
  "objects": [
    {
      "class": "person",
      "confidence": 0.95
    }
  ],
  "weapons": [],
  "nsfw": {
    "detected": false,
    "confidence": 0.87
  },
  "verdict": "SAFE",
  "reasons": []
}
```

### Response Fields

| Field      | Type   | Description                          |
| ---------- | ------ | ------------------------------------ |
| `filename` | string | Name of the uploaded image           |
| `objects`  | array  | Objects detected in the image        |
| `weapons`  | array  | Weapons detected in the image        |
| `nsfw`     | object | NSFW classification result           |
| `verdict`  | string | Final moderation decision            |
| `reasons`  | array  | Reasons associated with the decision |

### Object Format

```json
{
  "class": "person",
  "confidence": 0.95
}
```

### NSFW Format

```json
{
  "detected": false,
  "confidence": 0.87
}
```

---

# 6. Moderation History API

## 6.1 Get All Logs

### `GET /logs`

Retrieves all moderation records stored by the Logging Service.

### Response

```json
{
  "total": 1,
  "logs": [
    {
      "id": 1,
      "content_type": "text",
      "content": "Example text",
      "details": {
        "toxic": false,
        "confidence": 0.1234
      },
      "verdict": "SAFE",
      "reasons": [],
      "confidence": 0.1234,
      "timestamp": "..."
    }
  ]
}
```

### Response Fields

| Field          | Type    | Description                         |
| -------------- | ------- | ----------------------------------- |
| `total`        | integer | Number of stored moderation records |
| `logs`         | array   | List of moderation records          |
| `id`           | integer | Unique log identifier               |
| `content_type` | string  | Type of moderated content           |
| `content`      | string  | Submitted content or filename       |
| `details`      | object  | Detailed moderation results         |
| `verdict`      | string  | Final moderation decision           |
| `reasons`      | array   | Reasons for the decision            |
| `confidence`   | float   | Confidence score                    |
| `timestamp`    | string  | Time when the record was created    |

---

## 6.2 Get Log by ID

### `GET /logs/{log_id}`

Retrieves a specific moderation record.

### Example

```text
GET /logs/1
```

### Response

```json
{
  "id": 1,
  "content_type": "text",
  "content": "Example text",
  "details": {},
  "verdict": "SAFE",
  "reasons": [],
  "confidence": 0.1234,
  "timestamp": "..."
}
```

### Log Not Found

If the requested ID does not exist:

```json
{
  "error": "Log not found"
}
```

---

# 7. Statistics API

## 7.1 Get Moderation Statistics

### `GET /statistics`

Retrieves moderation statistics from the Logging Service.

### Response

The response is generated directly by the database statistics function.

```json
{
  "...": "statistics returned by the database"
}
```

> The exact fields depend on the implementation of `database.get_statistics()`.

---

# 8. Internal Microservice APIs

The following endpoints are used internally by the API Gateway and are not normally called directly by the frontend.

---

## 8.1 Text Moderation Service

### `GET /health`

Returns the health status of the Text Moderation Service.

### Response

```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### `POST /predict`

Performs toxicity classification using the Toxic-BERT model.

### Request

```json
{
  "text": "Example text"
}
```

### Response

```json
{
  "toxic": false,
  "confidence": 0.1234,
  "reason": "Content appears safe"
}
```

The service determines toxic content when the model returns the `toxic` label with a confidence score greater than `0.5`.

---

# 9. Image Moderation Service

## `GET /health`

Returns the health status of the Image Moderation Service.

### Response

```json
{
  "status": "healthy",
  "model_loaded": true
}
```

## `POST /predict`

Analyzes an uploaded image.

### Request

Content-Type:

```text
multipart/form-data
```

Form field:

```text
file
```

### Response

```json
{
  "objects": [
    {
      "class": "person",
      "confidence": 0.95
    }
  ],
  "weapons": [],
  "nsfw": {
    "detected": false,
    "confidence": 0.87
  }
}
```

### Detection Components

The Image Moderation Service performs three types of analysis:

1. General object detection using YOLO.
2. Weapon detection using a custom YOLO model.
3. NSFW image classification using an image classification model.

Weapon detections are included when the confidence is at least `0.4`.

NSFW content is marked as detected when the top classification label is `nsfw` and its confidence is greater than `0.5`.

---

# 10. Moderation Decision Service

The Moderation Decision Service converts model results into a final moderation decision.

## `GET /health`

### Response

```json
{
  "status": "healthy"
}
```

---

## `POST /decide/text`

Receives the text moderation result and generates a final decision.

### Request

```json
{
  "toxic": false,
  "confidence": 0.1234
}
```

### Response

The response is generated by the decision engine.

```json
{
  "verdict": "...",
  "reasons": [],
  "confidence": 0.1234
}
```

> The exact verdict values and reason-generation logic are defined in `decision_engine.py`.

---

## `POST /decide/image`

Receives image analysis results and generates a final moderation decision.

### Request

```json
{
  "objects": [],
  "weapons": [],
  "nsfw": {
    "detected": false,
    "confidence": 0.87
  }
}
```

### Response

```json
{
  "verdict": "...",
  "reasons": [],
  "confidence": 0.87
}
```

> The exact decision logic is defined in `decision_engine.py`.

---

# 11. Logging Service

The Logging Service stores moderation results.

## `GET /health`

### Response

```json
{
  "status": "healthy"
}
```

---

## `POST /logs`

Creates a new moderation log.

### Request

```json
{
  "content_type": "text",
  "content": "Example text",
  "details": {
    "toxic": false,
    "confidence": 0.1234
  },
  "verdict": "SAFE",
  "reasons": [],
  "confidence": 0.1234
}
```

### Response

```json
{
  "id": 1,
  "message": "Log saved"
}
```

---

## `GET /logs`

Returns all stored moderation logs.

This endpoint is also exposed through the API Gateway.

---

## `GET /logs/{log_id}`

Returns a specific moderation log by ID.

---

## `GET /statistics`

Returns moderation statistics stored/calculated by the database layer.

---

# 12. Health Check Summary

| Service                     | Endpoint      |
| --------------------------- | ------------- |
| API Gateway                 | `GET /health` |
| Text Moderation Service     | `GET /health` |
| Image Moderation Service    | `GET /health` |
| Moderation Decision Service | `GET /health` |
| Logging Service             | `GET /health` |

A healthy service returns a JSON response containing:

```json
{
  "status": "healthy"
}
```

---

# 13. API Flow

### Text Moderation

```text
Client
  │
  │ POST /moderate/text
  ▼
API Gateway
  │
  ├──► Text Moderation Service
  │       POST /predict
  │
  ├──► Moderation Decision Service
  │       POST /decide/text
  │
  └──► Logging Service
          POST /logs
  │
  ▼
Final moderation response
```

### Image Moderation

```text
Client
  │
  │ POST /moderate/image
  ▼
API Gateway
  │
  ├──► Image Moderation Service
  │       POST /predict
  │
  ├──► Moderation Decision Service
  │       POST /decide/image
  │
  └──► Logging Service
          POST /logs
  │
  ▼
Final moderation response
```

---

# 14. Error Handling

The services use FastAPI and Pydantic request validation.

Invalid request bodies may result in HTTP `422 Unprocessable Entity`.

For example, a text moderation request must contain:

```json
{
  "text": "..."
}
```

An image moderation request must contain the required `file` upload.

> Additional runtime errors depend on the availability of the individual AI models and internal services.

---

# 15. Technologies

| Component             | Technology                       |
| --------------------- | -------------------------------- |
| API Framework         | FastAPI                          |
| API Communication     | HTTP / REST                      |
| Gateway Communication | HTTPX                            |
| Text Moderation       | Toxic-BERT                       |
| Object Detection      | YOLOv8                           |
| Weapon Detection      | Custom YOLO Model                |
| NSFW Detection        | Transformer Image Classification |
| Request Validation    | Pydantic                         |
| Logging               | Database Service                 |
| Architecture          | Microservices                    |

---

# 16. Main Frontend APIs

The frontend should primarily communicate with the API Gateway using these endpoints:

| Method | Endpoint          | Purpose                        |
| ------ | ----------------- | ------------------------------ |
| `GET`  | `/health`         | Check API Gateway health       |
| `POST` | `/moderate/text`  | Moderate text                  |
| `POST` | `/moderate/image` | Moderate image                 |
| `GET`  | `/logs`           | Retrieve moderation history    |
| `GET`  | `/statistics`     | Retrieve moderation statistics |

These endpoints provide the main interface between the frontend and the Content Guard backend.
