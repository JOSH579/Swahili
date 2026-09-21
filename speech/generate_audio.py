import asyncio
import re
from pathlib import Path

import edge_tts

VOICE = "sw-TZ-DaudiNeural"
AUDIO = Path(__file__).resolve().parents[1] / "frontend" / "public" / "audio"

LESSONS = {
    "greetings": [
        "Hujambo",
        "Sijambo",
        "Asante",
        "Tafadhali",
        "Karibu",
        "Kwaheri",
        "Samahani",
        "Ndiyo",
        "Hapana",
    ],
    "introductions": [
        "Jina langu ni",
        "Unaitwa nani",
        "Naitwa",
        "Unatoka wapi",
        "Natoka",
        "Unasema Kiingereza",
        "Kidogo",
        "Sielewi",
        "Naelewa",
    ],
}

def clip_file(word: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", word.lower()).strip("-")

async def main() -> None:
    for slug, words in LESSONS.items():
        out = AUDIO / slug
        out.mkdir(parents=True, exist_ok=True)
        for word in words:
            dest = out / f"{clip_file(word)}.mp3"
            await edge_tts.Communicate(word, VOICE).save(str(dest))
            print(dest)

if __name__ == "__main__":
    asyncio.run(main())