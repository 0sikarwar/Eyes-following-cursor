export const svgString = `<svg
id="base-eye"
class="eye"
viewbox="0 0 1000 1000"
xmlns="http://www.w3.org/2000/svg"
fill="black"
>
<clipPath id="lids">
  <path
    id="lids-path"
    stroke-linejoin="round"
    stroke-linecap="round"
    d="M 50 500 Q 500 0 950 500 Q 500 850 50 500"
  />
</clipPath>
<use href="#lids-path" class="lids" stroke="#000" stroke-width="20" />
<g clip-path="url(#lids)" class="clipPath">
  <rect class="whites" width="1000" height="1000" fill="#fff" />
  <g class="pupil-group">
    <circle class="pupil" cx="500" cy="500" r="150" fill="#000" />
    <circle class="glint" cx="450" cy="450" r="20" fill="#fff" />
  </g>
</g>
</svg>`;
