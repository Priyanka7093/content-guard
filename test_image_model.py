from ultralytics import YOLO

# Load a pretrained YOLO model (downloads automatically the first time)
model = YOLO("yolov8n.pt")

# Run detection on a sample image (auto-downloads a test photo of a street with a bus and people)
results = model("https://ultralytics.com/images/bus.jpg")

# Print what it found
for result in results:
    for box in result.boxes:
        class_name = model.names[int(box.cls[0])]
        confidence = float(box.conf[0])
        print(f"Detected: {class_name} (confidence: {confidence:.2f})")