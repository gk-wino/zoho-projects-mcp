# Tags Quick Reference

## MCP Tools

### list_tags

List all tags or filter by name.

**Parameters:**

- `name` (optional): Filter tags by name

**Example:**

```json
// List all tags
{"name": "list_tags", "arguments": {}}

// Filter by name
{"name": "list_tags", "arguments": {"name": "API"}}
```

### delete_tag

Delete a tag by ID.

**Parameters:**

- `tag_id` (required): Tag ID to delete

**Example:**

```json
{ "name": "delete_tag", "arguments": { "tag_id": "1817452000001234567" } }
```

## cURL Examples

### List all tags

```bash
curl -X GET "https://projectsapi.zoho.com/api/v3/portal/{PORTAL_ID}/tags" \
  -H "Authorization: Zoho-oauthtoken {TOKEN}"
```

### Filter tags by name

```bash
curl -X GET "https://projectsapi.zoho.com/api/v3/portal/{PORTAL_ID}/tags?name=API" \
  -H "Authorization: Zoho-oauthtoken {TOKEN}"
```

### Delete a tag

```bash
curl -X DELETE "https://projectsapi.zoho.com/api/v3/portal/{PORTAL_ID}/tags/{TAG_ID}" \
  -H "Authorization: Zoho-oauthtoken {TOKEN}"
```

## Testing

```bash
# Basic tests
./test-tags.sh

# Comprehensive tests
./test-tags-comprehensive.sh

# MCP server tests
npx tsx test-tags-mcp.ts

# Demo
./demo-tags.sh
```

## Limitations

- ❌ Creating tags via API not supported
- ❌ Updating tags via API not supported
- ✅ Listing tags supported
- ✅ Filtering tags by name supported
- ✅ Deleting tags supported
