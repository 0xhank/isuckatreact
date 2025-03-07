# I Suck at React

An experiment that lets you generate React components with tool-enabled utility. 

## Project Structure

The project is organized into the following packages:

-   **packages/server**: Backend server that handles API integrations and business logic
-   **packages/client-react**: React-based frontend client

## Features

-   Google Calendar integration (create and find events)
-   Gmail integration (read emails, send emails, create drafts)
-   More integrations planned for future releases

## Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   pnpm

### Installation

1. Clone the repository:

    ```
    git clone https://github.com/0xhank/isuckatreact.git
    cd isuckatreact
    ```

2. Install dependencies:
    ```
    pnpm install
    ```
3. Set up environment variables:
   Create a `.env` file in the server package directory with 

### Running the Application

#### Everything

```
pnpm dev
```

#### Server

```
cd packages/server
pnpm dev
```

#### React Client

```
cd packages/client-react
pnpm dev
```



## Development

This project uses a monorepo structure to manage multiple packages. Each package can be developed and tested independently.

### Adding New Integrations

New tool integrations will be added to the `tools.ts` file in the server package.

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
