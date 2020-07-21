/** @module Image
 *  @desc Image element
 *  @since 2020.05.19, 17:16
 *  @changed 2020.05.27, 22:58
 */

import React from 'react'
import { cn } from '@bem-react/classname'
// import config from 'config'

import ImageFile from './img/LockColor2.svg'

const cnHello = cn('Hello')

export default () => {
  return (
    <div className={cnHello('Image')}>
      <img src={ImageFile} />
    </div>
  )
}
