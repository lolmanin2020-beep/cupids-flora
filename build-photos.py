#!/usr/bin/env python3
"""Rebuilds the photo list and small thumbnails for the Memories page.
Run after adding or removing photos in photos/<category>/:  python3 build-photos.py
"""
import json
import os
import subprocess

PHOTOS_DIR = "photos"
THUMBS_DIR = "thumbs"
OUTPUT_FILE = "photos-manifest.json"
THUMB_WIDTH = 480
VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


def titleize(slug):
    return slug.replace("-", " ").replace("_", " ").title()


def make_thumb(src, dest):
    if os.path.exists(dest) and os.path.getmtime(dest) >= os.path.getmtime(src):
        return
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    subprocess.run(
        ["sips", "--resampleWidth", str(THUMB_WIDTH), "-s", "formatOptions", "70", src, "--out", dest],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )


def build_manifest():
    manifest = []
    for category in sorted(os.listdir(PHOTOS_DIR)):
        category_path = os.path.join(PHOTOS_DIR, category)
        if not os.path.isdir(category_path) or category.startswith("."):
            continue

        photos = sorted(
            f for f in os.listdir(category_path)
            if os.path.splitext(f)[1].lower() in VALID_EXTENSIONS
        )
        if not photos:
            continue

        for f in photos:
            make_thumb(os.path.join(category_path, f), os.path.join(THUMBS_DIR, category, f))

        manifest.append({
            "category": category,
            "label": titleize(category),
            "photos": [f"{PHOTOS_DIR}/{category}/{f}" for f in photos]
        })

    return manifest


if __name__ == "__main__":
    manifest = build_manifest()
    with open(OUTPUT_FILE, "w") as f:
        json.dump(manifest, f, indent=2)

    total = sum(len(c["photos"]) for c in manifest)
    print(f"Wrote {OUTPUT_FILE}: {len(manifest)} categories, {total} photos.")
