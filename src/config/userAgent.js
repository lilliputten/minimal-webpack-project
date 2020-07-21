/** @module config.build
 *  @description Build management config
 *  @since 2019.09.10, 14:25
 *  @changed 2020.05.17, 04:12
 *
 * Detecting next browser features (see `detectUserAgent` function):
 *
 *  - ANTGalio
 *  - WebKit
 *  - Opera
 *  - Firefox
 *  - Safari
 *  - IE
 *  - Edge
 *  - Chrome
 *  - Blink
 *
 * NOTE: All config submodules uses only ES5 syntax (no webpack/babel poly/overfills for avoid compatibility issues)
 */

/** Prefix to add for each body agent class.
 * Adding `{cssAgentPrefix}BrowserId` class for each detected browser feature).
 * E.g.: 'ua_Chrome', 'ua_IE' etc...
 */
var cssAgentPrefix = 'ua_'

const hasOwnProperty = Object.prototype.hasOwnProperty

function detectSafari() {
  var isSafari = false
  try {
    isSafari = /constructor/i.test(String(global.HTMLElement))
  }
  catch(error) {} // eslint-disable-line no-empty
  if (!isSafari) {
    var notificationObject = global.safari && (typeof global.safari !== 'undefined' && global.safari.pushNotification)
    isSafari = !!notificationObject && (String(notificationObject) === '[object SafariRemoteNotification]')
  }
  return isSafari
}

function detectUserAgent() {

  var agentString = String(global.navigator && global.navigator.userAgent || 'none')
  // var agentString = getAgentString()
  var document = global.document
  var body = (document && document.body/*  || {} */)

  var ua = {}

  ua.ANTGalio = agentString.indexOf('ANTGalio') !== -1
  ua.WebKit = agentString.indexOf('WebKit') !== -1

  ua.Opera = (!!global.opr && !!global.opr.addons) || !!global.opera || agentString.indexOf(' OPR/') != -1

  // Firefox 1.0+
  ua.Firefox = typeof InstallTrigger !== 'undefined'

  // // Safari 3.0+ "[object HTMLElementConstructor]"
  // ua.Safari = /constructor/i.test(global.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]" })(!global.safari || (typeof global.safari !== 'undefined' && global.safari.pushNotification))
  ua.Safari = detectSafari()

  ua.IE = /*@cc_on!@*/!!(document && document.documentMode)

  // Edge 20+
  ua.Edge = !ua.IE && !!global.StyleMedia

  // Chrome 1 - 71
  ua.Chrome = !!global.chrome && (!!global.chrome.webstore || !!global.chrome.runtime)

  // Blink engine detection
  ua.Blink = (ua.Chrome || ua.Opera) && !!global.CSS

  var agentData = {
    agentString: agentString,
    agentsList: [],
  }
  var cssAgentClasses = ''
  for (var key in ua) { // Filter non-false agent keys, construct agentsList...
    if (hasOwnProperty.call(ua, key) && ua[key]) {
      agentData[key] = ua[key]
      agentData.agentsList.push(key)
      cssAgentClasses += (cssAgentClasses ? ' ' : '') + cssAgentPrefix + key
    }
  }

  if (body) { // Add agent classes to body class
    body.className = (body.className ? body.className + ' ' : '') + cssAgentClasses
  }

  return agentData

}

var userAgent = detectUserAgent()

module.exports = userAgent
