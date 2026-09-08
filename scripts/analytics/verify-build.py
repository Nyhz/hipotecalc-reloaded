"""Check generated HTML, metadata, structured data, assets and download contents.

Run after npm run build. Standard-library only; does not contact third parties.
This is a structural/consistency checker, not a guarantee of search rich results.
"""
import csv
import datetime as dt
import io
import json
import pathlib
import struct
import urllib.parse
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[2]
DIST = ROOT / 'dist'
SITE = 'https://www.hipotecalc.com'
DATA = json.loads((ROOT / 'src/data/analytics/2026-09-07-v1.json').read_text())


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags, self.scripts, self.texts = [], [], []
        self.script = None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if tag == 'script':
            self.script = '' if attrs.get('type') == 'application/ld+json' else False

    def handle_data(self, text):
        if isinstance(self.script, str):
            self.script += text
        elif self.script is None:
            self.texts.append(text)

    def handle_endtag(self, tag):
        if tag == 'script':
            if isinstance(self.script, str):
                self.scripts.append(json.loads(self.script))
            self.script = None

    def meta(self, name):
        return next(a['content'] for t, a in self.tags if t == 'meta' and (a.get('name') == name or a.get('property') == name))

    def links(self, rel):
        return [a for t, a in self.tags if t == 'link' and a.get('rel') == rel]


def exists(path):
    target = DIST / urllib.parse.unquote(path).lstrip('/')
    return target.is_file() or (target / 'index.html').is_file()


files = sorted(list((DIST / 'analytics').rglob('index.html')) + list((DIST / 'en/analytics').rglob('index.html')))
assert len(files) == 40, len(files)
documents = {}
for file in files:
    url = SITE + '/' + str(file.parent.relative_to(DIST))
    documents[url] = Page(file.read_text())

ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
listed = {}
for file in DIST.glob('sitemap-*.xml'):
    for node in ET.parse(file).getroot().findall('s:url', ns):
        listed[node.findtext('s:loc', namespaces=ns)] = node.findtext('s:lastmod', namespaces=ns)
assert not any('/analytics/' in url and '.csv' in url for url in listed)
titles, datasets, reports, link_checks = set(), 0, 0, 0
for url, page in documents.items():
    visible_text=' '.join(page.texts)
    assert 'Mayor cociente' not in visible_text and 'Highest ratio' not in visible_text, ('archive cards',url)
    if url in [SITE+'/analytics/indice-esfuerzo-compra',SITE+'/en/analytics/house-price-to-income']:
        assert 'Precios más recientes, sin estimación de esfuerzo' not in visible_text
        assert 'More recent prices, without an effort estimate' not in visible_text
        assert any(t=='th' and a.get('class')=='an-col-municipality' for t,a in page.tags)
        assert len([a for t,a in page.tags if t=='button' and a.get('class')=='an-sort-button']) == 6
        assert len([a for t,a in page.tags if t=='th' and a.get('aria-sort')=='ascending']) == 1
    assert len([t for t,a in page.tags if t == 'h1']) == 1, url
    assert page.links('canonical') == [{'rel':'canonical','href':url}], url
    assert url in listed and listed[url], ('sitemap',url)
    assert listed[url][:10] <= dt.datetime.now(dt.timezone.utc).date().isoformat()
    alternates = {a['hreflang']:a['href'] for a in page.links('alternate') if 'hreflang' in a}
    for lang in ['es','en']:
        other = documents[alternates[lang]]
        assert any(a.get('href') == url for a in other.links('alternate')), ('hreflang',url)
    assert 'Equipo Hipotecalc' in ' '.join(page.texts), ('byline',url)
    assert page.meta('og:title') not in titles, ('duplicate title',url)
    titles.add(page.meta('og:title'))
    assert page.meta('description')
    image = DIST / urllib.parse.urlsplit(page.meta('og:image')).path.lstrip('/')
    width,height = struct.unpack('>II',image.read_bytes()[16:24])
    assert (width,height) == (int(page.meta('og:image:width')),int(page.meta('og:image:height'))) == (1200,630)
    assert page.meta('og:image:type') == 'image/png'
    assert '80 m²' in page.meta('og:image:alt')
    nodes=[]
    for script in page.scripts:
        nodes.extend(script.get('@graph',[script]))
    orgs=[n for n in nodes if n.get('@id') == SITE+'/#organization' and n.get('@type') == 'Organization']
    assert len(orgs) == 1, ('organization definitions',url)
    for node in nodes:
        if node.get('@type') in ['Dataset','Article']:
            assert node['datePublished'] == DATA['publishedAt']
            assert node['dateModified'] == DATA['modifiedAt']
            assert node['publisher'] == {'@id':SITE+'/#organization'}
        if node.get('@type') == 'Article':
            assert node['author'] == {'@id':SITE+'/#organization'}
            assert 'reviewedBy' not in node
            assert page.meta('og:type') == 'article'
        if node.get('@type') == 'Dataset':
            datasets+=1
            for field in ['name','description','creator','temporalCoverage','spatialCoverage','distribution','variableMeasured','measurementTechnique','isBasedOn']:
                assert node.get(field), (field,url)
            assert exists(urllib.parse.urlsplit(node['distribution']['contentUrl']).path)
    if '/informes/20' in url or '/reports/20' in url:
        reports+=1
        assert len([a for t,a in page.tags if t=='button' and a.get('class')=='an-sort-button']) == 5
        assert len([a for t,a in page.tags if t=='th' and a.get('aria-sort')=='ascending']) == 1
        assert any(t=='th' and a.get('class')=='an-col-municipality' for t,a in page.tags), ('municipality heading',url)
        assert any(n.get('@type')=='Dataset' for n in nodes)
        assert any(n.get('@type')=='Article' for n in nodes)
        assert any('retrospectiv' in text.lower() for text in page.texts)
        assert len([a for t,a in page.tags if t=='th' and a.get('scope')=='row']) == 100
    for tag, attrs in page.tags:
        if tag=='img':
            assert attrs.get('alt') and attrs.get('width') and attrs.get('height')
        for attr in (['href'] if tag=='a' else ['src'] if tag=='img' else []):
            dest=urllib.parse.urlsplit(attrs.get(attr,''))
            if dest.netloc in ['', 'www.hipotecalc.com'] and dest.path.startswith('/'):
                assert exists(dest.path), ('broken link',url,dest.path)
                link_checks+=1
        if tag=='source' and 'srcset' in attrs:
            for item in attrs['srcset'].split(','):
                assert exists(item.strip().split()[0])
    if '/en/' in url:
        text=' '.join(page.texts)
        for old in ['Contacta con nuestro broker','Mejorar esta cuota','Descargar resultados','Ver los datos']:
            assert old not in text, (old,url)

downloads=list((DIST/'analytics/datos').rglob('*.csv'))
assert len(downloads)==28
for file in downloads:
    rows=list(csv.reader(io.StringIO(file.read_text(encoding='utf-8-sig'))))
    assert len(rows)==(1301 if file.stem=='all' else 101)
    assert all(len(row)==len(rows[0]) for row in rows)
    assert all(row[7]==DATA['version'] for row in rows[1:])
    assert all(row[10]=='Equipo Hipotecalc' for row in rows[1:])
    assert all('https://www.ine.es/' in row[12] for row in rows[1:])
assert reports==26 and datasets==28
for svg in (DIST/'img/analytics').rglob('*.svg'):
    text=svg.read_text().lower()
    assert all(old not in text for old in ['reconstrucción retrospectiva','retrospective reconstruction','corte de datos','data cutoff'])
print(f'PASS: {len(files)} HTML pages; {reports} retrospective reports; {datasets} datasets; {len(downloads)} CSVs; {link_checks} internal link checks.')
print('PASS: canonical, reciprocal hreflang, sitemap dates, SSR rankings, authorship, JSON-LD consistency, image metadata, responsive assets and English CTAs.')
