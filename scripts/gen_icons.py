#!/usr/bin/env python3
"""Generate PWA icons (teal rounded square + three white bars) as PNGs.

Pure stdlib so the repo needs no image tooling. Run: python3 scripts/gen_icons.py
"""
import struct
import zlib
from pathlib import Path

TEAL = (15, 118, 110, 255)  # --accent light (#0f766e)
WHITE = (255, 255, 255, 255)
CLEAR = (0, 0, 0, 0)


def rounded_rect_mask(size: int, radius: int, inset: int = 0):
    lo, hi = inset, size - 1 - inset
    r = radius

    def inside(x: int, y: int) -> bool:
        if x < lo or x > hi or y < lo or y > hi:
            return False
        cx = lo + r if x < lo + r else (hi - r if x > hi - r else None)
        cy = lo + r if y < lo + r else (hi - r if y > hi - r else None)
        if cx is None or cy is None:
            return True
        return (x - cx) ** 2 + (y - cy) ** 2 <= r * r

    return inside


def bar_rects(size: int):
    # Three vertical bars, mirroring the in-app logo proportions.
    w = round(size * 0.075)
    gap = round(size * 0.075)
    heights = [0.25, 0.44, 0.31]
    total_w = 3 * w + 2 * gap
    x0 = (size - total_w) // 2
    rects = []
    for i, hfrac in enumerate(heights):
        h = round(size * hfrac)
        x = x0 + i * (w + gap)
        y = (size - h) // 2 + (round(size * 0.02) if i != 1 else 0)
        rects.append((x, y, w, h, round(w / 2)))
    return rects


def in_bar(x: int, y: int, rects) -> bool:
    for (bx, by, bw, bh, br) in rects:
        if bx <= x < bx + bw and by <= y < by + bh:
            cy = by + br if y < by + br else (by + bh - 1 - br if y > by + bh - 1 - br else None)
            if cy is None:
                return True
            cx = bx + bw / 2 - 0.5
            if (x - cx) ** 2 + (y - cy) ** 2 <= br * br + 1:
                return True
    return False


def make_png(size: int, maskable: bool) -> bytes:
    # Maskable icons need the mark inside the 80% safe zone on a full-bleed bg.
    if maskable:
        bg = lambda x, y: True  # noqa: E731
    else:
        bg = rounded_rect_mask(size, round(size * 0.22))
    bars = bar_rects(size)

    rows = []
    for y in range(size):
        row = bytearray([0])  # filter: none
        for x in range(size):
            if bg(x, y):
                px = WHITE if in_bar(x, y, bars) else TEAL
            else:
                px = CLEAR
            row.extend(px)
        rows.append(bytes(row))
    raw = b"".join(rows)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data))

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def main() -> None:
    out = Path(__file__).resolve().parent.parent / "public"
    out.mkdir(exist_ok=True)
    for name, size, maskable in [
        ("pwa-192.png", 192, False),
        ("pwa-512.png", 512, False),
        ("pwa-maskable-512.png", 512, True),
        ("apple-touch-icon.png", 180, True),
    ]:
        (out / name).write_bytes(make_png(size, maskable))
        print(f"wrote public/{name}")


if __name__ == "__main__":
    main()
