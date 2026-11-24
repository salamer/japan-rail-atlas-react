#!/usr/bin/env python3
"""Build compact map data from the public inputs listed in DATA.md."""
import argparse
from collections import Counter, defaultdict
import heapq
import json
from math import atan2, cos, hypot, radians, sin, sqrt
from pathlib import Path
import re
from unicodedata import normalize
import zipfile

from openpyxl import load_workbook


YEARS = list(range(2018, 2026))
METRO_OPERATORS = {
    '札幌市', '仙台市', '東京都', '東京地下鉄', '横浜市', '名古屋市',
    '京都市', '大阪市高速電気軌道', '神戸市', '福岡市',
}
CHAR_VARIANTS = str.maketrans({'ヶ': 'ケ', 'が': 'ケ', 'ヵ': 'ケ', 'ッ': 'ツ', '曽': '曾', '瀨': '瀬', '薗': '園', '﨑': '崎', '國': '国', '神': '神'})
REGION_BOUNDS = {
    'kanto': (138.25, 34.64, 141.15, 37.05),
    'chukyo': (136.14, 34.40, 138.05, 36.04),
    'kinki': (134.24, 34.00, 136.66, 35.64),
}


def clean(value):
    return re.sub(r'\s+', '', normalize('NFKC', str(value or '')))


def line_key(value):
    name = clean(value).translate(CHAR_VARIANTS)
    name = re.sub(r'^\d+号線', '', name).strip('()')
    return re.sub(r'本線$', '線', name)


def station_key(value):
    return re.sub(r'\([^)]*\)', '', clean(value)).translate(CHAR_VARIANTS)


def category(operator, line, mode):
    if '新幹線' in line:
        return 'highspeed'
    if operator.endswith('旅客鉄道'):
        return 'jr'
    if operator in METRO_OPERATORS and mode not in {'路面電車', 'モノレール', '案内軌条式'} and line not in {'荒川線', '上野懸垂線', '日暮里・舎人ライナー', '南港ポートタウン線', 'ポートアイランド線', '海岸線連絡線'}:
        return 'metro'
    return 'other'


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def zip_geojson(path, suffix):
    with zipfile.ZipFile(path) as archive:
        entry = next(name for name in archive.namelist() if 'UTF-8/' in name and name.endswith(suffix))
        return json.loads(archive.read(entry))['features']


def save(output, name, data):
    (output / name).write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')


def polylines(geometry):
    if not geometry:
        return []
    kind = geometry['type'].lower()
    if kind in ('linestring', 'polygon'):
        return geometry['coordinates'] if kind == 'polygon' else [geometry['coordinates']]
    if kind == 'multipolygon':
        return [line for polygon in geometry['coordinates'] for line in polygon]
    return geometry['coordinates']


def point_distance_squared(point, start, end):
    x, y = point
    a, b = start
    dx, dy = end[0] - a, end[1] - b
    if dx == 0 and dy == 0:
        return (x - a) ** 2 + (y - b) ** 2
    fraction = max(0, min(1, ((x - a) * dx + (y - b) * dy) / (dx * dx + dy * dy)))
    return (x - a - fraction * dx) ** 2 + (y - b - fraction * dy) ** 2


def simplify(points, tolerance=.00014):
    """Douglas–Peucker, retaining fixed endpoints and omitting repeated points."""
    if len(points) < 2:
        return []
    threshold = tolerance ** 2
    keep = {0, len(points) - 1}
    jobs = [(0, len(points) - 1)]
    while jobs:
        first, last = jobs.pop()
        maximum, index = threshold, None
        for k in range(first + 1, last):
            distance = point_distance_squared(points[k], points[first], points[last])
            if distance > maximum:
                maximum, index = distance, k
        if index is not None:
            keep.add(index)
            jobs.extend(((first, index), (index, last)))
    result = []
    for k in sorted(keep):
        point = [round(value, 5) for value in points[k][:2]]
        if not result or point != result[-1]:
            result.append(point)
    return result if len(result) > 1 else []


def box(points):
    lons, lats = zip(*points)
    return min(lons), min(lats), max(lons), max(lats)


def intersects(a, b):
    return a[0] <= b[2] and a[1] <= b[3] and a[2] >= b[0] and a[3] >= b[1]


def inside(point, bounds):
    x, y = point
    return bounds[0] <= x <= bounds[2] and bounds[1] <= y <= bounds[3]


def midpoint(paths):
    # Station geometries are short line segments along the platform.
    points = max(paths, key=len)
    first, last = points[0], points[-1]
    return [(first[k] + last[k]) / 2 for k in range(2)]


def make_base(inputs):
    result = {}
    extent = (120, 23, 154, 48)
    for name in ('land', 'lakes', 'prefectures', 'urban'):
        lines = []
        for feature in read_json(inputs / f'{name}.geojson')['features']:
            if name == 'prefectures' and feature['properties'].get('ADM0_A3') not in ('JPN', None):
                continue
            for path in polylines(feature['geometry']):
                if len(path) < 2 or not intersects(box(path), extent):
                    continue
                # Keep complete polygons so no visible seam forms at the working extent.
                shape = simplify(path, .0020 if name == 'land' else .0011)
                if len(shape) > (1 if name == 'prefectures' else 3):
                    if name == 'land':
                        lines.append([feature['properties'].get('ADM0_A3') == 'JPN', shape])
                    else:
                        lines.append(shape)
        result[name] = lines
    return result


def density_updates(inputs):
    updates = {}
    worksheet = load_workbook(inputs / 'fy24.xlsx', read_only=True, data_only=True).active
    operator = ''
    for row in list(worksheet.values)[6:]:
        if row[0]:
            operator = clean(row[0])
        if isinstance(row[12], (float, int)) and isinstance(row[2], (float, int)):
            key = (operator, line_key(row[1]))
            if key not in updates:
                updates[key] = (round(row[12]), row[2] / 365)
            else:
                updates[key] = None
    worksheet = load_workbook(inputs / 'jr24.xlsx', read_only=True, data_only=True).active
    for offset in (0, 5, 10):
        operator = ''
        for row in list(worksheet.values)[3:]:
            if clean(row[offset]).endswith('旅客鉄道'):
                operator = clean(row[offset])
                continue
            name = line_key(row[offset])
            days_km, density = row[offset + 1], row[offset + 3]
            if operator and name and isinstance(days_km, (float, int)) and isinstance(density, (float, int)):
                key = (operator, name)
                updates[key] = None if key in updates else (round(density), days_km / 365)
    return updates


def make_lines(inputs):
    source = read_json(inputs / 'density.geojson')['features']
    updates = density_updates(inputs)
    operator_counts = Counter(item['properties']['事業者名'] for item in source)
    line_counts = Counter((item['properties']['事業者名'], line_key(item['properties']['路線名'])) for item in source)
    result = []
    for item in source:
        row = item['properties']
        operator, name, mode = row['事業者名'], row['路線名'], row['種類']
        km = row['営業キロ']
        values = [round(row[f'{year}年度']) if row[f'{year}年度'] >= 0 else None for year in YEARS]
        update = None
        key = (operator, line_key(name))
        if line_counts[key] == 1:
            update = updates.get((clean(operator), line_key(name)))
        if update is None and operator_counts[operator] == 1:
            update = updates.get((clean(operator), ''))
        official = values[6] is None and update is not None and km > 0 and abs(update[1] - km) < .21
        if official:
            values[6] = update[0]
        shape = [path for line in polylines(item['geometry']) if (path := simplify(line))]
        if not shape:
            continue
        result.append({
            'id': f"r{int(row['ID'])}-{len(result)}",
            'operator': operator, 'name': name, 'type': category(operator, name, mode),
            'from': clean(row['始点駅']), 'to': clean(row['終点駅']), 'km': km, 'note': row['備考'],
            'shape': shape, 'values': values, 'official': official,
        })
    return result


def make_stations(inputs):
    features = zip_geojson(inputs / 'stations.zip', 'NumberOfPassengers.geojson')
    result = []
    for item in features:
        row = item['properties']
        values, notes = [], {}
        for year in YEARS[:-1]:
            duplicate_key = 6 + (year - 2011) * 4
            count = row.get(f'S12_{duplicate_key + 3:03d}')
            published = row.get(f'S12_{duplicate_key + 1:03d}') == 1
            representative = row.get(f'S12_{duplicate_key:03d}') == 1
            values.append(count if published and representative and isinstance(count, int) else None)
            remark = row.get(f'S12_{duplicate_key + 2:03d}')
            if values[-1] is not None and remark:
                notes[str(year)] = remark
        if all(value is None for value in values):
            continue
        position = [round(x, 5) for x in midpoint(polylines(item['geometry']))]
        name, operator, line = row['S12_001'], row['S12_002'], row['S12_003']
        result.append({
            'id': f"s{len(result)}", 'group': row['S12_001g'], 'name': name, 'operator': operator,
            'line': line, 'point': position, 'values': values, 'notes': notes,
        })
    return result


def dist_km(a, b):
    lat1, lat2 = radians(a[1]), radians(b[1])
    change_lat, change_lon = lat2 - lat1, radians(b[0] - a[0])
    raw = sin(change_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(change_lon / 2) ** 2
    return 12742 * atan2(sqrt(raw), sqrt(1 - raw))


class RailGraph:
    def __init__(self, paths):
        self.nodes = defaultdict(dict)
        for path in paths:
            for a, b in zip(path, path[1:]):
                # Join the coincident endpoints of consecutive N02 features.
                a = tuple(round(value, 4) for value in a[:2])
                b = tuple(round(value, 4) for value in b[:2])
                if a == b:
                    continue
                length = dist_km(a, b)
                self.nodes[a][b] = length
                self.nodes[b][a] = length
        self.snaps = {}

    def snap(self, point):
        key = tuple(point)
        if key not in self.snaps:
            best = min(self.nodes, key=lambda p: (p[0] - point[0]) ** 2 * .68 + (p[1] - point[1]) ** 2)
            self.snaps[key] = best if dist_km(point, best) < .55 else None
        return self.snaps[key]

    def route(self, a, b):
        a, b = self.snap(a), self.snap(b)
        if a is None or b is None or a == b:
            return []
        limit = dist_km(a, b) * 2.65 + .75
        distances, prev, heap = {a: 0}, {}, [(0, a)]
        while heap:
            length, current = heapq.heappop(heap)
            if current == b:
                path = [b]
                while path[-1] != a:
                    path.append(prev[path[-1]])
                return simplify(path[::-1], .00007)
            if length != distances[current]:
                continue
            for point, edge in self.nodes[current].items():
                distance = length + edge
                if distance <= limit and distance < distances.get(point, float('inf')):
                    distances[point], prev[point] = distance, current
                    heapq.heappush(heap, (distance, point))
        return []


def census_blocks(path):
    blocks = []
    title, rows = '', []
    for row in load_workbook(path, read_only=True, data_only=True).active.values:
        name = clean(row[0])
        measures = isinstance(row[15], (int, float)) and isinstance(row[18], (int, float))
        if measures and name and name not in {'合計', '計'}:
            rows.append((name, round(row[15] + row[18])))
        elif rows:
            if len(rows) > 1:
                blocks.append((title, rows))
            title, rows = name, []
        elif name and all(value is None or not str(value).strip() for value in row[1:]):
            title = name
    if len(rows) > 1:
        blocks.append((title, rows))
    return blocks


def match_line(title, rows, candidates, stops):
    target = line_key(title)
    sample = [station_key(name) for name, _ in rows]
    good = []
    for key in candidates:
        alias = line_key(key[1])
        share = sum(name in stops[key] for name in sample) / len(sample)
        named = target and (alias == target or (len(alias) >= 3 and target.endswith(alias)))
        if named and share >= .46:
            good.append((share + (alias == target) * .2, share, key))
    if not good:
        return None
    good.sort(reverse=True)
    if len(good) > 1 and abs(good[0][0] - good[1][0]) < .09 and good[0][1] < 1:
        return None
    return good[0][2]


def make_census(inputs):
    archive = inputs / 'N02-24.zip'
    positions = defaultdict(lambda: defaultdict(dict))
    axes = defaultdict(list)
    for item in zip_geojson(archive, 'Station.geojson'):
        row = item['properties']
        key = (row['N02_004'], row['N02_003'])
        point = midpoint(polylines(item['geometry']))
        for region, bounds in REGION_BOUNDS.items():
            if inside(point, bounds):
                positions[region][key][station_key(row['N02_005'])] = point
    used_keys = {key for stops in positions.values() for key in stops}
    for item in zip_geojson(archive, 'RailroadSection.geojson'):
        row = item['properties']
        key = (row['N02_004'], row['N02_003'])
        if key in used_keys:
            axes[key].extend(polylines(item['geometry']))
    graphs = {}
    output = []
    for region, stops in positions.items():
        candidates = [key for key in stops if axes[key]]
        blocks = census_blocks(inputs / f'census-{region}.xlsx')
        matched = connected = 0
        for title, rows in blocks:
            key = match_line(title, rows, candidates, stops)
            if not key:
                continue
            matched += 1
            operator, name = key
            rail_type = category(operator, name, '鉄道')
            if key not in graphs:
                graphs[key] = RailGraph(axes[key])
            for (first, flow), (second, _) in zip(rows, rows[1:]):
                a, b = stops[key].get(station_key(first)), stops[key].get(station_key(second))
                if not a or not b:
                    continue
                path = graphs[key].route(a, b)
                if path:
                    connected += 1
                    output.append({
                        'id': f'c{len(output)}', 'operator': operator, 'name': name, 'type': rail_type,
                        'from': first, 'to': second, 'km': round(sum(dist_km(x, y) for x, y in zip(path, path[1:])), 1),
                        'region': region, 'shape': [path], 'flow': flow,
                    })
        print(f'{region}: {matched}/{len(blocks)} census lines matched, {connected} station pairs mapped')
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('inputs', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    base = make_base(args.inputs)
    lines = make_lines(args.inputs)
    stations = make_stations(args.inputs)
    census = make_census(args.inputs)
    for name, data in [('map.json', base), ('lines.json', lines), ('stations.json', stations), ('census.json', census)]:
        save(args.output, name, data)
    print(f'{len(lines)} national segments, {sum(line["official"] for line in lines)} updated FY2024 records, {len(stations)} station records, {len(census)} census segments')


if __name__ == '__main__':
    main()
