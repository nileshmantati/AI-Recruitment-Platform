import React from 'react'
import { T } from '../Js/theme.js'

const Badge = ({ children, color = T.primary, bg = null }) => {
    return (
        <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ color, background: bg || `${color}1A` }}
        >
            {children}
        </span>
    )
}

export default Badge