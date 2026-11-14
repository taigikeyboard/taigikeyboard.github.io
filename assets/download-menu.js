// The Linux download button is a <details> menu, which already opens and
// closes without script. This only adds what a menu is expected to do: close
// on a click elsewhere, and on Escape (returning focus to the button).
document.querySelectorAll(".download-menu").forEach((menu) => {
	const summary = menu.querySelector("summary");

	document.addEventListener("click", (event) => {
		if (menu.open && !menu.contains(event.target)) menu.open = false;
	});

	menu.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && menu.open) {
			menu.open = false;
			summary.focus();
		}
	});
});
