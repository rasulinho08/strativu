import base64,json,pathlib
d=pathlib.Path(__file__).parent; k=d.parent.parent
b=lambda p:base64.b64encode(pathlib.Path(p).read_bytes()).decode()
s=(d/'template40.html').read_text()
meta=json.loads(pathlib.Path('/tmp/claude-0/real/meta.json').read_text())
meta={kk:v for kk,v in meta.items() if isinstance(v,list)}
(d/'meta40.json').write_text(json.dumps(meta))
tl=json.loads((d/'timeline40.json').read_text())
keys=sorted({s[0] for s in tl['states']})
imgs='\n'.join(f'<img data-k="{kk}" alt="" src="data:image/jpeg;base64,{b(d/"shots"/(kk+".jpg"))}">' for kk in keys)
s=s.replace('__GEIST__',b(d/'geist-latin.woff2')).replace('__GEISTMONO__',b(d/'geist-mono-latin.woff2'))
s=s.replace('__LOGO_WHITE__',b(k/'logo/grc360-logo-on-dark.png')).replace('__SITE__','strativu.com')
s=s.replace('__IMGS__',imgs).replace('__TL__',json.dumps(tl)).replace('__META__',json.dumps(meta)).replace('__AUDIO__',b(d/'soundtrack40.mp3'))
(d.parent/'grc360-film-40s.html').write_text(s); print(len(s)//1024,'KB')
