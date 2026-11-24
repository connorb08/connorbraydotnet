#!/usr/bin/env nu

let registry = "065897469619.dkr.ecr.us-east-2.amazonaws.com"
let build_dir = ($env.FILE_PWD | path dirname)

# oras cp --from-oci-layout ./your-oci-folder:tag <registry>/<repo>:tag
# skopeo copy oci:./your-oci-folder docker://<registry>/<repo>:tag
# crane push ./your-oci-folder <registry>/<repo>:tag

skopeo copy oci:($build_dir | path join "build/mise-oci") $"docker-daemon:devenv:latest"
docker tag "devenv:latest" $"($registry)/devenv:latest"
docker push $"($registry)/devenv:latest"


# crane push ($build_dir | path join "build/mise-oci") $"($registry)/devenv:latest"
