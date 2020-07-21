/** @module demo
 *  @desc Main app entry point
 *  @since 2020.05.19, 17:16
 *  @changed 2020.05.27, 22:58
 */

import 'es5-shim/es5-shim'
import 'es5-shim/es5-sham'
import 'react-app-polyfill/ie9'
import 'react-app-polyfill/stable'

import React from 'react'
import { render } from 'react-dom'

// import config from 'config'

import Hello from './Hello'

// Demo app styles
import './index.pcss'

const demoContent = (
  <div className="demo">
    <Hello />
  </div>
)

render(demoContent, document.getElementById('root'))
