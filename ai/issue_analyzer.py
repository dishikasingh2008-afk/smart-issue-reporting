
def analyze_issue(description, location, people_affected):

    description = description.lower()

    # ---------------- CATEGORY ----------------

    if ("wire" in description or
        "socket" in description or
        "electric" in description or
        "light" in description or
        "fan" in description):

        category = "Electrical"

    elif ("leak" in description or
          "tap" in description or
          "water" in description or
          "pipe" in description):

        category = "Plumbing"

    elif ("chair" in description or
          "table" in description or
          "desk" in description or
          "bench" in description):

        category = "Furniture"

    elif ("garbage" in description or
          "dustbin" in description or
          "dirty" in description or
          "clean" in description):

        category = "Cleanliness"

    elif ("wifi" in description or
          "internet" in description or
          "network" in description):

        category = "Internet"

    else:
        category = "Other"


    # ---------------- PRIORITY ----------------

    if ("fire" in description or
        "spark" in description or
        "exposed wire" in description or
        "electric shock" in description):

        priority = "Critical"
        reason = "Possible safety hazard that may require immediate attention."

    elif ("leak" in description or
          "broken pipe" in description or
          "no water" in description):

        priority = "High"
        reason = "This issue may affect campus facilities or students."

    elif ("broken" in description or
          "not working" in description or
          "damaged" in description):

        priority = "Medium"
        reason = "The reported equipment or facility requires maintenance."

    else:

        priority = "Low"
        reason = "The issue does not appear to require immediate attention."


    return {
        "category": category,
        "priority": priority,
        "priority_reason": reason
    }


# ---------------- DUPLICATE DETECTION ----------------

def check_duplicate(new_description, new_location,
                    old_description, old_location):

    new_description = new_description.lower()
    old_description = old_description.lower()

    new_location = new_location.lower()
    old_location = old_location.lower()

    # Check whether both issues are in the same location
    same_location = new_location == old_location

    # Find words shared by both complaints
    new_words = set(new_description.split())
    old_words = set(old_description.split())

    common_words = new_words.intersection(old_words)

    # Same location + at least 2 common words
    if same_location and len(common_words) >= 2:
        return True

    else:
        return False


# ---------------- COMPLETE TEST ----------------

new_issue = "The fan in Room 204 is not working."
new_location = "Block B - Room 204"

old_issue = "Fan in Room 204 has stopped working."
old_location = "Block B - Room 204"


# Analyze the new issue
result = analyze_issue(
    new_issue,
    new_location,
    "10"
)

print("Issue analysis:")
print(result)


# Check for duplicate
duplicate = check_duplicate(
    new_issue,
    new_location,
    old_issue,
    old_location
)

print("Possible duplicate:", duplicate)

