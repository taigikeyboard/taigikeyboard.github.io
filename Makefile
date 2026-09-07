.PHONY: serve start build clean install webp webp-all webp-svg check-cwebp check-webp-tools

serve: start

start: webp-all
	bundle exec jekyll serve --livereload

build: webp-all
	bundle exec jekyll build

clean:
	bundle exec jekyll clean
	rm -rf .sass-cache

install:
	bundle install

check-cwebp:
	@command -v cwebp >/dev/null || { echo "cwebp is required (macOS: brew install webp; Ubuntu: apt-get install webp)"; exit 1; }

check-webp-tools: check-cwebp
	@command -v gif2webp >/dev/null || { echo "gif2webp is required (macOS: brew install webp; Ubuntu: apt-get install webp)"; exit 1; }

webp: check-webp-tools
	@if [ -n "$(FILE)" ] && [ -f "$(FILE)" ]; then \
		output="$${FILE%.*}.webp"; \
		case "$(FILE)" in \
			*.gif) gif2webp -q 85 -m 6 "$(FILE)" -o "$$output" >/dev/null ;; \
			*.png|*.jpg|*.jpeg) cwebp -q 85 -quiet "$(FILE)" -o "$$output" ;; \
			*) echo "Unsupported format. Use .png, .jpg, .jpeg, or .gif"; exit 1 ;; \
		esac; \
	else \
		echo "Usage: make webp FILE=assets/image.png"; exit 1; \
	fi

# Images that must stay in their original format: a CSS background, the og:image
# targets social scrapers may not decode as WebP, and the favicons. Add a new
# og:image or favicon here so no unused .webp is generated beside it.
WEBP_SKIP = assets/black.png \
	assets/feature-1.png assets/feature-2.png assets/feature-3.png assets/feature-4.png \
	assets/icon/16.png assets/icon/32.png assets/icon/48.png

webp-all: check-webp-tools
	@find assets -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while IFS= read -r f; do \
		case " $(WEBP_SKIP) " in *" $$f "*) continue ;; esac; \
		output="$${f%.*}.webp"; \
		if [ ! -f "$$output" ] || [ "$$f" -nt "$$output" ]; then \
			echo "Generating $$output"; \
			cwebp -q 85 -quiet "$$f" -o "$$output" || exit 1; \
		fi; \
	done
	@find assets -name "*.gif" -type f | while IFS= read -r f; do \
		case " $(WEBP_SKIP) " in *" $$f "*) continue ;; esac; \
		output="$${f%.gif}.webp"; \
		if [ ! -f "$$output" ] || [ "$$f" -nt "$$output" ]; then \
			echo "Generating $$output"; \
			gif2webp -q 85 -m 6 "$$f" -o "$$output" >/dev/null || exit 1; \
		fi; \
	done
	@find assets -name "*.webp" -type f | while IFS= read -r f; do \
		stem="$${f%.webp}"; \
		source=""; \
		for ext in png jpg jpeg gif; do \
			candidate="$$stem.$$ext"; \
			[ -f "$$candidate" ] || continue; \
			case " $(WEBP_SKIP) " in *" $$candidate "*) continue ;; esac; \
			source="$$candidate"; \
			break; \
		done; \
		if [ -z "$$source" ]; then \
			echo "Removing stale $$f"; \
			rm -f "$$f" || exit 1; \
		fi; \
	done

# Excalidraw embeds pasted screenshots as full-resolution base64 PNG. Re-run this
# after re-exporting an SVG from Excalidraw; it rewrites the file in place.
webp-svg: check-cwebp
	@command -v python3 >/dev/null || { echo "python3 3.9+ is required"; exit 1; }
	@find assets -name '*.svg' -type f -exec python3 tools/shrink-svg-images.py {} +
