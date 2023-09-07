/**
 * Retrieve the array key corresponding to the largest element in the array.
 *
 * @param {Array.<number>} array Input array
 * @return {number} Index of array element with largest value
 */
function argMax(array) {
  return [].map.call(array, (x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

document.getElementById("new-window").addEventListener('click', (event) => {
  window.appWindow.newHomeWindow();
});

// function startOSCClient(oscParams) {
//   window.oscApi.startOSCClient(oscParams['osc-port']);
// }

// function sendMessage(oscParams, message)