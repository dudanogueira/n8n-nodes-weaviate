# n8n-nodes-weaviate

This is an n8n community node for [Weaviate](https://weaviate.io/), the open-source vector database. It enables you to integrate Weaviate into your n8n workflows for building AI-powered applications with vector search, semantic search, and hybrid search capabilities.

Weaviate is an open-source vector database that stores both objects and vectors, allowing for combining vector search with structured filtering. It's perfect for building RAG applications, semantic search engines, recommendation systems, and more.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

- [Installation](#installation)
- [Operations](#operations)
- [Credentials](#credentials)
- [Usage](#usage)
- [Examples](#examples)
- [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1. Go to **Settings** > **Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-weaviate` in the **Enter npm package name** field
4. Select **Install**

## Operations

This node supports 18 operations across 4 resources:

### Collection (Schema Management)
- **Create**: Create a new collection with custom schema and vectorizer configuration
- **List**: List all collections in your Weaviate instance
- **Get**: Get details about a specific collection
- **Delete**: Delete a collection and all its data

### Object (Data Management)
- **Insert**: Insert a single object into a collection
- **Insert Many**: Batch insert multiple objects for better performance
- **Delete by ID**: Delete a specific object by its UUID
- **Delete Many**: Delete multiple objects using filter criteria

### Search (Query Operations)
- **BM25**: Keyword-based search using the BM25 algorithm
- **Near Text**: Semantic search using natural language queries
- **Near Vector**: Vector similarity search using custom embeddings
- **Hybrid**: Combined keyword + vector search with configurable weighting

### Backup (Backup Management)
- **Create**: Create a backup of your data
- **Restore**: Restore data from a backup
- **List**: List available backups
- **Get Create Status**: Check the status of a backup creation
- **Get Restore Status**: Check the status of a backup restoration

## Credentials

### Prerequisites

You need a Weaviate instance. You can either:

1. **Use Weaviate Cloud (WCD)**: Sign up at [console.weaviate.cloud](https://console.weaviate.cloud)
2. **Self-host**: Follow the [Weaviate installation guide](https://weaviate.io/developers/weaviate/installation)

### Setting up Credentials

1. In n8n, go to **Credentials** > **New**
2. Search for "Weaviate API"
3. Configure the following:

**Environment**:
- Select "Weaviate Cloud" for WCD instances
- Select "Self-Hosted" for your own deployment

**Cluster URL**:
- For WCD: `https://your-cluster-name.weaviate.network`
- For self-hosted: Your instance URL (e.g., `http://localhost:8080`)

**Authentication Method**:
- **API Key** (recommended for WCD): Your Weaviate API key
- **Username and Password**: For basic auth
- **Bearer Token**: For custom token authentication
- **None**: For unsecured local development instances

### Getting Your API Key (Weaviate Cloud)

1. Log in to [Weaviate Cloud Console](https://console.weaviate.cloud)
2. Select your cluster
3. Go to **Details** tab
4. Copy the **API Key**

## Usage

### Creating a Collection

Before inserting data, create a collection with a schema:

1. Select **Resource**: Collection
2. Select **Operation**: Create
3. **Collection Name**: Must start with uppercase (e.g., "Article")
4. **Vectorizer**: Choose your embedding provider or "None" for manual vectors
5. **Properties**: Define your schema in JSON format:

```json
[
  {
    "name": "title",
    "dataType": ["text"]
  },
  {
    "name": "content",
    "dataType": ["text"]
  },
  {
    "name": "author",
    "dataType": ["text"]
  }
]
```

### Inserting Objects

**Single Insert**:
```json
{
  "title": "Introduction to Vector Databases",
  "content": "Vector databases are specialized databases...",
  "author": "Jane Doe"
}
```

**Batch Insert** (recommended for multiple objects):
```json
[
  {
    "properties": {
      "title": "Article 1",
      "content": "Content here..."
    }
  },
  {
    "properties": {
      "title": "Article 2",
      "content": "More content..."
    }
  }
]
```

### Searching Data

**Near Text Search** (semantic):
- **Query Text**: "What are vector databases?"
- **Limit**: 10
- The vectorizer automatically converts your text to embeddings

**BM25 Search** (keyword):
- **Query**: "vector database introduction"
- **Limit**: 10
- Traditional keyword-based search

**Hybrid Search** (best of both):
- **Query**: "vector database"
- **Alpha**: 0.5 (0=keyword only, 1=vector only, 0.5=balanced)
- **Limit**: 10

### Using Filters

Add filters to search operations in **Additional Options** > **Where Filter**:

```json
{
  "path": ["author"],
  "operator": "Equal",
  "valueText": "Jane Doe"
}
```

**Complex filters**:
```json
{
  "operator": "And",
  "operands": [
    {
      "path": ["status"],
      "operator": "Equal",
      "valueText": "published"
    },
    {
      "path": ["views"],
      "operator": "GreaterThan",
      "valueInt": 1000
    }
  ]
}
```

## Examples

### Example 1: RAG Pipeline

1. **HTTP Request Node**: Fetch documents from API
2. **Code Node**: Process and chunk documents
3. **Weaviate Node** (Insert Many): Store chunks with embeddings
4. **Weaviate Node** (Near Text): Query for relevant chunks
5. **OpenAI Node**: Generate answer with retrieved context

### Example 2: Semantic Search Engine

1. **Webhook Node**: Receive search query
2. **Weaviate Node** (Hybrid Search): Search with alpha=0.7
3. **Code Node**: Format results
4. **Respond to Webhook**: Return search results

### Example 3: Data Migration

1. **Weaviate Node** (Create Collection): Set up target collection
2. **HTTP Request Node**: Fetch data from source
3. **Code Node**: Transform data to Weaviate format
4. **Weaviate Node** (Insert Many): Batch insert objects

### Example 4: Backup Automation

1. **Schedule Trigger**: Daily at 2 AM
2. **Weaviate Node** (Create Backup): Backup to S3
3. **Weaviate Node** (Get Create Status): Check completion
4. **Send Email Node**: Notify on success/failure

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Weaviate Documentation](https://weaviate.io/developers/weaviate)
- [Weaviate API Reference](https://weaviate.io/developers/weaviate/api/rest)
- [Weaviate Cloud](https://console.weaviate.cloud)
- [Weaviate GitHub](https://github.com/weaviate/weaviate)

## Compatibility

- Minimum n8n version: 1.0.0
- Compatible with Weaviate v1.24.0 and above
- Tested with Weaviate TypeScript client v3.11.0

## Development

To develop or modify this node:

```bash
# Clone the repository
git clone https://github.com/your-username/n8n-nodes-weaviate.git
cd n8n-nodes-weaviate

# Install dependencies
npm install

# Build the node
npm run build

# Lint the code
npm run lint

# Link for local development
npm link
```

## Support

For issues, questions, or contributions:
- Open an issue on [GitHub](https://github.com/your-username/n8n-nodes-weaviate/issues)
- Join the [n8n community](https://community.n8n.io/)
- Check [Weaviate community](https://forum.weaviate.io/)

## License

[MIT](LICENSE.md)

## Version History

### 0.1.0 (Initial Release)
- ✅ Collection management (create, list, get, delete)
- ✅ Object operations (insert, insert many, delete by ID, delete many)
- ✅ Search operations (BM25, Near Text, Near Vector, Hybrid)
- ✅ Backup operations (create, restore, status checks)
- ✅ Multi-tenancy support
- ✅ Advanced filtering
- ✅ Multiple authentication methods
