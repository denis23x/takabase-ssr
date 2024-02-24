/** @format */

// prettier-ignore
export const environment = {
  appUrl: "https://takabase-dev.web.app",
  appCheck: "6LdbRn0pAAAAAPESvk85IVZiep5mp_QnQKrs8lrg",
  apiUrl: "https://takabase-dev-api.web.app/api/v1",
  ai: {
    moderation: true,
    url: "https://takabase-dev-ai.web.app/api/v1"
  },
  ipa: {
    url: "https://us-central1-takabase-dev.cloudfunctions.net/ext-image-processing-api-handler/process",
    bucket: "gs://takabase-dev-ipa",
  },
  mailer: {
    to: "damage.23x@gmail.com",
    bcc: [""],
  },
  pwa: false,
  production: true,
  firebase: {
    apiKey: "AIzaSyDxntkbYprxdDjuF39gCD6TUBKaMac5XqM",
    authDomain: "takabase-dev.firebaseapp.com",
    projectId: "takabase-dev",
    storageBucket: "takabase-dev.appspot.com",
    messagingSenderId: "154893506373",
    appId: "1:154893506373:web:2319353415e6129a6b902c"
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
    "circus",
    "cosy-creatures",
    "dia-de-muertos",
    "gaming",
    "gastronomy",
    "gym",
    "medicine",
    "medieval",
    "movie",
    "ninja",
    "police",
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
