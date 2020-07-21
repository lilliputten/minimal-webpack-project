/** @module Title
 *  @desc Title element
 *  @since 2020.05.19, 17:16
 *  @changed 2020.05.27, 22:58
 */

import React from 'react'
import { cn } from '@bem-react/classname'

const cnHello = cn('Hello')

export default ({ greeting, name }) => (
  <h1 className={cnHello('Title')}>{greeting}, {name}!</h1>
)
