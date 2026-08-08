.PHONY: serve start build clean install webp webp-all check-webp-tools

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

check-webp-tools:
	@command -v cwebp >/dev/null || { echo "cwebp is required (macOS: brew install webp; Ubuntu: apt-get install webp)"; exit 1; }
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

webp-all: check-webp-tools
	@find assets -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while read f; do \
		output="$${f%.*}.webp"; \
		if [ ! -f "$$output" ] || [ "$$f" -nt "$$output" ]; then \
			echo "Generating $$output"; \
			cwebp -q 85 -quiet "$$f" -o "$$output" || exit 1; \
		fi; \
	done
	@find assets -name "*.gif" -type f | while read f; do \
		output="$${f%.gif}.webp"; \
		if [ ! -f "$$output" ] || [ "$$f" -nt "$$output" ]; then \
			echo "Generating $$output"; \
			gif2webp -q 85 -m 6 "$$f" -o "$$output" >/dev/null || exit 1; \
		fi; \
	done
