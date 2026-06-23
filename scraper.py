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
        if response.status_center != 200:
            print(f"Failed to fetch LeakDuck, status: {response.status_code}")
            return
            
        soup = BeautifulSoup(response.text, 'html.parser')
        events = []
        
        # లీక్‌డక్ లోని అన్ని ఈవెంట్ కార్డ్స్ ఐటమ్స్ లూప్ రన్ అవుతుంది
        event_cards = soup.select('.event-card-link')
        print(f"Found {len(event_cards)} events on LeakDuck.")

        for card in event_cards:
            try:
                # 1. ఈవెంట్ పేరు
                name_el = card.select_one('.event-title')
                name = name_el.text.strip() if name_el else "Unknown Event"
                
                # 2. ఈవెంట్ టైప్/స్పెషలైజేషన్
                type_el = card.select_one('.event-type')
                ev_type = type_el.text.strip() if type_el else "Event"
                
                # టైప్ బట్టి బ్యాడ్జ్ కలర్ సెట్ చేయడం
                type_lower = ev_type.lower()
                color = "#3a3a3c" # default gray
                for key, val in text_colors.items():
                    if key in type_lower:
                        color = val
                        break
                
                # 3. ఈవెంట్ ఒరిజినల్ లింక్ (క్లిక్ చేస్తే ఓపెన్ అవ్వడానికి)
                link = card.get('href', '')
                if link and not link.startswith('http'):
                    link = "https://leakduck.com" + link
                
                # 4. ఈవెంట్ ఇమేజ్ URL
                img_el = card.select_one('.event-image img')
                img_url = ""
                if img_el:
                    img_url = img_el.get('src') or img_el.get('data-src') or ""
                if img_url and not img_url.startswith('http'):
                    img_url = "https://leakduck.com" + img_url
                
                # 5. టైమ్ లేబుల్ మరియు సెక్షన్ వివరాలు
                time_el = card.select_one('.event-countdown')
                time_label = time_el.text.strip() if time_el else "Live Now"
                
                # సెక్షన్ హెడర్ కనుక్కోవడం (Ends Today, Upcoming, etc.)
                parent_section = card.find_parent('div', class_='event-section')
                section_name = "LIVE EVENTS"
                if parent_section:
                    sec_header = parent_section.select_one('.section-title')
                    if sec_header:
                        section_name = sec_header.text.strip().upper()
                
                # 6. ఆటోమేటిక్ ఎండ్ డేట్ జనరేషన్ (కౌంట్‌డౌన్ రన్ అవ్వడానికి)
                # లీక్‌డక్ నుండి కరెక్ట్ డేట్స్ రానప్పుడు డీఫాల్ట్ ఎండ్ టైమ్ సెట్ చేయడం
                now = datetime.utcnow() + timedelta(hours=5, minutes=30) # IST
                if "today" in section_name.lower():
                    end_time = (now.replace(hour=22, minute=0, second=0)).isoformat()
                elif "tomorrow" in section_name.lower():
                    end_time = (now + timedelta(days=1)).replace(hour=22, minute=0, second=0).isoformat()
                else:
                    end_time = (now + timedelta(days=4)).isoformat() # default 4 days for long week events

                events.append({
                    "name": name,
                    "type": ev_type,
                    "typeColor": color,
                    "imageUrl": img_url,
                    "endTime": end_time,
                    "timeLabel": time_label,
                    "section": section_name,
                    "link": link
                })
            except Exception as card_err:
                print(f"Error parsing card: {card_err}")
                continue
                
        # రూట్ ఫోల్డర్ లోకి JSON డేటాను రాయడం
        with open('events_deep_data.json', 'w', encoding='utf-8') as f:
            json.dump(events, f, ensure_ascii=False, indent=4)
        print("Successfully updated events_deep_data.json with ALL live events!")
        
    except Exception as e:
        print(f"Scraper encountered error: {e}")

if __name__ == "__main__":
    scrape_leakduck()
    
