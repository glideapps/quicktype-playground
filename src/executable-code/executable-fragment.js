import {languages, quicktype} from 'quicktype';
import merge from 'deepmerge';
import CodeMirror from 'codemirror';
import Monkberry from 'monkberry';
import directives from 'monkberry-directives';
import 'monkberry-events';
import ExecutableCodeTemplate from './executable-fragment.monk';
import WebDemoApi from '../webdemo-api';
import TargetPlatform from "../target-platform";
import getJsExecutor from "../js-executor"
import {countLines, unEscapeString} from "../utils";
import escapeStringRegexp from "escape-string-regexp"
import ComplectionView from "../complection-view";

const SAMPLE_START = '//sampleStart';
const SAMPLE_END = '//sampleEnd';
const MARK_PLACEHOLDER_OPEN = "[mark]";
const MARK_PLACEHOLDER_CLOSE = "[/mark]";
const CANVAS_PLACEHOLDER_OUTPUT_CLASS = ".js-code-output-canvas-placeholder";

const LANGUAGE_MODE = {
  "C#": "text/x-csharp",
  "JSON Schema": "application/ld+json",
  "JavaScript": "text/javascript",
  "TypeScript": "text/typescript",
  "Objective-C": "text/x-objectivec",
  "Java": "text/x-java",
  "Flow": "text/javascript",
  "JSON": "application/ld+json",
  "Swift": "text/x-swift",
  "Ruby": "text/x-ruby",
  "C++": "text/x-c++hdr",
  "Elm": "text/x-elm",
  "Go": "text/x-go",
  "Rust": "text/x-c",
};

const LANGUAGE_OPTIONS = {
  "TypeScript": { "just-types": true },
  "Ruby": { "just-types": true },
  "Elm": { "just-types": true },
  "Go": { "just-types": true },
  "Objective-C": { "just-types": true, features: "interface" },
  "Java": { "just-types": true },
  "Flow": { "just-types": true },
  "C++": { "just-types": true },
  "Rust": { "just-types": true },
  "C#": { features: "attributes-only" },
  "Swift": { initializers: false },
};

export default class ExecutableFragment extends ExecutableCodeTemplate {
  static render(element, options = {}) {
    const instance = Monkberry.render(ExecutableFragment, element, {
      'directives': directives
    });

    instance.arrayClasses = [];
    instance.initialized = false;
    instance.state = {
      code: '',
      foldButtonHover: false,
      folded: true,
      output: null
    };
    instance.codemirror = new CodeMirror();
    return instance;
  }

  update(state) {
    this.state = merge.all([this.state, state]);

    let platform = this.state.targetPlatform;
    const json = this.state.code;

    super.update(this.state);

    if (!this.initialized) {
      this.initializeCodeMirror(state);
      this.initialized = true;
    }

    if (this.state.language === "JSON") {
      this.codemirror.setValue(json);
    } else {
      quicktype({
        lang: this.state.language,
        sources: [
          {
            kind: "json",
            name: this.state.topLevelName || "TopLevel",
            samples: [json]
          }
        ],
        rendererOptions: LANGUAGE_OPTIONS[this.state.language]
      }).then(result => {
        this.codemirror.setValue(result.lines.join("\n").trim());
      });
    }
  }
  
  onLanguageClick(event) {
    event.preventDefault();
    this.update({
      language: event.target.innerText
    });
  }

  getCode() {
    return this.codemirror.getValue()
  }

  initializeCodeMirror(options = {}) {
    const textarea = this.nodes[0].getElementsByTagName('textarea')[0];
    const readOnly = true;
    const codemirrorOptions = {
      readOnly,
      lineNumbers: true,
      indentUnit: 4,
      viewportMargin: Infinity,
    };

    // Workaround to allow copy code in read-only mode
    // Taken from https://github.com/codemirror/CodeMirror/issues/2568#issuecomment-308137063
    if (readOnly) {
      codemirrorOptions.cursorBlinkRate = -1;
    }

    this.codemirror = CodeMirror.fromTextArea(textarea, codemirrorOptions);

    this.codemirror.on("change", codemirror => {
      codemirror.setOption("mode", LANGUAGE_MODE[this.state.language]);
    });
  }

  destroy() {
    this.arrayClasses = null;
    this.initialized = false;
    this.jsExecutor = false;
    this.state = null;
    this.codemirror.toTextArea();
    this.remove();
  }
}
