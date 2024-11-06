import * as React from "react";
import Svg, { Path } from "react-native-svg";
const Failed = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={178}
    height={178}
    fill="none"
    {...props}
  >
    <Path
      stroke="#DA4D4D"
      strokeWidth={7.504}
      d="M89 4c46.911 0 85 38.089 85 85s-38.089 85-85 85S4 135.911 4 89 42.089 4 89 4Z"
      opacity={0.322}
    />
    <Path
      fill="#DA4D4D"
      d="M89.437 15.649c40.44 0 73.223 32.783 73.223 73.222 0 40.44-32.783 73.223-73.223 73.223s-73.223-32.783-73.223-73.223S48.997 15.65 89.437 15.65Z"
    />
    <Path
      fill="#fff"
      d="M89.837 109.32c4.914 0 8.343 4.428 8.343 8.402 0 4.656-3.429 9.084-8.343 9.084-5.715 0-9.143-4.428-9.143-9.084 0-3.974 3.428-8.402 9.143-8.402Zm2.316-61.662c2.198 0 4.076 1.773 4.182 3.9l.004.19v42.439c0 2.147-1.815 3.981-3.993 4.084l-.193.005H86.72c-2.198 0-4.076-1.773-4.182-3.9l-.005-.19V51.748c0-2.147 1.816-3.981 3.994-4.085l.193-.004h5.432Z"
    />
  </Svg>
);
export default Failed;