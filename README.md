# Gator RSS Feed Aggregator

Gator is a command-line RSS feed aggregator built with TypeScript, Node.js, and PostgreSQL. It allows users to manage RSS feeds, follow feeds, and browse posts from their subscribed feeds.

## Features

- **User Management**: Register and login users
- **Feed Management**: Add, list, and follow RSS feeds
- **Post Aggregation**: Automatically scrape and store posts from RSS feeds
- **Browse Posts**: View recent posts from followed feeds
- **Scheduled Aggregation**: Run feed scraping on a schedule with customizable intervals

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **XML Parsing**: fast-xml-parser
- **Development**: tsx for TypeScript execution

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose (for PostgreSQL)
- npm or yarn

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd gator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   POSTGRES_IMAGE=postgres:15
   POSTGRES_CONTAINER_NAME=gator_postgres
   POSTGRES_USER=gator
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=gator
   POSTGRES_PORT=5432
   POSTGRES_VOLUME=gator_postgres_data
   DATABASE_URL=postgres://gator:your_password@localhost:5432/gator
   ```

4. **Start PostgreSQL with Docker**:
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**:
   ```bash
   npm run generate
   npm run migrate
   ```

## Usage

### Basic Commands

Run commands using:
```bash
npm run start <command> [arguments]
```

### User Management

**Register a new user**:
```bash
npm run start register <username>
```

**Login as a user**:
```bash
npm run start login <username>
```

**List all users**:
```bash
npm run start users
```

### Feed Management

**Add a new RSS feed** (requires login):
```bash
npm run start addfeed <feed_name> <feed_url>
```

**List all feeds**:
```bash
npm run start feeds
```

**Follow a feed** (requires login):
```bash
npm run start follow <feed_url>
```

**List feeds you're following** (requires login):
```bash
npm run start following
```

**Unfollow a feed** (requires login):
```bash
npm run start unfollow <feed_name>
```

### Post Management

**Browse recent posts** from a user's followed feeds:
```bash
npm run start browse <username> [limit]
```
- `limit` is optional, defaults to 2 posts

### Feed Aggregation

**Run feed aggregation on a schedule**:
```bash
npm run start agg <time_interval>
```

Time intervals can be specified as:
- `5s` - 5 seconds
- `1m` - 1 minute  
- `1h` - 1 hour
- `500ms` - 500 milliseconds

Example:
```bash
npm run start agg 30s
```

This will:
- Start collecting feeds immediately
- Continue collecting every 30 seconds
- Print status messages for each feed processed
- Run until interrupted with Ctrl+C

### Database Management

**Reset the database** (removes all data):
```bash
npm run start reset
```

## Example Workflow

1. **Register and login**:
   ```bash
   npm run start register alice
   npm run start login alice
   ```

2. **Add some RSS feeds**:
   ```bash
   npm run start addfeed "Tech Blog" "https://example.com/feed.xml"
   npm run start addfeed "News Site" "https://news.example.com/rss"
   ```

3. **Follow feeds**:
   ```bash
   npm run start follow "https://example.com/feed.xml"
   ```

4. **Start aggregation**:
   ```bash
   npm run start agg 1m
   ```

5. **Browse posts** (in another terminal):
   ```bash
   npm run start browse alice 5
   ```

## Project Structure

```
src/
├── commands/
│   └── commandRegistry.ts    # All command implementations
├── lib/
│   └── db/
│       ├── index.ts         # Database connection
│       ├── schema.ts        # Database schema definitions
│       └── queries/         # Database query functions
│           ├── users.ts
│           ├── feeds.ts
│           ├── follows.ts
│           └── posts.ts
├── middleware/
│   └── middleware.ts        # Authentication middleware
├── config.ts               # Configuration management
└── index.ts               # Application entry point
```

## Database Schema

The application uses four main tables:

- **users**: Store user accounts
- **feeds**: Store RSS feed information
- **feed_follows**: Track which users follow which feeds
- **posts**: Store individual posts from RSS feeds

## Development

**Start in development mode**:
```bash
npm run start
```

**Generate new migrations**:
```bash
npm run generate
```

**Apply migrations**:
```bash
npm run migrate
```

## Error Handling

The application includes comprehensive error handling for:
- Invalid RSS feeds
- Network errors during feed fetching
- Database connection issues
- Invalid command arguments
- Authentication requirements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License
