/** @format */

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// prettier-ignore
export const environment = {
  appUrl: "http://localhost:4200",
  apiUrl: "http://localhost:4400/api/v1",
  ipaUrl: "https://us-central1-draft-ssr.cloudfunctions.net/ext-image-processing-api-handler/process",
  ipaStorageBucket: 'gs://draft-ssr-image-processing',
  reportTo: 'damage.23x@gmail.com',
  reportBcc: [''],
  pwa: false,
  production: false,
  firebase: {
    apiKey: "AIzaSyDt88ljM_Bq3QvQlATnC-vrC4NdCwWIQzQ",
    authDomain: "draft-ssr.firebaseapp.com",
    projectId: "draft-ssr",
    storageBucket: "draft-ssr.appspot.com",
    messagingSenderId: "231627312637",
    appId: "1:231627312637:web:f5e2ff009dfd5d3d279d94",
    measurementId: "G-SYQEF6EH3K"
  },
  themes: [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter"
  ],
  backgrounds: [
    "beauty",
    "cosy-creatures",
    "dia-de-muertos",
    "gaming",
    "gastronomy",
    "gym",
    "medicine",
    "medieval",
    "movie",
    "ninja",
    "spring",
    "summer"
  ],
  prism: {
    themes: [
      "coy",
      "darcula",
      "default",
      "holi-theme",
      "night-owl",
      "okaidia",
      "one-dark",
      "one-light",
      "solarizedlight",
      "vs",
      "synthwave84",
      "tomorrow",
      "twilight"
    ],
    grammars: [
      "zig",
      "yang",
      "yaml",
      "xquery",
      "xojo",
      "xml-doc",
      "xeora",
      "wren",
      "wolfram",
      "wiki",
      "wgsl",
      "web-idl",
      "wasm",
      "warpscript",
      "v",
      "visual-basic",
      "vim",
      "vhdl",
      "verilog",
      "velocity",
      "vbnet",
      "vala",
      "uri",
      "uorazor",
      "unrealscript",
      "typoscript",
      "typescript",
      "twig",
      "turtle",
      "tt2",
      "tsx",
      "tremor",
      "toml",
      "textile",
      "tcl",
      "tap",
      "t4-vb",
      "t4-templating",
      "t4-cs",
      "systemd",
      "swift",
      "supercollider",
      "stylus",
      "stata",
      "stan",
      "squirrel",
      "sql",
      "sqf",
      "splunk-spl",
      "sparql",
      "soy",
      "solution-file",
      "solidity",
      "sml",
      "smarty",
      "smalltalk",
      "smali",
      "shell-session",
      "scss",
      "scheme",
      "scala",
      "sass",
      "sas",
      "rust",
      "ruby",
      "robotframework",
      "roboconf",
      "r",
      "rip",
      "rest",
      "rescript",
      "renpy",
      "rego",
      "regex",
      "reason",
      "racket",
      "qsharp",
      "qore",
      "qml",
      "q",
      "python",
      "purescript",
      "pure",
      "purebasic",
      "puppet",
      "pug",
      "psl",
      "protobuf",
      "properties",
      "promql",
      "prolog",
      "processing",
      "powershell",
      "powerquery",
      "plsql",
      "plant-uml",
      "php",
      "php-extras",
      "phpdoc",
      "perl",
      "peoplecode",
      "pcaxis",
      "pascal",
      "pascaligo",
      "parser",
      "parigp",
      "oz",
      "openqasm",
      "opencl",
      "odin",
      "ocaml",
      "objectivec",
      "nsis",
      "nix",
      "nim",
      "nginx",
      "nevod",
      "neon",
      "nasm",
      "naniscript",
      "nand2tetris-hdl",
      "n4js",
      "n1ql",
      "moonscript",
      "monkey",
      "mongodb",
      "mizar",
      "metafont",
      "mermaid",
      "mel",
      "maxscript",
      "matlab",
      "mata",
      "markup-templating",
      "markup",
      "markdown",
      "makefile",
      "magma",
      "lua",
      "lolcode",
      "log",
      "llvm",
      "livescript",
      "lisp",
      "liquid",
      "linker-script",
      "lilypond",
      "less",
      "latte",
      "latex",
      "kusto",
      "kumir",
      "kotlin",
      "keyman",
      "keepalived",
      "julia",
      "jsx",
      "js-templates",
      "jsstacktrace",
      "jsonp",
      "json",
      "json5",
      "js-extras",
      "jsdoc",
      "jq",
      "jolie",
      "j",
      "jexl",
      "javastacktrace",
      "javascript",
      "java",
      "javadoc",
      "javadoclike",
      "io",
      "ini",
      "inform7",
      "ignore",
      "iecst",
      "idris",
      "icu-message-format",
      "icon",
      "ichigojam",
      "http",
      "hsts",
      "hpkp",
      "hoon",
      "hlsl",
      "hcl",
      "haxe",
      "haskell",
      "handlebars",
      "haml",
      "groovy",
      "graphql",
      "gradle",
      "go-module",
      "go",
      "gn",
      "gml",
      "glsl",
      "git",
      "gherkin",
      "gettext",
      "gedcom",
      "gdscript",
      "gcode",
      "gap",
      "ftl",
      "fsharp",
      "fortran",
      "flow",
      "firestore-security-rules",
      "false",
      "factor",
      "excel-formula",
      "etlua",
      "erlang",
      "erb",
      "elm",
      "elixir",
      "ejs",
      "eiffel",
      "editorconfig",
      "ebnf",
      "dot",
      "docker",
      "dns-zone-file",
      "d",
      "django",
      "diff",
      "dhall",
      "dax",
      "dataweave",
      "dart",
      "cypher",
      "cue",
      "csv",
      "css",
      "css-extras",
      "csp",
      "cshtml",
      "csharp",
      "crystal",
      "cpp",
      "coq",
      "cooklang",
      "concurnas",
      "coffeescript",
      "cobol",
      "c",
      "cmake",
      "clojure",
      "clike",
      "cil",
      "cilkcpp",
      "cilkc",
      "chaiscript",
      "cfscript",
      "bsl",
      "bro",
      "brightscript",
      "brainfuck",
      "bqn",
      "bnf",
      "bison",
      "birb",
      "bicep",
      "bbj",
      "bbcode",
      "batch",
      "basic",
      "bash",
      "awk",
      "avro-idl",
      "avisynth",
      "autoit",
      "autohotkey",
      "aspnet",
      "asmatmel",
      "asm6502",
      "asciidoc",
      "arturo",
      "armasm",
      "arff",
      "arduino",
      "aql",
      "applescript",
      "apl",
      "apex",
      "apacheconf",
      "antlr4",
      "al",
      "agda",
      "ada",
      "actionscript",
      "abnf",
      "abap"
    ]
  }
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
