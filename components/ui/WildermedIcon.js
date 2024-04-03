import * as React from "react"

const WildermedIcon = ({leafColor, strokeWidth, crossColor, strokeColor, size}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 490.7 490.7"
    xmlSpace="preserve"
    height={size}
    width={size}
  >
    <path
      d="M460.4 30.1c-2.1-2.1-5-3-8-2.7-4.3.6-9.9 1.2-16.9 2-59.4 6.6-217.3 24.1-305.3 114.2C31.3 244.8 70.8 329 103.1 370.1c1.1 1.5 2.7 3.2 4.3 5-5.7 8.5-28.3 39.7-75.7 70.7-4.4 2.8-5.6 8.7-2.7 13.2 2.8 4.4 8.7 5.6 13.2 2.7 45.6-29.8 69.6-59.7 78.7-72.7 2.6 2.5 4.9 4.6 6.7 6.3 13.7 12.2 47.5 37.2 93.7 37.2 36.4 0 80.4-15.4 128.6-64.7 89-91.1 105.6-254.5 111.8-316 .6-5.7 1-10.3 1.5-13.7.4-3-.7-5.9-2.8-8z"
      style={{
        stroke: strokeColor ? strokeColor : "#000",
        fill: leafColor,
        strokeWidth: strokeWidth
      }}
    />
    <path
      style={{
        fill: crossColor,
      }}
      d="M299 305.4h-37.5v-37.5h-50v37.5H174v50h37.5v37.5h50v-37.5H299z"
    />
  </svg>
)

export default WildermedIcon
