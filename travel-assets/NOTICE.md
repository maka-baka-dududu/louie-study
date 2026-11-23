# Offline travel map sources

## global/SOURCE.txt

GeoNames cities500, downloaded 2026-11-09. 236971 records. Source https://download.geonames.org/export/dump/cities500.zip
Creative Commons Attribution 4.0 https://creativecommons.org/licenses/by/4.0/
© GeoNames contributors https://www.geonames.org/
Derived fields: selected aliases, coordinates, ISO country code, administrative code, population. Sorted by population; not a complete global village or street database. No roads/buildings.


## admin/LICENSE.txt

MIT License

Copyright (c) 2024 ChuXiao

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## admin/source.json

{
  "source": "zhChuXiao/ChinaGeoJson (DataV.GeoAtlas snapshot)",
  "url": "https://github.com/zhChuXiao/ChinaGeoJson",
  "counts": {
    "province": 34,
    "district": 2840,
    "city": 363
  },
  "withoutGeometry": [],
  "note": "Offline snapshot; boundaries simplified for visualization. Not a current cadastral or navigation map."
}

## terrain/source.json

{
  "source": "NASA Earth Observatory / GEBCO, Blue Marble Next Generation",
  "page": "https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/topography-bathymetry-maps/",
  "topography_range_m": [
    0,
    6400
  ],
  "bathymetry_range_m": [
    -8000,
    0
  ],
  "original_image_size": [
    5400,
    2700
  ],
  "grid": [
    481,
    241
  ],
  "grid_step_degrees": 0.75,
  "purpose": "Macro relief visualization; resampled and vertically exaggerated, not a precise elevation measurement."
}

## Detailed map layers

Natural Earth 1:50m land, coastline, borders, lakes and river centerlines, version 5.1.2.
Public domain, https://www.naturalearthdata.com/about/terms-of-use/
Source files: https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2/geojson
Land polygons are rasterized for the globe coverage mask. Line coordinates are rounded to three decimals and split into short overlapping rendering segments. This is a regional overview, without streets or buildings.

The compact map label index is derived from the GeoNames cities500 records above. It contains the largest cities and a geographic sample for less populated regions. The full dataset is loaded separately when searching.


## Natural land-cover texture (2026-11-23)

Natural Earth I, NE1_50M_SR_W, version 3.2.0. Satellite-derived land cover, shaded relief, and ocean bathymetry; public domain.
Source: https://www.naturalearthdata.com/downloads/50m-raster-data/50m-natural-earth-1/
Archive: https://naciscdn.org/naturalearth/50m/raster/NE1_50M_SR_W.zip
The 10800×5400 raster is resampled to 4096×2048 JPEG for offline globe and full-route views. Natural land-cover colors are preserved, including desert sand, vegetation, and polar ice. This is a generalized reference map, not live imagery or navigation data.
