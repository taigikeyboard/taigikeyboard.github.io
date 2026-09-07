#!/usr/bin/env python3
# Re-encodes the base64 PNGs that Excalidraw embeds in an exported SVG as WebP.

import base64
import re
import subprocess
import sys
import tempfile
from pathlib import Path

WEBP_QUALITY = "90"
PNG_DATA_URI = re.compile(r"data:image/png;base64,([A-Za-z0-9+/=]+)")


def encode_as_webp(png_bytes: bytes) -> bytes:
    """Runs cwebp on the payload. -sharp_yuv keeps screenshot text edges clean."""
    with tempfile.TemporaryDirectory() as workdir:
        source = Path(workdir) / "in.png"
        target = Path(workdir) / "out.webp"
        source.write_bytes(png_bytes)
        subprocess.run(
            [
                "cwebp",
                "-q",
                WEBP_QUALITY,
                "-sharp_yuv",
                "-quiet",
                str(source),
                "-o",
                str(target),
            ],
            check=True,
        )
        return target.read_bytes()


def shrink(svg_path: Path) -> None:
    original = svg_path.read_text(encoding="utf-8")
    kept_larger = 0

    def replace(match: re.Match) -> str:
        nonlocal kept_larger
        png_bytes = base64.b64decode(match.group(1))
        webp_bytes = encode_as_webp(png_bytes)
        if len(webp_bytes) >= len(png_bytes):
            kept_larger += 1
            return match.group(0)
        payload = base64.b64encode(webp_bytes).decode("ascii")
        return f"data:image/webp;base64,{payload}"

    rewritten = PNG_DATA_URI.sub(replace, original)
    if rewritten == original:
        # Stays quiet so a whole-directory run only reports the files it shrank.
        if kept_larger:
            print(f"{svg_path}: kept {kept_larger} payload(s), PNG was already smaller")
        return

    # Only touch the tracked file once every payload converted successfully.
    svg_path.write_text(rewritten, encoding="utf-8")
    before = len(original.encode("utf-8"))
    after = len(rewritten.encode("utf-8"))
    print(
        f"{svg_path}: {before // 1024} KB -> {after // 1024} KB "
        f"(-{100 - after * 100 // before}%)"
    )


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("usage: shrink-svg-images.py <file.svg>...", file=sys.stderr)
        return 2
    for name in argv[1:]:
        shrink(Path(name))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
