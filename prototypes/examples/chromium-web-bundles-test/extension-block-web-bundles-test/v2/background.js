function blockRequest(details) {
  console.assert(Object.values(chrome.webRequest.ResourceType).indexOf(details.type) >= 0,
                 `${details.type} is not supported resource type. (url: ${details.url})`);
  return { cancel: true };
}

var filters = [
  {urls: ['*://*/*by_bundle_file.wbn']}, // should be {urls: ['*://*/*by_bundle_file*'], types: ['webbundle']} (ref. https://crbug.com/41031645)
  {urls: ['*://*/*blue_subresource_loading*'], types: ['stylesheet', 'image']},
  {urls: ['*://*/*red_subresource_loading*'], types: ['stylesheet', 'image']},
  {urls: ['*://*/*by_scope/*']},
  {urls: ['*://*/*yellowgreen_subresource_loading*'], types: ['stylesheet', 'image']},
  {urls: ['*://*/*skyblue_subresource_loading*'], types: ['stylesheet', 'image']},
  {urls: ['*://*/*uuid_in_package_by_scope/*']},
  {urls: ['*://*/*red_unsigned_bundle*'], types: ['stylesheet', 'image']},
  {urls: ['*://localhost/green_unsigned_bundle*'], types: ['stylesheet', 'image']}, // Cannot specify port number (8081)
  {urls: ['*://localhost/blue_unsigned_bundle*'], types: ['stylesheet', 'image']},  // Cannot specify port number (8082)
  {urls: ['*://*/*purple_unsigned_bundle*'], types: ['stylesheet', 'image']},
  {urls: ['*://*/*blue_signed_subresource_loading*'], types: ['stylesheet', 'image']},
  {urls: ['*://*/*red_signed_subresource_loading*'], types: ['stylesheet', 'image']},
  {urls: ['*://*/*fetch_result_1_subresource_loading*'], types: ['xmlhttprequest']},
  {urls: ['*://*/*xhr_result_1_subresource_loading*'], types: ['xmlhttprequest']},
  {urls: ['*://*/*fetch_result_1_unsigned_bundle*'], types: ['xmlhttprequest']},
  {urls: ['*://*/*xhr_result_1_unsigned_bundle*'], types: ['xmlhttprequest']},
  {urls: ['*://*/*fetch_result_2_unsigned_bundle*'], types: ['xmlhttprequest']},
  {urls: ['*://*/*xhr_result_2_unsigned_bundle*'], types: ['xmlhttprequest']},
  {urls: ['*://*/*blocked_bundle.wbn']}, // should be {urls: ['*://*/*blocked_bundle*'], types: ['webbundle']} (ref. https://crbug.com/41031645)
];

filters.forEach(filter => {
  chrome.webRequest.onBeforeRequest.addListener(blockRequest, filter, ['blocking']);
});


