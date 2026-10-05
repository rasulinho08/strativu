import base64,pathlib
d=pathlib.Path(__file__).parent; k=d.parent.parent
b=lambda p:base64.b64encode(pathlib.Path(p).read_bytes()).decode()
s=(d/'template.html').read_text()
s=s.replace('__GEIST__',b(d/'geist-latin.woff2')).replace('__GEISTMONO__',b(d/'geist-mono-latin.woff2'))
s=s.replace('__LOGO_WHITE__',b(k/'logo/grc360-logo-on-dark.png')).replace('__LOGO__',b(k/'logo/grc360-logo.png')).replace('__SITE__','strativu.com')
(d.parent/'grc360-film.html').write_text(s); print(len(s)//1024,'KB')
