// @vitest-environment jsdom
import { createRequire } from "node:module";
import { beforeEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const {
	findSearchButton,
	isDashboard,
	createAutoClicker,
} = require("../github-auto-open-repo-search.user.js");

const sidebar = (button) => `
  <div class="layout">
    <div class="sidebar">
      <aside>
        <div class="header">
          <h2><span>Top repositories</span></h2>
          ${button}
        </div>
        <ul><li><a href="/octocat/hello">octocat/hello</a></li></ul>
      </aside>
    </div>
  </div>
`;

describe("isDashboard", () => {
	it("accepts the dashboard path", () => {
		expect(isDashboard("/")).toBe(true);
	});

	it("rejects other paths", () => {
		expect(isDashboard("/octocat/hello")).toBe(false);
		expect(isDashboard("/notifications")).toBe(false);
	});
});

describe("findSearchButton", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("finds the button by its aria-label", () => {
		document.body.innerHTML = sidebar(
			'<button aria-label="Search repositories"></button>',
		);
		expect(findSearchButton(document)?.getAttribute("aria-label")).toBe(
			"Search repositories",
		);
	});

	it("finds the button by its search icon", () => {
		document.body.innerHTML = sidebar(
			'<button id="b"><svg class="octicon octicon-search"></svg></button>',
		);
		expect(findSearchButton(document)?.id).toBe("b");
	});

	it("ignores search buttons outside the Top repositories section", () => {
		document.body.innerHTML = `
      <header><button aria-label="Search or jump to"></button></header>
      ${sidebar("")}
    `;
		expect(findSearchButton(document)).toBeNull();
	});

	it("skips the button that wraps the title", () => {
		document.body.innerHTML = `
      <div><div>
        <button><h2>Top repositories</h2></button>
        <button aria-label="Search repositories"></button>
      </div></div>
    `;
		expect(findSearchButton(document)?.getAttribute("aria-label")).toBe(
			"Search repositories",
		);
	});

	it("returns null when the section is missing", () => {
		document.body.innerHTML =
			'<button aria-label="Search repositories"></button>';
		expect(findSearchButton(document)).toBeNull();
	});
});

describe("createAutoClicker", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	const setup = (pathname = "/") => {
		const location = { pathname };
		const clicker = createAutoClicker(document, location);
		return { location, clicker };
	};

	const renderButton = () => {
		document.body.innerHTML = sidebar(
			'<button aria-label="Search repositories"></button>',
		);
		const button = document.querySelector("button");
		const onClick = vi.fn();
		button.addEventListener("click", onClick);
		return onClick;
	};

	it("clicks the button on the dashboard", () => {
		const { clicker } = setup();
		const onClick = renderButton();
		clicker.check();
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("does not click outside the dashboard", () => {
		const { clicker } = setup("/octocat/hello");
		const onClick = renderButton();
		clicker.check();
		expect(onClick).not.toHaveBeenCalled();
	});

	it("clicks only once per visit so closing the search keeps it closed", () => {
		const { clicker } = setup();
		renderButton();
		clicker.check();
		const onClick = renderButton();
		clicker.check();
		expect(onClick).not.toHaveBeenCalled();
	});

	it("clicks again after navigating away and back", () => {
		const { location, clicker } = setup();
		renderButton();
		clicker.check();

		location.pathname = "/octocat/hello";
		clicker.check();
		location.pathname = "/";
		const onClick = renderButton();
		clicker.check();
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("waits until the button is rendered", () => {
		const { clicker } = setup();
		clicker.check();
		const onClick = renderButton();
		clicker.check();
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
