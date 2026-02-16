# n8n-nodes-weaviate

[![npm version](https://img.shields.io/npm/v/n8n-nodes-weaviate.svg)](https://www.npmjs.com/package/n8n-nodes-weaviate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![n8n](https://img.shields.io/badge/n8n-Community%20Node-FF6D5A.svg)](https://n8n.io)

This is an n8n community node for [Weaviate](https://weaviate.io/), the open-source vector database. It enables you to integrate Weaviate into your n8n workflows for building AI-powered applications with vector search, semantic search, and hybrid search capabilities.

Weaviate is an open-source vector database that stores both objects and vectors, allowing for combining vector search with structured filtering. It's perfect for building RAG applications, semantic search engines, recommendation systems, and more.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Operations](#operations)
- [Credentials](#credentials)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Creating a Collection](#creating-a-collection)
  - [Inserting Objects](#inserting-objects)
  - [Searching Data](#searching-data)
  - [Using Filters](#using-filters)
  - [Advanced Search Options](#advanced-search-options)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)
- [Compatibility](#compatibility)
- [Development](#development)
- [Version History](#version-history)

## Features

✨ **Complete Weaviate Integration**
- Full CRUD operations for collections and objects
- All search types: semantic, keyword, hybrid, image, and vector
- Multi-tenancy support for SaaS applications
- Backup and restore operations

🔍 **Advanced Search Capabilities**
- **Semantic Search**: Natural language queries with Near Text
- **Image Search**: Find similar images with Near Image
- **Keyword Search**: Traditional BM25 full-text search
- **Hybrid Search**: Combine semantic and keyword with alpha weighting
- **Vector Search**: Custom embeddings with Near Vector
- **Similarity Search**: Find similar objects with Near Object

🎯 **Powerful Filtering & Control**
- Complex filter expressions with AND/OR operators
- Distance and certainty thresholds for quality control
- Pagination with limit and offset
- Autocut for dynamic result limiting
- Property selection to optimize data transfer

🏢 **Enterprise Features**
- Multi-tenancy with tenant isolation
- Named vectors for multi-modal collections
- Batch operations for high performance
- Backup and restore to FileSystem, S3-compatible storage or GCP
- Reranking for improved relevance

🔐 **Flexible Authentication**
- API Key authentication (recommended)
- Bearer token support
- Username/password basic auth
- Anonymous access for development

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1. Go to **Settings** > **Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-weaviate` in the **Enter npm package name** field
4. Select **Install**

## Operations

This node supports 24 operations across 5 resources:

### Collection (Schema Management)
- **Create**: Create a new collection with custom schema and vectorizer configuration
- **List**: List all collections in your Weaviate instance
- **Get**: Get details about a specific collection
- **Delete**: Delete a collection and all its data
- **Exists**: Check if a collection exists

### Object (Data Management)
- **Insert**: Insert a single object into a collection
- **Insert Many**: Batch insert multiple objects for better performance
- **Delete by ID**: Delete a specific object by its UUID
- **Delete Many**: Delete multiple objects using filter criteria

### Search (Query Operations)
- **BM25**: Keyword-based search using the BM25 algorithm
- **Near Text**: Semantic search using natural language queries
- **Near Vector**: Vector similarity search using custom embeddings
- **Near Object**: Find similar objects to an existing object by its UUID
- **Near Image**: Find similar objects using image similarity search
- **Hybrid**: Combined keyword + vector search with configurable weighting

### Backup (Backup Management)
- **Create**: Create a backup of your data
- **Restore**: Restore data from a backup
- **List**: List available backups
- **Get Create Status**: Check the status of a backup creation
- **Get Restore Status**: Check the status of a backup restoration

### Tenant (Multi-Tenancy Management)
- **Create**: Create one or more tenants in a collection
- **Delete**: Delete one or more tenants
- **List**: List all tenants in a collection
- **Update Status**: Update tenant status (hot, cold, frozen)
- **Exists**: Check if a tenant exists

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

## Quick Start

Get started with Weaviate in 5 minutes:

1. **Install the node** in your n8n instance (Settings > Community Nodes)
2. **Set up credentials** with your Weaviate instance URL and API key
3. **Create a collection** to define your data structure
4. **Insert data** using the Insert or Insert Many operations
5. **Search your data** using Near Text, BM25, or Hybrid search

### Simple Workflow Example

```
Webhook (trigger)
  ↓
Weaviate (Near Text search)
  ↓
Code (format results)
  ↓
Respond to Webhook
```

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

**Near Image Search** (image similarity):
- **Image Data**: Base64 encoded image string
- **Limit**: 10
- Find objects similar to the provided image
- Supports data URI format: `data:image/png;base64,iVBORw0KGgo...` or plain base64

**Near Vector Search** (custom embeddings):
- **Query Vector**: `[0.1, 0.2, 0.3, ...]`
- **Limit**: 10
- Use your own pre-computed vector embeddings

**Near Object Search** (find similar objects):
- **Object ID**: UUID of an existing object
- **Limit**: 10
- Find objects similar to a specific object in your collection

**BM25 Search** (keyword):
- **Query**: "vector database introduction"
- **Limit**: 10
- Traditional keyword-based search

**Hybrid Search** (best of both):
- **Query**: "vector database"
- **Alpha**: 0.5 (0=keyword only, 1=vector only, 0.5=balanced)
- **Limit**: 10

### Using Filters

Add filters to search operations in **Additional Options** > **Filters**:

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

### Advanced Search Options

All search operations support these additional options:

**Result Control**:
- **Limit**: Maximum number of results (default: 10)
- **Offset**: Skip first N results for pagination
- **Autocut**: Dynamic result limiting based on quality scores

**Filtering & Thresholds**:
- **Certainty**: Minimum certainty threshold (0-1) for vector searches
- **Distance**: Maximum distance threshold for vector searches
- **Filters**: JSON filter criteria to refine results

**Return Options**:
- **Return Properties**: Comma-separated list of properties to return
- **Include Vector**: Include vector embeddings in results
- **Return Distance**: Include distance metric in results
- **Return Creation Time**: Include object creation timestamp

**Advanced Features**:
- **Target Vector**: Specify named vector for multi-vector collections
- **Tenant**: Specify tenant for multi-tenant collections
- **Rerank**: Apply reranking to improve result quality
- **Move Towards/Away** (Near Text only): Adjust search direction

**Hybrid Search Specific**:
- **Alpha**: Balance between keyword (0.0) and vector (1.0) search
- **Return Score**: Include BM25/hybrid scores in results
- **Return Explain Score**: Include score explanation

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

### Example 4: Image Similarity Search

1. **HTTP Request Node**: Receive image from user upload
2. **Code Node**: Convert image to base64
3. **Weaviate Node** (Near Image): Find similar images
4. **Code Node**: Format and rank results
5. **Respond to Webhook**: Return similar images

### Example 5: Multi-Tenant Application

1. **Weaviate Node** (Create Collection): Create multi-tenant collection
2. **Weaviate Node** (Create Tenant): Create tenant for each customer
3. **Weaviate Node** (Insert Many): Add tenant-specific data
4. **Weaviate Node** (Near Text): Query with tenant parameter
5. **Code Node**: Return tenant-isolated results

### Example 6: Backup Automation

1. **Schedule Trigger**: Daily at 2 AM
2. **Weaviate Node** (Create Backup): Backup to S3
3. **Weaviate Node** (Get Create Status): Check completion
4. **Send Email Node**: Notify on success/failure

## Troubleshooting

Coming soon...

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
git clone https://github.com/dudanogueira/n8n-nodes-weaviate.git
cd n8n-nodes-weaviate

# Install dependencies
npm install

# Build the node
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint the code
npm run lint

# Fix linting issues
npm run lint:fix

# Link for local development
npm link
```

### Testing

This project includes comprehensive test coverage:

- **173 tests** covering all operations and edge cases
- Unit tests for all search operations (Near Text, Near Vector, Near Object, Near Image, BM25, Hybrid)
- Tests for collection, object, backup, and tenant operations
- Filter validation and JSON parsing tests
- Mock-based testing for isolated unit tests

Run tests before submitting pull requests:
```bash
npm test
```

## Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs
- Use the GitHub issue tracker
- Include your n8n version, Weaviate version, and node version
- Provide steps to reproduce the issue
- Include error messages and logs

### Suggesting Features
- Open a GitHub issue with the "enhancement" label
- Describe the use case and expected behavior
- Explain how it would benefit other users

### Submitting Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Lint your code: `npm run lint:fix`
7. Commit with clear messages: `git commit -m 'Add amazing feature'`
8. Push to your fork: `git push origin feature/amazing-feature`
9. Open a pull request

### Development Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation (README, JSDoc comments)
- Keep commits atomic and well-described
- Ensure backward compatibility when possible

## Support

For issues, questions, or contributions:
- Open an issue on [GitHub](https://github.com/dudanogueira/n8n-nodes-weaviate/issues)
- Join the [n8n community](https://community.n8n.io/)
- Check [Weaviate community](https://forum.weaviate.io/)
- Visit [Weaviate Slack](https://weaviate.io/slack)

## License

[MIT](LICENSE.md)

## Version History

### 0.1.0 (Initial Release)

**Collection Management**
- ✅ Create collections with custom schemas
- ✅ List all collections
- ✅ Get collection details
- ✅ Delete collections
- ✅ Check collection existence

**Object Operations**
- ✅ Insert single object
- ✅ Batch insert multiple objects
- ✅ Delete object by UUID
- ✅ Delete multiple objects with filters

**Search Operations**
- ✅ BM25 keyword search
- ✅ Near Text semantic search
- ✅ Near Vector similarity search
- ✅ Near Object similarity search
- ✅ Near Image similarity search
- ✅ Hybrid search (keyword + vector)

**Advanced Search Features**
- ✅ Complex filtering with AND/OR operators
- ✅ Certainty and distance thresholds
- ✅ Pagination (limit, offset)
- ✅ Autocut for dynamic limiting
- ✅ Property selection
- ✅ Vector inclusion in results
- ✅ Metadata returns (distance, creation time, scores)
- ✅ Named vectors support
- ✅ Move towards/away (Near Text)
- ✅ Reranking support

**Backup Operations**
- ✅ Create backups to S3-compatible storage
- ✅ Restore from backups
- ✅ List available backups
- ✅ Check backup creation status
- ✅ Check restore status

**Multi-Tenancy**
- ✅ Create tenants
- ✅ Delete tenants
- ✅ List tenants
- ✅ Update tenant status (hot/cold/frozen)
- ✅ Check tenant existence
- ✅ Tenant-scoped searches

**Other Features**
- ✅ Multiple authentication methods (API Key, Bearer, Basic Auth)
- ✅ Weaviate Cloud and self-hosted support
- ✅ Comprehensive test suite (173 tests)
- ✅ TypeScript support
- ✅ Detailed error handling
