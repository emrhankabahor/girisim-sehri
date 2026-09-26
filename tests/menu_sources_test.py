import json, re, sys, unittest, tempfile, shutil
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
from build_menu_sources import ROOT, assemble

class MenuSources(unittest.TestCase):
    def test_generated_files_match_authoritative_sources(self):
        for file,text in assemble().items():
            with self.subTest(file=file): self.assertEqual((ROOT/file).read_text(),text)

    def test_all_routes_and_links_are_preserved_in_catalog(self):
        html=''.join(assemble()[f'content-{i}.html'] for i in range(1,7))
        ids=re.findall(r'<section\b[^>]*\bid="([^"]+)"[^>]*class="screen',html)
        catalog=json.loads((ROOT/'src/routes.json').read_text())
        self.assertEqual(ids,[x['id'] for x in catalog])
        self.assertEqual(len(ids),len(set(ids)))
        for route in catalog:
            source=(ROOT/route['source']).read_text()
            match=re.search(r'<!-- EOT_PART screen-'+re.escape(route['id'])+r' -->\n(.*?)\n<!-- EOT_END -->',source,re.S)
            self.assertIsNotNone(match,route['id'])
            self.assertEqual(route['links'],list(dict.fromkeys(re.findall(r'href="#([^"]+)"',match.group(1)))))

    def test_source_edit_reaches_only_its_runtime_bundle(self):
        original=assemble()
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            shutil.copytree(ROOT/'src',root/'src')
            file=root/'src/ana-sayfa/app.js'
            text=file.read_text()
            self.assertIn('function renderBusinessSummary(){',text)
            file.write_text(text.replace('function renderBusinessSummary(){','function renderBusinessSummary(){/* source edit probe */',1))
            changed=assemble(root)
            self.assertEqual([key for key in original if original[key]!=changed[key]],['app.js'])
            self.assertIn('/* source edit probe */',changed['app.js'])

    def test_menu_sources_exist(self):
        for name in ['ana-sayfa','pazar','isletmeler','finans','profil']:
            data=json.loads((ROOT/'src'/name/'menu.json').read_text())
            for item in data['children']:
                self.assertTrue((ROOT/item['source']).is_dir(),item)
                for child in item.get('children',[]): self.assertTrue((ROOT/child['source']).is_dir(),child)

if __name__=='__main__': unittest.main()
