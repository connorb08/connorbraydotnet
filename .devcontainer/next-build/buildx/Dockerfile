# syntax=docker/dockerfile:1

FROM tool-base AS generator

# ARG BASE_IMAGE_FQDN
# ARG PUSH_IMAGE_FQDN

ENV SOURCE_DATE_EPOCH=0

RUN mise oci build \
    --from scratch \
    --output /build/mise-oci

FROM scratch

COPY --link --from=generator /build/mise-oci /
