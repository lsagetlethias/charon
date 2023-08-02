# Charon: Dynamic OAuth2 Routing Application

## Overview

Charon is an intermediary application that enables dynamic OAuth2 client applications to authenticate through various OIDC providers. Charon facilitates this process by preserving the flexibility to change callback URLs as needed. This is particularly useful for scenarios where the callback URLs of the OAuth2 clients are dynamically generated and the OIDC providers do not inherently support dynamic callback URLs.

## Features

- **Dynamic Client Support:** Charon accommodates dynamically generated OAuth2 clients with different callback URLs.

- **Provider Support:** Charon is designed to support different OIDC providers.

- **Secure:** Charon ensures that the client secret and the client ID are sent by the dynamic clients and not borne by the intermediary application.

- **Logout Handling:** Provides seamless logout process by integrating with OIDC providers' signout mechanisms and then redirecting users appropriately.


## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed [Node.js](https://nodejs.org/) and [yarn](https://yarnpkg.com/) (or [npm](https://www.npmjs.com/)).

- You have a basic understanding of TypeScript and OAuth2.

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/lsagetlethias/charon.git
    ```

2. Install the dependencies:

    ```bash
    cd charon
    yarn
    ```

### Usage

1. Run the server:

    ```bash
    npm start
    ```

2. Open your browser and navigate to `http://localhost:4500`.

Please note, you'll need to configure the application to work with your specific OAuth2 clients and OIDC providers.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/lsagetlethias/charon/issues).

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Please feel free to contact us for any questions, suggestions, or concerns.
