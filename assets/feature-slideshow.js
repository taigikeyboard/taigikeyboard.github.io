(() => {
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

	document.querySelectorAll("[data-slideshow]").forEach((slideshow) => {
		const slides = Array.from(slideshow.querySelectorAll("[data-slide]"));
		const indicators = Array.from(slideshow.querySelectorAll("[data-slide-indicator]"));
		const interval = Number(slideshow.dataset.interval) || 2000;
		let currentIndex = 0;
		let timer;
		let interactionPaused = false;

		if (slides.length < 2) return;

		const showSlide = (index) => {
			currentIndex = index;
			slides.forEach((slide, slideIndex) => {
				const active = slideIndex === currentIndex;
				slide.hidden = !active;
				slide.classList.toggle("is-active", active);
				indicators[slideIndex]?.classList.toggle("is-active", active);
			});
		};

		const stop = () => {
			window.clearInterval(timer);
			timer = undefined;
		};

		const start = () => {
			stop();
			if (reducedMotion.matches || document.hidden || interactionPaused) return;

			timer = window.setInterval(() => {
				showSlide((currentIndex + 1) % slides.length);
			}, interval);
		};

		const syncMotionPreference = () => {
			if (reducedMotion.matches) showSlide(0);
			start();
		};

		slideshow.addEventListener("pointerenter", () => {
			interactionPaused = true;
			stop();
		});

		slideshow.addEventListener("pointerleave", () => {
			interactionPaused = false;
			start();
		});

		slideshow.addEventListener("focusin", () => {
			interactionPaused = true;
			stop();
		});

		slideshow.addEventListener("focusout", (event) => {
			if (slideshow.contains(event.relatedTarget)) return;
			interactionPaused = false;
			start();
		});

		document.addEventListener("visibilitychange", start);
		reducedMotion.addEventListener("change", syncMotionPreference);
		start();
	});
})();
