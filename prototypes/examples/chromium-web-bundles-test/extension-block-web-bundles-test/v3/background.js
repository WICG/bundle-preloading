// print out matched rules

chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(
  (info) => {
    console.log('matched: ' + info);
    console.log('         ' + info.request);
    console.log('         ' + info.rule);
  }
);
