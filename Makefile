.PHONY: serve start build clean install webp webp-all

serve: start

start:
	bundle exec jekyll serve --livereload

build:
	bundle exec jekyll build

clean:
	bundle exec jekyll clean
	rm -rf .sass-cache

install:
	bundle install

webp:
	@if [ -n "$(FILE)" ] && [ -f "$(FILE)" ]; then \
		output="$${FILE%.*}.webp"; \
		case "$(FILE)" in \
			*.gif) gif2webp -q 85 -m 6 "$(FILE)" -o "$$output" 2>/dev/null || true ;; \
			*.png) cwebp -q 85 -quiet "$(FILE)" -o "$$output" 2>/dev/null || true ;; \
			*) echo "Unsupported format. Use .png or .gif" ;; \
		esac; \
	fi

webp-all:
	@find assets -name "*.png" -type f | while read f; do \
		output="$${f%.png}.webp"; \
		if [ ! -f "$$output" ] || [ "$$f" -nt "$$output" ]; then \
			cwebp -q 85 -quiet "$$f" -o "$$output" 2>/dev/null || true; \
		fi; \
	done
	@find assets -name "*.gif" -type f | while read f; do \
		output="$${f%.gif}.webp"; \
		if [ ! -f "$$output" ] || [ "$$f" -nt "$$output" ]; then \
			gif2webp -q 85 -m 6 "$$f" -o "$$output" 2>/dev/null || true; \
		fi; \
	done
