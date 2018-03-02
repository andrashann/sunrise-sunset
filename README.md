# sunrise-sunset
A static site to compare sunrise/sunset times of to places on Earth

## What's this?

I grew up in Budapest and moved to the Netherlands a few years ago. I could not ignore the fact that the Sun has very different patterns: it rises later and sets later here than in Budapest. However, this difference is not uniform: my feeling was that the sun rises much later and sets about the same time during the winter. I saw the inverse in the summer: Dutch summer evenings are much longer, but dawn does not lag behind that much.

This page lets you compare the dawn/dusk pattern of two arbitrary locations: just click the map to move a marker to your desired location. Hover over the graph to see exact dawn/dusk times.

I used quite a few tools to get this site going:
* [Bootstrap](https://getbootstrap.com/) for the general layout 
* [timezonedb.com](https://timezonedb.com)'s API to get time zone information based on geographic coordinates
* the [Nominatim](https://nominatim.openstreetmap.org/) api to get the name of the location that was chosen
* [SunCalc](https://github.com/mourner/suncalc) to calculate dawn/dusk times
* [Datejs](https://github.com/datejs/Datejs) to work with dates
* [C3.js](http://c3js.org/) for the graph
* [Leaflet](http://leafletjs.com/) for the map
* [leaflet-color-markers](https://github.com/pointhi/leaflet-color-markers) for the orange marker on the map.
* [Google Fonts](https://fonts.google.com/) for the typeface (Crimson Text)
