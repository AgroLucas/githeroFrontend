"use strict";

/** Those functions are from StackOverflow**/
//add replace / by Agró Lucas
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/\//g, "&#047;")
        .replace(/'/g, "&#039;");
  }

//https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
function detectMob() {
  const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
  ];
  return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
  });
}

export { escapeHtml, detectMob };