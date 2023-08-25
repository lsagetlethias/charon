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

## Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/lsagetlethias/charon/issues).

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Please feel free to contact us for any questions, suggestions, or concerns.
