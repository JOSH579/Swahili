import asyncio
from pathlib import Path

import edge_tts

VOICE = "sw-TZ-DaudiNeural"
OUT = Path(__file__).resolve().parents[1] / "frontend" / "public" / "audio" / "greetings"

WORDS = [
    "Hujambo",
    "Sijambo",
    "Asante",
    "Tafadhali",
    "Karibu",
    "Kwaheri",
    "Samahani",
    "Ndiyo",
    "Hapana",
]

async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for word in WORDS:
        dest = OUT / f"{word.lower()}.mp3"
        await edge_tts.Communicate(word, VOICE).save(str(dest))
        print(dest)

if __name__ == "__main__":
    asyncio.run(main())