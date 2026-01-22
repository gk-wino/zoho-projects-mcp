# Tags API Documentation

## Overview

The Tags API allows you to manage tags in Zoho Projects. Tags are labels that can be applied to various entities like tasks, issues, etc. to help organize and categorize project items.

## Available Operations

### 1. List Tags

List all tags available in a portal, with optional filtering by name.

**Tool Name:** `list_tags`

**Parameters:**

- `name` (optional): Filter tags by name. The API will return tags that match the provided name.

**Example:**

```json
{
	"name": "list_tags",
	"arguments": {}
}
```

**Example with filter:**

```json
{
	"name": "list_tags",
	"arguments": {
		"name": "API"
	}
}
```

**Response:**

```json
{
	"tags": [
		{
			"id": "1817452000000100154",
			"name": "API",
			"color_class": "bg-tag17",
			"created_by": {
				"id": "753398731",
				"zpuid": "1817452000000037003",
				"name": "user.name",
				"email": "user@example.com",
				"first_name": "User",
				"last_name": "Name",
				"full_name": "User Name"
			},
			"usage_count": 0,
			"color_hexcode": "#3b92ff"
		}
	]
}
```

### 2. Delete Tag

Delete a tag from the portal.

**Tool Name:** `delete_tag`

**Parameters:**

- `tag_id` (required): The ID of the tag to delete

**Example:**

```json
{
	"name": "delete_tag",
	"arguments": {
		"tag_id": "1817452000001789384"
	}
}
```

**Response:**

```json
{
	"success": true,
	"message": "Tag 1817452000001789384 deleted successfully"
}
```

## Testing

### Using cURL

#### List all tags:

```bash
curl -X GET "https://projectsapi.zoho.com/api/v3/portal/{PORTAL_ID}/tags" \
  -H "Authorization: Zoho-oauthtoken {ACCESS_TOKEN}"
```

#### Filter tags by name:

```bash
curl -X GET "https://projectsapi.zoho.com/api/v3/portal/{PORTAL_ID}/tags?name=API" \
  -H "Authorization: Zoho-oauthtoken {ACCESS_TOKEN}"
```

#### Delete a tag:

```bash
curl -X DELETE "https://projectsapi.zoho.com/api/v3/portal/{PORTAL_ID}/tags/{TAG_ID}" \
  -H "Authorization: Zoho-oauthtoken {ACCESS_TOKEN}"
```

### Using the MCP Test Script

Run the test script to verify the tags functionality:

```bash
./test-tags.sh
```

Or test through the MCP server:

```bash
npx tsx test-tags-mcp.ts
```

## API Endpoints

All tag endpoints are at the portal level:

- `GET /portal/{portal_id}/tags` - List all tags
- `GET /portal/{portal_id}/tags?name={query}` - Filter tags by name
- `DELETE /portal/{portal_id}/tags/{tag_id}` - Delete a tag

## Notes

1. **Portal-level Only**: Tags are managed at the portal level, not at the project level.

2. **No Create/Update**: The Zoho Projects API v3 currently does not support creating or updating tags via API. Tags can only be listed and deleted.

3. **Name Filter**: The name filter parameter performs a search across tag names. It may return multiple tags that contain the search term.

4. **Deletion**: When a tag is deleted, it will be removed from all entities (tasks, issues, etc.) where it was applied.

5. **Usage Count**: Each tag includes a `usage_count` field indicating how many times the tag has been used across the portal.

## Error Handling

The API may return the following errors:

- `400 Bad Request` - Invalid parameters or malformed request
- `401 Unauthorized` - Invalid or expired access token
- `404 Not Found` - Tag ID not found
- `500 Internal Server Error` - Server-side error

## Integration with MCP

The tags functionality is fully integrated with the Zoho Projects MCP server. You can use the `list_tags` and `delete_tag` tools through any MCP-compatible client (Claude Desktop, etc.).

## Limitations

Based on API testing, the following limitations apply:

1. Creating tags via API is not supported
2. Updating tag names or colors via API is not supported
3. Getting a specific tag by ID (without listing all) is not supported
4. Associating/disassociating tags with entities via API requires using the entity-specific endpoints (e.g., update task with tags)
