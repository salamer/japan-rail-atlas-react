# Japan Rail Atlas

The site uses locally bundled public data. Source names, year, scope and an
attribution link appear in the detail view or the data and methods dialog.
The interface and Canvas map renderer were written for this project.

## Data inputs

| File | Source |
| --- | --- |
| density.geojson | [Akira Nishizawa, nationwide rail passenger density](https://gtfs-gis.jp/railway_tsukajinin/data/tsukajinin_20260910.geojson), used under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| fy24.xlsx | [MLIT, FY2024 Railway Statistics Yearbook, table 2](https://www.mlit.go.jp/tetudo/content/002047408.xlsx) |
| jr24.xlsx | [MLIT, FY2024 Railway Statistics Yearbook, table 24](https://www.mlit.go.jp/tetudo/content/002047432.xlsx) |
| N02-24.zip | [MLIT, FY2024 National Land Numerical Information railway lines and stations](https://nlftp.mlit.go.jp/ksj/gml/data/N02/N02-24/N02-24_GML.zip), CC BY 4.0 |
| stations.zip | [MLIT, National Land Numerical Information S12, FY2024 station ridership](https://nlftp.mlit.go.jp/ksj/gml/data/S12/S12-25/S12-25_GML.zip) |
| census-kanto.xlsx | [MLIT, Greater Tokyo 2015 census, station-to-station table](https://www.mlit.go.jp/common/001178992.xlsx) |
| census-chukyo.xlsx | [MLIT, Greater Nagoya 2015 census, station-to-station table](https://www.mlit.go.jp/common/001179006.xlsx) |
| census-kinki.xlsx | [MLIT, Greater Osaka 2015 census, station-to-station table](https://www.mlit.go.jp/common/001179016.xlsx) |
| land.geojson | [Natural Earth, 1:10m countries](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson), public domain |
| prefectures.geojson | [Natural Earth, 1:10m administrative lines](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces_lines.geojson), public domain |
| lakes.geojson | [Natural Earth, 1:10m lakes](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_lakes.geojson), public domain |
| urban.geojson | [Natural Earth, 1:10m urban areas](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_urban_areas.geojson), public domain |

To regenerate the four JSON assets, install `openpyxl`, download the files
above and run `python scripts/prepare_data.py /path/to/inputs public/data`.

- The national detail preserves the publisher's line or segment and fiscal
  year. FY2024 values are supplemented where the operator, line or
  single-line operator scope and route length match the official yearbook.
- Census counts are the sum of both directions in the adjacent-station
  table. The geometry is a path between matched stations on the same N02
  route. Ambiguous or disconnected paths are excluded.
- S12 retains rows flagged as representative, with a published count for
  the selected year. Station circles use the largest single published
  record within the S12 station group. Other records are selectable.
- The shapes used for sorting and drawing are simplified from source
  geometry, and the historic statistics share the available geometry.
