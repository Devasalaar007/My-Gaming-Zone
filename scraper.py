import requests
import json
from datetime import datetime

def scrape_leakduck():
    # లీక్‌డక్ అఫీషియల్ పబ్లిక్ ఈవెంట్స్ API ఎండ్‌పాయింట్
    url = "https://leakduck.com/api/v1/events/"
    
    try:
        response = requests.get(url, timeout=15)
        if response.status_code != 200:
            print(f"API Fetch Failed: {response.status_code}")
            return
            
        api_data = response.json()
        events = []
        
        # లీక్‌డక్ కలర్ కోడింగ్ మ్యాపింగ్
        type_colors = {
            "max mondays": "#7A1F46",
            "raid battles": "#C83E23",
            "raid days": "#C83E23",
            "raid hours": "#C83E23",
            "go battle league": "#8A3AB9",
            "community day": "#E65C00",
            "spotlight hour": "#008080",
            "research breakthrough": "#4A69BD"
        }

        for item in api_data:
            name = item.get('name', 'Unknown Event')
            ev_type = item.get('type', 'Event')
            
            # కలర్ సెట్ చేయడం
            type_lower = ev_type.lower()
            color = "#3a3a3c"
            for key, val in type_colors.items():
                if key in type_lower:
                    color = val
                    break
            
            # హై-క్వాలిటీ ఒరిజినల్ ఇమేజ్ URL
            img_url = item.get('image', 'https://images.gameinfo.io/item/128/pokeball.png')
            
            # టైమ్ మరియు సెక్షన్ వివరాలు
            time_label = item.get('heading', 'Live Now')
            end_time = item.get('end', '')
            
            # సెక్షన్ కేటగిరీ (LIVE, UPCOMING, etc.)
            section_name = "UPCOMING EVENTS"
            if item.get('isLive', False):
                section_name = "LIVE EVENTS"

            events.append({
                "name": name,
                "type": ev_type,
                "typeColor": color,
                "imageUrl": img_url,
                "endTime": end_time,
                "timeLabel": time_label,
                "section": section_name
            })

        if events:
            with open('events_deep_data.json', 'w', encoding='utf-8') as f:
                json.dump(events, f, ensure_ascii=False, indent=4)
            print(f"Success! Fetched {len(events)} events from LeakDuck API.")
        else:
            print("No events found in API response.")

    except Exception as e:
        print(f"Error occurred while fetching API: {e}")

if __name__ == "__main__":
    scrape_leakduck()
                
