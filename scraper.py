import requests
from bs4 import BeautifulSoup
import json

def scrape_leakduck_events():
    base_url = "https://leakduck.com"
    events_url = f"{base_url}/events/"
    
    print("🚀 లీక్‌డక్ నుండి ఈవెంట్స్ స్క్రాపింగ్ స్టార్ట్ అయ్యింది...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(events_url, headers=headers)
        if response.status_code != 200:
            print(f"❌ వెబ్‌సైట్ ఓపెన్ అవ్వడం లేదు. Status code: {response.status_code}")
            return
            
        soup = BeautifulSoup(response.text, 'html.parser')
        event_cards = soup.select('.event-card')
        scraped_events = []
        
        print(f"📦 మొత్తం {len(event_cards)} ఈవెంట్స్ దొరికాయి.")

        for card in event_cards:
            name_el = card.select_one('.event-title')
            name = name_el.text.strip() if name_el else "Unknown Event"
            
            link_el = card.select_one('a')
            event_link = base_url + link_el['href'] if link_el else None
            
            img_el = card.select_one('.event-image img')
            image_url = img_el['src'] if img_el else ""
            if image_url and not image_url.startswith('http'):
                image_url = base_url + image_url
                
            date_el = card.select_one('.event-date')
            date_range = date_el.text.strip() if date_el else ""
            
            timer_el = card.select_one('.event-countdown')
            countdown_text = timer_el.text.strip() if timer_el else "Active"

            border_color = "#FF3B30"
            if "attack" in name.lower(): border_color = "#FF2D55"
            elif "pokemon" in name.lower() or "community" in name.lower(): border_color = "#4CD964"
            elif "remind" in name.lower() or "research" in name.lower(): border_color = "#FF9500"
            elif "raid" in name.lower(): border_color = "#5856D6"

            specialties = []
            if event_link:
                try:
                    inner_resp = requests.get(event_link, headers=headers)
                    if inner_resp.status_code == 200:
                        inner_soup = BeautifulSoup(inner_resp.text, 'html.parser')
                        bonus_blocks = inner_soup.select('.event-bonus, .bonus-block, .event-feature')
                        for block in bonus_blocks:
                            title_el = block.select_one('.bonus-title, h4')
                            desc_el = block.select_one('.bonus-description, p')
                            if title_el:
                                specialties.append({
                                    "title": title_el.text.strip(),
                                    "description": desc_el.text.strip() if desc_el else "Special feature active during event."
                                })
                except Exception as e:
                    print(f"⚠ ఇన్నర్ పేజీ ఎర్రర్: {e}")

            if not specialties:
                specialties.append({
                    "title": "Event Live Details",
                    "description": "Check your Pokémon GO app for active updates."
                })

            scraped_events.append({
                "name": name,
                "image": image_url,
                "dateRange": date_range,
                "countdownText": countdown_text,
                "borderColor": border_color,
                "specialties": specialties[:10]
            })

        with open('events_deep_data.json', 'w', encoding='utf-8') as f:
            json.dump(scraped_events, f, ensure_ascii=False, indent=4)
            
        print("✅ `events_deep_data.json` ఫైల్ క్రియేట్ అయ్యింది!")

    except Exception as e:
        print(f"❌ స్క్రాపింగ్ ఫెయిల్: {e}")

if __name__ == "__main__":
    scrape_leakduck_events()
  
