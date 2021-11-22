'use strict';

function factorialIter(num){
    let res = 1;
    for (let i = 1; i <= num; i++){
        res *= i;
    }
    return res
}
function factorialRec(num){
    if (num == 1 || num == 0) return 1;
    else return factorialRec(num-1)*num;
}

function xor(arg1, arg2){
    return arg1^arg2;
}


function longestWord(str){
    let result = "", curWord = "";
    for (let i = 0; i < str.length; i++) {
        if (str[i] == " ") {
            if (curWord.length > result.length) {
                result = curWord;
            } 
            curWord = "";
            continue;
        }
        curWord += str[i];
    }
    return result;
}

console.log(longestWord("abc abcc abcc1 abcc2 a"));