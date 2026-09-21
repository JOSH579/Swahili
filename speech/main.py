from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import FastAPI, File, UploadFile
from faster_whisper import WhisperModel

app = FastAPI()
model = WhisperModel("base", device="cpu", compute_type="int8")

@app.get("/health")
def health() -> dict:
    return {"ok": True}

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)) -> dict:
    suffix = Path(file.filename or "clip.webm").suffix or ".webm"
    with NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    segments, _info = model.transcribe(tmp_path, language="sw")
    text = " ".join(segment.text for segment in segments).strip()
    Path(tmp_path).unlink(missing_ok=True)
    return {"text": text}