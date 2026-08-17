import config

def decide_text(toxic: bool, confidence: float):
    if toxic and confidence >= config.TEXT_TOXICITY_THRESHOLD:
        return {
            "verdict": "BLOCKED",
            "reasons": ["toxic_content"],
            "confidence": confidence
        }
    return {
        "verdict": "ALLOWED",
        "reasons": [],
        "confidence": confidence
    }

def decide_image(objects: list, weapons: list, nsfw: dict):
    reasons = []
    max_confidence = 0.0

    # Check unsafe general objects
    for obj in objects:
        if obj["class"] in config.UNSAFE_OBJECT_CLASSES and obj["confidence"] >= config.OBJECT_THRESHOLD:
            reasons.append("unsafe_object_detected")
            max_confidence = max(max_confidence, obj["confidence"])

    # Check weapons
    for weapon in weapons:
        if weapon["confidence"] >= config.WEAPON_THRESHOLD:
            reasons.append("weapon_detected")
            max_confidence = max(max_confidence, weapon["confidence"])

    # Check NSFW
    if nsfw["detected"] and nsfw["confidence"] >= config.NSFW_THRESHOLD:
        reasons.append("nsfw_content_detected")
        max_confidence = max(max_confidence, nsfw["confidence"])

    verdict = "BLOCKED" if reasons else "ALLOWED"

    return {
        "verdict": verdict,
        "reasons": list(set(reasons)),  # remove duplicates
        "confidence": round(max_confidence, 4)
    }