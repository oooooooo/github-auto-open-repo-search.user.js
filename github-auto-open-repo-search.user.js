// ==UserScript==
// @name         GitHub Auto Open Repo Search
// @namespace    https://github.com/oooooooo/github-auto-open-repo-search.user.js
// @version      1.0.0
// @description  Opens the "Top repositories" search on the GitHub dashboard automatically
// @author       oooooooo
// @license      MIT
// @match        https://github.com/
// @grant        none
// @run-at       document-idle
// @downloadURL  https://raw.githubusercontent.com/oooooooo/github-auto-open-repo-search.user.js/main/github-auto-open-repo-search.user.js
// @updateURL    https://raw.githubusercontent.com/oooooooo/github-auto-open-repo-search.user.js/main/github-auto-open-repo-search.user.js
// ==/UserScript==

(() => {
	const SECTION_TITLE = "Top repositories";
	const SEARCH_LABEL = /search|find/i;
	// The header row is a few levels above the title at most. The limit keeps a
	// section without the button from matching buttons elsewhere on the page.
	const MAX_ANCESTOR_DEPTH = 5;

	const isDashboard = (pathname) => pathname === "/";

	const findSectionTitle = (doc) => {
		const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			if (node.textContent.trim() === SECTION_TITLE) {
				return node.parentElement;
			}
		}
		return null;
	};

	const isSearchButton = (element) => {
		const label = [
			element.getAttribute("aria-label"),
			element.getAttribute("title"),
			element.textContent,
		].join(" ");
		return (
			SEARCH_LABEL.test(label) ||
			element.querySelector(".octicon-search") !== null
		);
	};

	// The search button sits in the same header row as the title, so the first
	// ancestor holding any button is that row. Climbing past it would reach the
	// global header and pick its search box instead.
	const findSearchButton = (doc) => {
		const title = findSectionTitle(doc);
		let ancestor = title;
		for (let depth = 0; ancestor && depth < MAX_ANCESTOR_DEPTH; depth++) {
			const buttons = Array.from(
				ancestor.querySelectorAll('button, [role="button"]'),
			).filter((button) => !button.contains(title));
			if (buttons.length > 0) {
				return buttons.find(isSearchButton) ?? null;
			}
			ancestor = ancestor.parentElement;
		}
		return null;
	};

	// GitHub navigates without reloading, so remember the visit by its path.
	// Clicking once per visit lets the user close the search without it reopening.
	const createAutoClicker = (doc, location) => {
		let clickedPath = null;

		const check = () => {
			const { pathname } = location;
			if (clickedPath !== null && clickedPath !== pathname) {
				clickedPath = null;
			}
			if (clickedPath !== null || !isDashboard(pathname)) {
				return;
			}
			const button = findSearchButton(doc);
			if (button) {
				button.click();
				clickedPath = pathname;
			}
		};

		return { check };
	};

	const start = () => {
		const clicker = createAutoClicker(document, window.location);
		let scheduled = false;
		const schedule = () => {
			if (scheduled) {
				return;
			}
			scheduled = true;
			requestAnimationFrame(() => {
				scheduled = false;
				clicker.check();
			});
		};
		new MutationObserver(schedule).observe(document.body, {
			childList: true,
			subtree: true,
		});
		schedule();
	};

	if (typeof module === "object" && module.exports) {
		module.exports = { isDashboard, findSearchButton, createAutoClicker };
	} else {
		start();
	}
})();
