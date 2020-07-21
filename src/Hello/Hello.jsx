/** @module Hello
 *  @desc Hello demo component
 *  @since 2020.05.19, 17:16
 *  @changed 2020.05.27, 22:58
 */

import React from 'react'
import { cn } from '@bem-react/classname'
import config from 'config'

import './Hello.pcss'

import Title from './Title'
import Image from './Image'

const cnHello = cn('Hello')

const { defaultGreeting, defaultName } = config.constants

const Hello = ({ greeting = defaultGreeting, name = defaultName }) => {
  return (
    <div className={cnHello()}>
      <Title greeting={greeting} name={name} />
      <Image />
    </div>
  )
}

export default Hello
