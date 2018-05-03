import ExecutableCode from "./executable-code";
import { getConfigFromElement, getCurrentScript, waitForNode } from "./utils";

/**
 * @param {string} selector
 * @return {Promise<Array<ExecutableCode>>}
 */
export default function create(selector) {
  return ExecutableCode.create(selector);
}

// Backwards compatibility, should be removed in next major release
create.default = create;

// Auto initialization via data-selector <script> attribute
const currentScript = getCurrentScript();
const config = getConfigFromElement(currentScript);
let { selector } = config;
selector = selector || ".quicktype";

if (selector) {
  document.addEventListener("DOMContentLoaded", () => {
    create(selector);
  });
}
