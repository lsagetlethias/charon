# Charon: Dynamic OAuth2 Routing Application

## Overview

Charon is an intermediary application that enables dynamic OAuth2 client applications to authenticate through various OIDC providers. Charon facilitates this process by preserving the flexibility to change callback URLs as needed. This is particularly useful for scenarios where the callback URLs of the OAuth2 clients are dynamically generated and the OIDC providers do not inherently support dynamic callback URLs.

## Features

- **Dynamic Client Support:** Charon accommodates dynamically generated OAuth2 clients with different callback URLs.

- **Provider Support:** Charon is designed to support different OIDC providers.

- **Secure:** Charon ensures that the client secret and the client ID are sent by the dynamic clients and not borne by the intermediary application.

- **Logout Handling:** Provides seamless logout process by integrating with OIDC providers' signout mechanisms and then redirecting users appropriately.


## Getting Started

1. A Docker image is available on Docker Hub: https://hub.docker.com/r/lsagetlethias/charon

2. Run the image

3. Open your browser and navigate to `http://localhost:4500/healthz` to check if Charon is running. (`4500` is the default port)

### Available env vars
- `CHARON_COOKIE_SECRET`: (**mandatory**) A unique key to encode cookies (`openssl rand -base64 32`)
- `CHARON_PUBLIC_HOST=http://localhost:4500`: The public host called by your client, port included if not 80.
- `CHARON_PORT=4500`: Port on which Charon is running
- `CHARON_HEALTHCHECK_PATH=/healthz`: Custom path for healthcheck
- `CHARON_HEALTHCHECK_SIMPLE=false`: If set to true, the healthcheck route will return 200 OK, otherwise detailed json

The `CHARON_VERSION` is used for the header `X-Charon-Version`. It should preferably not be overridden.

## OAuth configuration
When using Charon, you need to configure your OAuth client to use Charon as the OAuth provider. Depending on which "original provider" Charon has to forward request to, you need to set change the issuer to: `https://<charonurl>/<provider>`. For example, if you want to use Charon to authenticate with Github, and Charon is deployed on `https://charon.example.com`, you need to set the issuer to `https://charon.example.com/github`.

.well-known openid configuration is recommended (easier to set up), and is available at `https://<charonurl>/<provider>/.well-known/openid-configuration` if the original provider supports it. For example, `https://charon.example.com/moncompteprotest/.well-known/openid-configuration`.

To configure the callback URL, you simply need to set it to `https://<charonurl>/oauth/callback`. For example, `https://charon.example.com/oauth/callback`.

## Client Configuration
### Env based
Up to 10 clients (from 0 to 9) can be configured using env vars. For each client, the following env vars are required:
- `CHARON_CLIENT_<number>_WILDCARDS`: comma separated list of host with or without wildcard that Charon will let forward to associated OAuth provider. Example: `https://*.example.com,http://localhost:3000`
- `CHARON_CLIENT_<number>_PROVIDER`: OIDC provider name. Example: `github`

For now, a provider should be configured one time only. (You can't have two clients configuration with the same provider)

## Available OIDC providers
- [`github`](https://github.com)
- [`moncomptepro`](https://moncomptepro.beta.gouv.fr/) (and `moncompteprotest` for testing)

## Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/lsagetlethias/charon/issues).

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Please feel free to contact us for any questions, suggestions, or concerns.
