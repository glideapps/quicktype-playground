import 'codemirror';
import 'codemirror/lib/codemirror';
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/anyword-hint'
import 'codemirror/mode/go/go'
import 'codemirror/addon/runmode/colorize';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/swift/swift';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/elm/elm';
import merge from 'deepmerge';
import Set from 'es6-set/polyfill';
import defaultConfig, {API_URLS} from '../config';
import {arrayFrom, getConfigFromElement, insertAfter} from '../utils';
import WebDemoApi from "../webdemo-api";
import TargetPlatform from '../target-platform'
import ExecutableFragment from './executable-fragment';
import '../styles.scss';

import {languages} from "quicktype";

const SKIP_LANUAGES = ["JavaScript"];

const INITED_ATTRIBUTE_NAME = 'data-kotlin-playground-initialized';

export default class ExecutableCode {
  /**
   * @param {string|HTMLElement} target
   * @param {KotlinPlayGroundConfig} [config]
   */
  constructor(target, config = {}) {
    const targetNode = typeof target === 'string' ? document.querySelector(target) : target;
    const targetNodeStyle = targetNode.getAttribute('style');
    const highlightOnly = targetNode.hasAttribute('data-highlight-only');
    let targetPlatform = targetNode.getAttribute('data-target-platform');
    let jsLibs = targetNode.getAttribute('data-js-libs');
    let isFoldedButton = targetNode.getAttribute('folded-button') !== "false";
    targetPlatform = targetPlatform !== null ? targetPlatform : "java";
    const code = targetNode.textContent.replace(/^\s+|\s+$/g, '');
    const cfg = merge(defaultConfig, config);

    let topLevelName = targetNode.getAttribute('data-type-name');
    topLevelName = topLevelName !== null ? topLevelName : "TopLevel";

    let LANGUAGES =
      languages
        .filter(l => SKIP_LANUAGES.indexOf(l.displayName) === -1)
        .filter(l => languages !== null && languages.indexOf(l.displayName))
        .sort((a, b) => a.displayName < b.displayName ? -1 : 1);

    let allowedLanguages = targetNode.getAttribute('data-languages');
    if (allowedLanguages !== null) {
      LANGUAGES = LANGUAGES.filter(l => allowedLanguages.indexOf(l.displayName) !== -1);
    }
        
    /*
      additionalLibs - setting additional JS-library
      Setting JQuery as default JS library
     */
    let additionalLibs;
    targetNode.style.display = 'none';
    targetNode.setAttribute(INITED_ATTRIBUTE_NAME, 'true');
    if (targetPlatform === "js" || targetPlatform === "canvas") {
      additionalLibs = new Set(API_URLS.JQUERY.split());
      if (jsLibs !== null) {
        let checkUrl = new RegExp("https?://.+\.js$");
        jsLibs
          .replace(" ", "")
          .split(",")
          .filter(lib => checkUrl.test(lib))
          .forEach(lib => additionalLibs.add(lib));
      }
    }
    const mountNode = document.createElement('div');
    mountNode.className = "quicktype-playground";
    insertAfter(mountNode, targetNode);

    const view = ExecutableFragment.render(mountNode, {highlightOnly});
    view.update({
      code: code,
      language: "JSON",
      topLevelName,
      compilerVersion: cfg.compilerVersion,
      highlightOnly: highlightOnly,
      targetPlatform: TargetPlatform.getById(targetPlatform),
      jsLibs: additionalLibs,
      isFoldedButton: isFoldedButton,
      languages: ["JSON", ...LANGUAGES.map(l => l.displayName)]
    });

    this.config = cfg;
    this.node = mountNode;
    this.targetNode = targetNode;
    this.targetNodeStyle = targetNodeStyle;
    this.view = view;

    targetNode.KotlinPlayground = this;
  }

  destroy() {
    this.config = null;
    this.node = null;
    this.view.destroy();
    const targetNode = this.targetNode;

    if (this.targetNodeStyle !== null) {
      targetNode.style = this.targetNodeStyle;
    } else {
      targetNode.style = '';
    }

    targetNode.removeAttribute(INITED_ATTRIBUTE_NAME);
    delete targetNode.KotlinPlayground;
  }

  isInited() {
    const node = this.targetNode;
    const attr = node && node.getAttribute(INITED_ATTRIBUTE_NAME);
    return attr && attr === 'true';
  }

  /**
   * @param {string|Node|NodeList} target
   * @param {boolean} highlightOnly
   * @return {Promise<Array<ExecutableCode>>}
   */
  static create(target, highlightOnly) {
    let targetNodes;

    if (typeof target === 'string') {
      targetNodes = arrayFrom(document.querySelectorAll(target));
    } else if (target instanceof Node) {
      targetNodes = [target];
    } else if (target instanceof NodeList === false) {
      throw new Error(`'target' type should be string|Node|NodeList, ${typeof target} given`);
    }

    // Return empty array if there is no nodes attach to
    if (targetNodes.length === 0) {
      return Promise.resolve([]);
    }

    return WebDemoApi.getCompilerVersions().then((versions) => {
      const instances = [];

      targetNodes.forEach((node) => {
        const config = getConfigFromElement(node, true);
        const minCompilerVersion = config.minCompilerVersion;
        let latestStableVersion = null;

        versions.forEach((compilerConfig) => {
          if (compilerConfig.latestStable) {
            latestStableVersion = compilerConfig.version;
          }
        });

        let compilerVersion = latestStableVersion;

        if (minCompilerVersion) {
          compilerVersion = minCompilerVersion > latestStableVersion
            ? versions[versions.length - 1].version
            : latestStableVersion;
        }

        // Skip empty and already initialized nodes
        if (
          node.textContent.trim() === '' ||
          node.getAttribute('data-kotlin-playground-initialized') === 'true'
        ) {
          return;
        }

        instances.push(new ExecutableCode(node, {
          compilerVersion,
          highlightOnly
        }));
      });

      return instances;
    });
  }
}
