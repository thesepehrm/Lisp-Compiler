/**
 * Created by Sepehr on 7/2/17.
 */
"use strict";

let compiler_functions = {
    '+' () {
        if (arguments.length < 3) {
            throw new Error("Syntax Error: Invalid Arguments for + operator.")
        }
        let temp = 0;
        for (let i = 0; i < arguments.length; i++)
            temp += arguments[i];
        return temp;
    },
    '-' () {
        if (arguments.length < 3) {
            throw new Error("Syntax Error: Invalid Arguments for - operator.")
        }
        let temp = arguments[0];
        for (let i = 0; i < arguments.length; i++)
            temp -= arguments[i];
        return temp;
    },
    '*' () {
        if (arguments.length < 3) {
            throw new Error("Syntax Error: Invalid Arguments for * operator.")
        }
        let temp = 1;
        for (let i = 0; i < arguments.length; i++)
            temp *= arguments[i];
        return temp;
    },
    'print' () {
        if (arguments.length < 1) {
            throw new Error("Syntax Error: Invalid Arguments for print.")
        }
        let outputstring = "";
        for (let i = 0; i < arguments.length; i++) {
            if (i > 1)
                outputstring += " ";
            outputstring += arguments[i];
        }
        console.log(outputstring);
    }
};


function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

module.exports = {
    tokenize(code) {
        let tokens =[];
        let temp = "";
        for (let i = 0; i < code.length; i++) {
            //noinspection FallThroughInSwitchStatementJS
            switch (code[i]) {
                case ')':
                case '(':
                case ' ':
                    if (temp != "")
                        tokens.push(temp);
                    temp = "";
                    if (code[i] == '(' || code[i] == ')')
                        tokens.push(code[i]);
                    break;
                case '"':
                    if (temp != "")
                        throw new Error("Syntax Error");
                    let openQuote = true;
                    let openCommand = false;
                    ++i;
                    temp = '"';
                    while (i < code.length) {
                        if (code[i] == "\\") {
                            openCommand = true;
                            ++i;
                            continue;
                        }
                        if (openCommand) {
                            switch(code[i]) {
                                case '\\':
                                    temp += '\\';
                                    break;
                                case 'n':
                                    temp += '\n';
                                    break;
                                case 't':
                                    temp += '\t';
                                    break;
                                default:
                                    temp+=code[i];
                            }
                            openCommand = false;
                            ++i;
                            continue;
                        }
                        if (code[i] == '"') {
                            openQuote = false;
                            break;
                        }
                        temp+=code[i];
                        ++i;
                    }
                    if (openQuote)
                        throw new Error("Syntax Error: Invalid String");
                    if (openCommand)
                        throw new Error("Syntax Error: Invalid String Backslash Command");
                    tokens.push(temp+'"');
                    temp = "";
                    break;
                default:
                    temp += code[i];
                    break;
            }
        }

        return tokens;
    },

    parser(tokens) {
        function findClosingParanthesis(startingfrom) {
            let pLoader = 0;
            for(let i=startingfrom; i< tokens.length; i++) {
                switch (tokens[i]) {
                    case '(':
                        pLoader++;
                        break;
                    case ')':
                        pLoader--;
                        break;
                    default:
                        continue;
                }
                if (pLoader == 0)
                    return i;
            }
            throw new Error("Syntax Error: Invalid parenthesis")
        }
        let numOfP = 0;
        let codeObject = {};

        if (tokens[0] == "'") {
            codeObject.type = "list";
            codeObject.nodes = [];
            tokens.shift();
        } else {
            if (tokens[1] in compiler_functions) {
                codeObject.type = "s-expression";
                codeObject.params = [];
            }
            else if (tokens[1] == 'list' || tokens[1] == 'cons') {
                codeObject.type = "list";
                codeObject.nodes = [];
            }
            else
                throw new Error("Syntax Error: Undefined function (" + tokens[1] + ")");
        }

        //Removing first and last paranthesis
        tokens.shift();
        tokens.pop();


        for (let i = 1; i < tokens.length; i++) {
            if (tokens[i] == '(') {
                numOfP++;
                const closingpr = findClosingParanthesis(i);
                if (codeObject.type == "list") {
                    codeObject.nodes.push(this.parser(tokens.slice(1, closingpr + 1)));
                }
                else {
                    codeObject.params.push(this.parser(tokens.slice(1, closingpr + 1)));
                }
                i = closingpr;
            }
            else {
                if (codeObject.type == 'list') {
                    if (tokens[i][0] == '"') {
                        codeObject.nodes.push({type: "String", value: tokens[i].substr(1, tokens[i].length - 2)});
                    }
                    else if (isNumeric(tokens[i])) {
                        codeObject.nodes.push({type: "Number", value: parseFloat(tokens[i])});
                    }
                    else
                        throw new Error("Syntax Error: Invalid Data '" + tokens[i] + "'");
                    continue;
                }
                if (tokens[i][0] == '"') {
                    codeObject.params.push({type: "String",value: tokens[i].substr(1, tokens[i].length - 2)});
                }
                else if (isNumeric(tokens[i])) {
                    codeObject.params.push({type: "Number", value: parseFloat(tokens[i])});
                }
                else {
                    throw new Error("Syntax Error: Invalid Data '" + tokens[i] + "'");
                }


            }
        }
        return codeObject;

    },
    compileTree(tree) {
        //TODO: To be codded...
    },
    compile(code) {
        const TOKENS = this.tokenize(code);
        //console.log(TOKENS);
        const AST = this.parser(TOKENS);
        console.log(JSON.stringify(AST,null,2));
        this.compileTree(AST);
    }

};
