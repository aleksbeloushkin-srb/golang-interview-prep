"""Kokoro TTS for scripts/gen-audio.mjs: reads a JSON list of jobs and writes mono MP3 files.

Model files (kokoro-v1.0.onnx, voices-v1.0.bin) come from
https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 and live in --model-dir.
Needs: pip install kokoro-onnx soundfile; ffmpeg with libmp3lame.
"""
import argparse
import json
import os
import subprocess
import tempfile

import soundfile as sf
from kokoro_onnx import Kokoro


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-dir", required=True)
    parser.add_argument("--jobs", required=True)
    args = parser.parse_args()
    kokoro = Kokoro(os.path.join(args.model_dir, "kokoro-v1.0.onnx"), os.path.join(args.model_dir, "voices-v1.0.bin"))
    with open(args.jobs, encoding="utf-8") as f:
        jobs = json.load(f)
    for i, job in enumerate(jobs, 1):
        samples, rate = kokoro.create(job["text"], voice=job["voice"], speed=job["speed"], lang=job["lang"])
        with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
            sf.write(wav.name, samples, rate)
            subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", wav.name,
                            "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "48k", job["out"]], check=True)
        print(f"[{i}/{len(jobs)}] {os.path.basename(job['out'])} {len(samples) / rate:.1f}s", flush=True)


if __name__ == "__main__":
    main()
