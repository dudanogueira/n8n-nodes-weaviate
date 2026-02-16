# Weaviate Client Library Inspection Guide

This document explains how to inspect the weaviate-client library for future updates, new features, and changes to the API.

## Overview

The n8n-nodes-weaviate package depends on the official `weaviate-client` TypeScript library. This guide helps maintainers understand how to explore and integrate new features from upstream updates.

## Quick Reference

**Library Location**: `node_modules/weaviate-client/`
**Type Definitions**: `node_modules/weaviate-client/dist/node/esm/**/*.d.ts`
**Current Version**: Check `package.json` > `devDependencies.weaviate-client`

## Inspection Methodology

### 1. Finding Type Definitions

Type definitions are the source of truth for understanding the API:

```bash
# List all type definition files
find node_modules/weaviate-client/dist/node/esm -name "*.d.ts"

# Search for specific features
grep -r "generative" node_modules/weaviate-client/dist/node/esm/*.d.ts

# Find all collection methods
grep -r "export.*Collection" node_modules/weaviate-client/dist/node/esm/collections/*.d.ts
```

### 2. Understanding the Collection API Structure

The main API is accessed through collections:

```typescript
const collection = client.collections.get('MyCollection');

// Available namespaces:
collection.query.*      // Regular search operations
collection.generate.*   // Generative search operations
collection.data.*       // Data management
collection.aggregate.*  // Aggregation operations
```

**Key Files to Inspect**:
- `collections/query/types.d.ts` - Search operation types
- `collections/generate/types.d.ts` - Generative operation types
- `collections/types/generate.d.ts` - Generative return types

### 3. Discovering New Features

When a new weaviate-client version is released:

**Step 1: Check the Changelog**
- Visit: https://github.com/weaviate/typescript-client/releases
- Look for: New methods, deprecated features, breaking changes

**Step 2: Inspect Type Definitions**

```bash
# Example: Finding all generative model providers
grep -A 5 "GenerativeConfigRuntime" \
  node_modules/weaviate-client/dist/node/esm/collections/types/generate.d.ts

# Example: Finding new search methods
grep "^    [a-z].*(" \
  node_modules/weaviate-client/dist/node/esm/collections/query/index.d.ts
```

**Step 3: Examine Method Signatures**

Read the type definitions to understand:
- Required vs optional parameters
- Parameter types and constraints
- Return types
- Generic type parameters

### 4. Integrating New Features

**Example: Adding a New Search Operation**

1. **Find the signature**:
```typescript
// In collections/query/types.d.ts
nearText<T>(query: string | string[], opts?: NearTextOptions<T>): Promise<QueryReturn<T>>;
```

2. **Create operation file**: `operations/search/nearText.ts`

3. **Extract parameters**: Map TypeScript types to n8n INodeProperties

4. **Implement execute function**: Call the weaviate-client method

5. **Add to descriptions**: Update SearchDescription.ts

6. **Write tests**: Add to search.test.ts

### 5. Provider Configuration Discovery

**For Generative Models**:

```bash
# List all generative providers
grep "generative-" \
  node_modules/weaviate-client/dist/node/esm/collections/types/generate.d.ts | \
  grep "name:" | sort -u

# Inspect specific provider config
grep -A 30 "GenerativeOpenAIConfigRuntime" \
  node_modules/weaviate-client/dist/node/esm/collections/types/generate.d.ts
```

**Provider Config Pattern**:
Each provider has a config type like `GenerativeXXXConfigRuntime` with fields:
- `model?`: string - Model identifier
- `temperature?`: number - Randomness (0-2)
- `maxTokens?`: number - Max output length
- Provider-specific fields (baseURL, region, etc.)

### 6. Testing New Features

**Create test cases**:

```typescript
// Mock the new method
const mockNewMethod = jest.fn().mockResolvedValue({
  objects: [/* test data */]
});

// Test the operation
it('should perform new operation', async () => {
  const result = await newOperationExecute.call(executeFunctions, 0);
  expect(mockNewMethod).toHaveBeenCalledWith(/* expected params */);
  expect(result).toHaveLength(/* expected length */);
});
```

### 7. Common Inspection Commands

```bash
# List all collection methods
ls node_modules/weaviate-client/dist/node/esm/collections/*/

# Find parameter types
grep -r "Options.*=" node_modules/weaviate-client/dist/node/esm/collections/

# Search for specific functionality
grep -ri "rerank" node_modules/weaviate-client/dist/node/esm/

# Check for breaking changes in imports
grep "export.*from" node_modules/weaviate-client/dist/node/esm/index.d.ts
```

### 8. Version Compatibility

**Always check compatibility**:

1. **Weaviate Server Version**: Check minimum required server version
2. **Node.js Version**: Check engine requirements in package.json
3. **TypeScript Version**: Ensure type compatibility
4. **Breaking Changes**: Review migration guides

### 9. Documentation References

- **Official Docs**: https://weaviate.io/developers/weaviate
- **TypeScript Client**: https://github.com/weaviate/typescript-client
- **API Reference**: https://weaviate.io/developers/weaviate/api
- **Model Providers**: https://weaviate.io/developers/weaviate/model-providers

## Example: Discovering Generative Search (Historical)

This is how we discovered generative search features for this implementation:

### Step 1: Finding the Generate Namespace

```bash
# Search for generate-related files
find node_modules/weaviate-client -name "*generate*"
```

**Output:**
```
node_modules/weaviate-client/dist/node/esm/collections/generate/
node_modules/weaviate-client/dist/node/esm/collections/generate/index.d.ts
node_modules/weaviate-client/dist/node/esm/collections/types/generate.d.ts
```

### Step 2: Examining the Generate API

```bash
# View the generate method signatures
cat node_modules/weaviate-client/dist/node/esm/collections/generate/types.d.ts
```

**Found methods:**
- `nearText(query, generateOptions, queryOptions)`
- `nearVector(vector, generateOptions, queryOptions)`
- `nearObject(id, generateOptions, queryOptions)`
- `nearImage(image, generateOptions, queryOptions)`
- `nearMedia(media, mediaType, generateOptions, queryOptions)`
- `bm25(query, generateOptions, queryOptions)`
- `hybrid(query, generateOptions, queryOptions)`

### Step 3: Understanding Return Types

```bash
# Examine the GenerativeReturn type
grep -A 20 "interface GenerativeReturn" \
  node_modules/weaviate-client/dist/node/esm/collections/types/generate.d.ts
```

**Found structure:**
```typescript
interface GenerativeReturn<T> {
  objects: Array<{
    uuid: string;
    properties: T;
    generative?: {
      text?: string;  // Generated content
      metadata?: {    // Generation metadata
        model: string;
        tokens: number;
      };
    };
  }>;
}
```

### Step 4: Discovering All Providers

```bash
# List all provider configuration types
grep "Generative.*ConfigRuntime" \
  node_modules/weaviate-client/dist/node/esm/collections/types/generate.d.ts | \
  grep "interface" | cut -d' ' -f2
```

**Output (14 providers):**
1. GenerativeOpenAIConfigRuntime
2. GenerativeAzureOpenAIConfigRuntime
3. GenerativeAnthropicConfigRuntime
4. GenerativeCohereConfigRuntime
5. GenerativeGoogleConfigRuntime
6. GenerativeAWSConfigRuntime
7. GenerativeMistralConfigRuntime
8. GenerativeAnyscaleConfigRuntime
9. GenerativeOllamaConfigRuntime
10. GenerativeNVIDIAConfigRuntime
11. GenerativeDatabricksConfigRuntime
12. GenerativeFriendliAIConfigRuntime
13. GenerativeXAIConfigRuntime
14. GenerativeContextualAIConfigRuntime

### Step 5: Inspecting Provider Configurations

For each provider, we examined the configuration structure:

```bash
# Example: OpenAI configuration
grep -A 15 "interface GenerativeOpenAIConfigRuntime" \
  node_modules/weaviate-client/dist/node/esm/collections/types/generate.d.ts
```

**Found fields:**
```typescript
interface GenerativeOpenAIConfigRuntime {
  name: 'generative-openai';
  config?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    topP?: number;
    n?: number;
    stop?: string[];
  };
}
```

We repeated this process for all 14 providers to map their specific parameters.

### Step 6: Understanding GenerateOptions

```bash
# Examine the options structure
grep -A 20 "interface GenerateOptions" \
  node_modules/weaviate-client/dist/node/esm/collections/generate/types.d.ts
```

**Found structure:**
```typescript
interface GenerateOptions<T, V> {
  singlePrompt?: string;           // Per-result generation
  groupedTask?: string;            // Combined generation
  config?: GenerativeConfigRuntime; // Runtime model config
}
```

This revealed the two generation patterns:
- `singlePrompt`: Generate content for each individual result
- `groupedTask`: Generate content based on all results combined

### Step 7: Verifying API Method Signatures

```bash
# Check the exact method signature for nearText
grep -A 5 "nearText.*(" \
  node_modules/weaviate-client/dist/node/esm/collections/generate/types.d.ts
```

**Found signature:**
```typescript
nearText<T>(
  query: string | string[],
  generateOptions: GenerateOptions<T, any>,
  queryOptions?: QueryOptions<T>
): Promise<GenerativeReturn<T>>;
```

This confirmed the three-parameter structure:
1. Query (string or string array)
2. Generate options (singlePrompt, groupedTask, config)
3. Query options (limit, filters, etc.)

## Troubleshooting

### Issue: Types not found

**Solution:**
```bash
# Rebuild the library
cd node_modules/weaviate-client && npm run build

# Check installed version
cat node_modules/weaviate-client/package.json | grep version

# Reinstall if needed
npm install weaviate-client@latest
```

### Issue: Method signature changed

**Solution:**
1. Check the changelog for breaking changes
2. Search for migration guides in releases
3. Update parameter mappings in operation files
4. Update test expectations with new signatures

### Issue: New required fields

**Solution:**
1. Add to `INodeProperties` in descriptions
2. Add validation in execute functions
3. Update existing workflows (create migration guide)
4. Bump major version if breaking

### Issue: Provider configuration changed

**Solution:**
1. Re-inspect provider config type
2. Update `buildGenerativeConfig()` function
3. Update UI fields in SearchDescription.ts
4. Add tests for new configuration format

## Maintenance Checklist

When updating weaviate-client:

- [ ] Read changelog and release notes
- [ ] Check for breaking changes
- [ ] Run inspection commands to find API changes
- [ ] Update type imports if needed
- [ ] Test all existing operations
- [ ] Add tests for new features
- [ ] Update documentation (README, JSDoc)
- [ ] Update CHANGELOG.md
- [ ] Increment package version appropriately
- [ ] Test in n8n environment

## Contributing

When adding new features based on library updates:

### Document Your Discovery Process

1. **Source**: Where did you learn about the feature?
   - Changelog entry
   - GitHub issue
   - Official documentation
   - Community request

2. **Type Definitions**: Which files did you inspect?
   ```
   Example:
   - node_modules/weaviate-client/dist/node/esm/collections/query/types.d.ts
   - Lines 123-145: Method signature for newFeature()
   ```

3. **Method Signatures**: What are the exact signatures?
   ```typescript
   Example:
   newFeature<T>(
     param1: string,
     param2?: OptionsType
   ): Promise<ReturnType<T>>;
   ```

4. **Test Coverage**: What tests were added?
   ```
   Example:
   - 5 new tests in search.test.ts
   - Tests cover: basic usage, with options, error cases, edge cases, integration
   ```

### Update This Document

If you discover a better inspection method or useful command, add it to this document. Future maintainers will thank you!

## Advanced Techniques

### Using TypeScript Language Server

For deep exploration, use the TypeScript language server:

```bash
# Install globally if needed
npm install -g typescript

# Navigate to the library
cd node_modules/weaviate-client

# Use tsc to check types
npx tsc --noEmit --declaration
```

### Comparing Versions

To understand changes between versions:

```bash
# Install npm-check-updates
npm install -g npm-check-updates

# Check for updates
ncu weaviate-client

# View diff between versions
npm view weaviate-client@3.11.0 dist.tarball
npm view weaviate-client@3.12.0 dist.tarball
# Download and diff the tarballs
```

### Automated Discovery

Create a script to automatically discover new methods:

```javascript
// scripts/discover-api.js
const fs = require('fs');
const path = require('path');

const typesDir = 'node_modules/weaviate-client/dist/node/esm/collections';
const files = fs.readdirSync(typesDir, { recursive: true });

files
  .filter(f => f.endsWith('.d.ts'))
  .forEach(file => {
    const content = fs.readFileSync(path.join(typesDir, file), 'utf8');
    const methods = content.match(/\w+\s*<[^>]*>\([^)]*\):/g);
    if (methods) {
      console.log(`${file}:`);
      methods.forEach(m => console.log(`  - ${m}`));
    }
  });
```

Run with: `node scripts/discover-api.js`

## Summary

This guide provides a systematic approach to:
1. **Discover** new features in weaviate-client updates
2. **Understand** API signatures and types
3. **Integrate** new features into n8n-nodes-weaviate
4. **Test** implementations thoroughly
5. **Document** changes for future maintainers

By following this methodology, you can confidently keep this integration up-to-date with the latest Weaviate capabilities.

---

**Last Updated**: February 2026 (during generative search implementation)
**Weaviate Client Version**: 3.11.0
**Contributors**: Initial implementation team
