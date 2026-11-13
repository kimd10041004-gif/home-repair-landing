"""Reproducible web exports. No upscaling or speed changes."""
from pathlib import Path
import subprocess, json
ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(__file__).parent / "originals/brand-film-2k.mp4"
OUT = ROOT / "public/dada/film"
OUT.mkdir(parents=True, exist_ok=True)
def run(args):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *map(str,args)], check=True)
for name, vf, crf in [("desktop", "setsar=1", "20"), ("mobile", "crop=614:768:(iw-614)/2:0,scale=576:720,setsar=1", "21")]:
    run(["-i", SOURCE, "-map", "0:v:0", "-vf", vf, "-an", "-c:v", "libx264", "-preset", "slow", "-crf", crf, "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT / f"dada-brand-{name}.mp4"])
    run(["-ss", "0.25", "-i", SOURCE, "-vf", vf, "-frames:v", "1", "-q:v", "2", OUT / f"dada-brand-{name}.jpg"])
for name, timestamp in [("boundary", "6"), ("space", "12")]:
    run(["-ss", timestamp, "-i", SOURCE, "-frames:v", "1", "-q:v", "2", OUT / f"dada-{name}.jpg"])
for path in OUT.glob("*.mp4"):
    subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "null", "-"], check=True)
    print(path.name, path.stat().st_size)
