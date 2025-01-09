//특수문자 정규표현식
export const specialLetters: RegExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g;
//영문 정규표현식
export const englishLetters: RegExp = /[^a-zA-Z0-9\s]/;
//영문 대소문자 정규표현식
export const capitalLetters: RegExp = /[A-Z]/;
