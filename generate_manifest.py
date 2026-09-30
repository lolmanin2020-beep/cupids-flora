#!/usr/bin/env python3
"""Scans photos/<category>/* and writes photos-manifest.json for the gallery.
Run this after adding or removing photos: python3 generate_manifest.py
"""
import json
import os

PHOTOS_DIR = "photos"
OUTPUT_FILE = "photos-manifest.json"
VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


def titleize(slug):
    return slug.replace("-", " ").replace("_", " ").title()


def build_manifest():
    manifest = []
    if not os.path.isdir(PHOTOS_DIR):
        return manifest

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

        manifest.append({
            "category": category,
            "label": titleize(category),
            "photos": [f"photos/{category}/{f}" for f in photos]
        })

    return manifest


if __name__ == "__main__":
    manifest = build_manifest()
    with open(OUTPUT_FILE, "w") as f:
        json.dump(manifest, f, indent=2)

    total = sum(len(c["photos"]) for c in manifest)
    print(f"Wrote {OUTPUT_FILE}: {len(manifest)} categories, {total} photos.")
