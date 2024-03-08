## Runescape Service Ticket Bot

**A Discord bot managing Runescape service requests with a focus on clear communication, secure transactions, and automated workflows.**

**Features:**

* User-generated tickets for requesting Runescape services.
* Worker claim system for assigning work to designated helpers.
* Secure in-ticket communication channels for confidential information exchange.
* Worker progress updates and completion commands to track service status.
* Admin approval process to ensure service satisfaction before finalization.
* Automated fee collection upon successful service completion for server upkeep.

**Getting Started (Prerequisites: Node.js v15.14.0 or higher, `pnpm` package manager recommended)**

1. Clone the repository.
2. Install dependencies: `pnpm install`
3. Configure bot token and server details in the `.env` file.
4. **Development:** Run the bot in watch mode: `pnpm dev`
5. **Production:**
    * Build the Docker image: `pnpm build && docker build -t runescape-service-bot .`
    * Run the container: `docker run runescape-service-bot`

**Development Workflow**

* Code edits trigger automatic linting and type checking for improved code quality.
* `pnpm dev` provides a seamless development experience with hot reloading.

**Customization**

This is a foundational project. You can tailor it to your specific needs by customizing aspects like:

* Service categories offered
* Worker roles and permissions
* Fee structure for different services
* Additional commands to enhance functionality

**Contribution**

We welcome pull requests and suggestions to make this bot even better!

**Technical Details**

* Built with Typescript for strong typing and a maintainable codebase.
* Leverages libraries like `discord.js`, `discordx`, and `prisma` for efficient Discord bot development and database interactions.
* Includes automated linting and type checking for improved code quality.
* Supports deployment using Docker containers for easy scaling and distribution.
