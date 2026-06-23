import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime, timedelta

text_colors = {
    "max mondays": "#7A1F46",
    "raid battles": "#C83E23",
    "raid days": "#C83E23",
    "raid hours": "#C83E23",
    "go battle league": "#8A3AB9",
    "community day": "#E65C00",
    "spotlight hour": "#008080",
    "research breakthrough": "#4A69BD"
}

def scrape_leakduck():
    url = "https://leakduck.com/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"Failed to fetch LeakDuck, status: {response.status_code}")
            return
            
        soup = BeautifulSoup(response.text, 'html.parser')
        events = []
        
        # లీక్‌డక్ లోని మెయిన్ ఈవెంట్ కార్డ్స్ సెలెక్టర్
        event_cards = soup.select('a.event-card-link')
        print(f"Found {len(event_cards)} events total.")

        for card in event_cards:
            try:
                name_el = card.select_one('.event-title, h1, h2, h3, h2.event-title')
                name = name_el.text.strip() if name_el else ""
                if not name:
                    continue
                
                type_el = card.select_one('.event-type')
                ev_type = type_el.text.strip() if type_el else "Event"
                
                type_lower = ev_type.lower()
                color = "#3a3a3c"
                for key, val in text_colors.items():
                    if key in type_lower:
                        color = val
                        break
                
                # ఇమేజ్ దొరకకపోతే పోకేబాల్ ఇమేజ్ వచ్చేలా బ్యాకప్ లింక్
                img_url = "https://images.gameinfo.io/item/128/pokeball.png"
                img_el = card.select_one('img')
                if img_el:
                    possible_src = img_el.get('src') or img_el.get('data-src') or ""
                    if possible_src and not possible_src.endswith('blank.gif'):
                        img_url = possible_src
                
                if img_url.startswith('/'):
                    img_url = "https://leakduck.com" + img_url
                
                time_el = card.select_one('.event-countdown, .event-time')
                time_label = time_el.text.strip() if time_el else "Live Now"
                
                # కరెక్ట్ సెక్షన్ కనుక్కోవడం
                parent_section = card.find_parent('div', class_='event-section')
                section_name = "LIVE EVENTS"
                if parent_section:
                    sec_header = parent_section.select_one('.section-title, h2')
                    if sec_header:
                        section_name = sec_header.text.strip().upper()
                
                now = datetime.utcnow() + timedelta(hours=5, minutes=30) # IST
                if "today" in section_name.lower():
                    end_time = (now.replace(hour=22, minute=0, second=0)).isoformat()
                elif "tomorrow" in section_name.lower():
                    end_time = (now + timedelta(days=1)).replace(hour=22, minute=0, second=0).isoformat()
                else:
                    end_time = (now + timedelta(days=3)).isoformat()

                events.append({
                    "name": name,
                    "type": ev_type,
                    "typeColor": color,
                    "imageUrl": img_url,
                    "endTime": end_time,
                    "timeLabel": time_label,
                    "section": section_name
                })
            except Exception as card_err:
                continue
                
        # ఒకవేళ లిస్ట్ ఖాళీగా ఉంటే పాత డేటా పోకుండా ఉండటానికి చెక్
        if len(events) > 0:
            with open('events_deep_data.json', 'w', encoding='utf-8') as f:
                json.dump(events, f, ensure_ascii=False, indent=4)
            print(f"Successfully saved {len(events)} events!")
        else:
            print("No events scraped. Keeping fallback.")
        
    except Exception as e:
        print(f"Scraper encountered error: {e}")

if __name__ == "__main__":
    scrape_leakduck()
                
