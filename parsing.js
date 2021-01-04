const fs = require("fs");
const source = fs.readFileSync("fnames").toString().split("\n");

let jsCode = "";
let gmlCode = "";

const fnames = [];

let fstrToFunction = (fstr) => {

    let fn = fstr
        .replace("[offset=0]", "offset")
        .replace("[num_args=array_length(array)-offset]", "num_args")
        .replace("....", "...")
        .replace(/\*/g, "")
        .replace(/ /g, "")
        .replace(/\[/g, "")
        .replace(/\]/g, "");

    const fname = fn.substring(0, fn.indexOf("("));
    if (fname === "gml_pragma" || fnames.includes(fname)) {
        return;
    }

    fnames.push(fname);

    const args = fn.substring(fn.indexOf("(") + 1, fn.indexOf(")")).split(",");

    let argStr = "";
    if (args.length !== 1 || args[0] !== "") {

        const es = [];
        for (let [index, arg] of args.entries()) {
            if (argStr !== "") {
                argStr += ",";
            }
            // keywords
            if (arg === "default") { arg = "_default"; }
            if (arg === "end") { arg = "_end"; }
            if (arg === "repeat") { arg = "_repeat"; }
            if (es.includes(arg) === true) {
                arg += index;
            }
            argStr += arg;
            es.push(arg);
        }

        const dotStart = argStr.indexOf("...");
        if (dotStart !== -1) {
            const argCount = (argStr.substring(0, dotStart).match(/,/g) || []).length;
            let remainer = "";
            for (let i = argCount; i < 16; i += 1) {
                if (remainer !== "") {
                    remainer += ",";
                }
                remainer += "arg" + i;
            }
            argStr = argStr.replace("...", remainer);
        }
    }

    let jsFName = fname;
    if (fname === "typeof") { jsFName = "_typeof"; }
    if (fname === "instanceof") { jsFName = "_instanceof"; }

    jsCode += `if(window.${jsFName}===undefined){window.${jsFName}=(${argStr})=>{return gml_Script_gmcallback_${fname}(null,null${argStr === "" ? "" : "," + argStr});};}\n`;
    gmlCode += `function gmcallback_${fname}(${argStr}){return ${fname}(${argStr});}\n`;
}

for (let fstr of source) {
    fstr = fstr.trim();

    // # = constant
    // * = readonly
    // @ = instance variable
    // & = obsolete
    // $ = US spelling
    // £ = UK spelling
    // ! = disallowed in free
    // % = property
    // ? = struct variable
    if (fstr !== "" && fstr[0] !== "/") {
        const l1 = fstr[fstr.length - 1];
        const l2 = fstr[fstr.length - 2];
        if (l1 === ")") {
            fstrToFunction(fstr);
        } else if (l2 === ")" && (
            l1 === "$" ||
            l1 === "!"
        )) {
            fstrToFunction(fstr.substring(0, fstr.length - 1));
        }
    }
}

fs.writeFileSync("gml-js-bridge/extensions/js_bridge_extension/fns.js", jsCode);
fs.writeFileSync("gml-js-bridge/scripts/fns/fns.gml", gmlCode);