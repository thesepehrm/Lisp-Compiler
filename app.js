/**
 * Created by Sepehr on 7/2/17.
 */
"use strict";

let compiler = require("./compiler.js");

const SOURCE_CODE = "(* (+ 1 2.2) 3)\n(print \"Hello World\")\n(+ (* 2 4) 10)";
const SPLITTED_CODE = SOURCE_CODE.split("\n");
let currentLine = 1;
try {
    console.time("Compile Time");
    while (currentLine <= SPLITTED_CODE.length) {
        compiler.compile(SPLITTED_CODE[currentLine-1]);
        currentLine++;
    }
    console.timeEnd("Compile Time");
} catch (e){
     console.log(e.message+" on Line "+currentLine);
}