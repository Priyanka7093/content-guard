from transformers import pipeline

# Load a pretrained toxicity detection model
classifier = pipeline("text-classification", model="unitary/toxic-bert")

# Test it with a sample sentence
result = classifier("You are so stupid, I hate you")
print(result)

result2 = classifier("Have a wonderful day!")
print(result2)