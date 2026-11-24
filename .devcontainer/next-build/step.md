=> [final generator 1/2] RUN mise oci build --from scratch --output /build/mise-oci 114.5s
=> [final] exporting to client directory 53.5s
=> => copying files 1.26GB 53.5s
=> ERROR [tool-builder] exporting to oci image format 66.0s
=> => exporting layers 58.4s
=> => exporting manifest sha256:3a5a942821597b832fc8101bfc61db1f978e11a67e5cb6f197b47ef5aa3880b1 0.0s
=> => exporting config sha256:b6e5c20774aa89f717ac1920269df176770774ef6a4a11055ff11dd18ffe40cf 0.0s
------

> exporting config sha256:b6e5c20774aa89f717ac1920269df176770774ef6a4a11055ff11dd18ffe40cf 0.0s

---

> [tool-builder] exporting to oci image format:

---

ERROR: (*service).Write failed: rpc error: code = Unknown desc = write build/tool-builder-oci/ingest/4ee32cd9d9792e0cb92cd6e5aa75e43287682fdba338d64dc475cd3e9009027e/data: no space left on device
ERROR: (*service).Write failed: rpc error: code = Canceled desc = context canceled
ERROR: (*service).Write failed: rpc error: code = Canceled desc = context canceled
ERROR: (*service).Write failed: rpc error: code = Canceled desc = context canceled
ERROR: (*service).Write failed: rpc error: code = Canceled desc = context canceled
ERROR: target tool-builder: failed to solve: failed to copy: failed to send write: rpc error: code = Unknown desc = write build/tool-builder-oci/ingest/4ee32cd9d9792e0cb92cd6e5aa75e43287682fdba338d64dc475cd3e9009027e/data: no space left on device
ocie build: docker [tool-builder final]: exit status 1
