#!/bin/bash

# Zoho Projects Tags API - Quick Demonstration
# This script demonstrates the tags functionality with real API calls

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Zoho Projects Tags API - Quick Demo                 ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

PORTAL_ID="753397720"
ACCESS_TOKEN="1000.fa1dc56a7d133f55be44004c1214a29e.9d121bb47f909a7dcbb2bb7d0df044bd"
PROJECT_ID="1817452000005334019"

echo "📋 Demo 1: List first 5 tags"
echo "────────────────────────────────────────────────────────"
curl -s -X GET "https://projectsapi.zoho.com/api/v3/portal/$PORTAL_ID/tags" \
  -H "Authorization: Zoho-oauthtoken $ACCESS_TOKEN" | \
  jq '.tags[:5] | .[] | {name: .name, id: .id, color: .color_hexcode, usage: .usage_count}'
echo ""

echo "🔍 Demo 2: Search for tags containing 'API'"
echo "────────────────────────────────────────────────────────"
curl -s -X GET "https://projectsapi.zoho.com/api/v3/portal/$PORTAL_ID/tags?name=API" \
  -H "Authorization: Zoho-oauthtoken $ACCESS_TOKEN" | \
  jq '.tags[:3] | .[] | {name: .name, id: .id}'
echo ""

echo "🔍 Demo 3: Search for tags containing 'Backend'"
echo "────────────────────────────────────────────────────────"
curl -s -X GET "https://projectsapi.zoho.com/api/v3/portal/$PORTAL_ID/tags?name=Backend" \
  -H "Authorization: Zoho-oauthtoken $ACCESS_TOKEN" | \
  jq '.tags[:3] | .[] | {name: .name, id: .id}'
echo ""

echo "📊 Demo 4: Tag Statistics"
echo "────────────────────────────────────────────────────────"
RESULT=$(curl -s -X GET "https://projectsapi.zoho.com/api/v3/portal/$PORTAL_ID/tags" \
  -H "Authorization: Zoho-oauthtoken $ACCESS_TOKEN")

TOTAL_TAGS=$(echo "$RESULT" | jq '.tags | length')
USED_TAGS=$(echo "$RESULT" | jq '[.tags[] | select(.usage_count > 0)] | length')
UNUSED_TAGS=$(echo "$RESULT" | jq '[.tags[] | select(.usage_count == 0)] | length')

echo "Total Tags: $TOTAL_TAGS"
echo "Used Tags: $USED_TAGS"
echo "Unused Tags: $UNUSED_TAGS"
echo ""

echo "🎨 Demo 5: Tags by Color"
echo "────────────────────────────────────────────────────────"
curl -s -X GET "https://projectsapi.zoho.com/api/v3/portal/$PORTAL_ID/tags" \
  -H "Authorization: Zoho-oauthtoken $ACCESS_TOKEN" | \
  jq '[.tags[] | .color_hexcode] | group_by(.) | map({color: .[0], count: length}) | sort_by(.count) | reverse | .[:5]'
echo ""

echo "✅ Demo Complete!"
echo ""
echo "Available MCP Tools:"
echo "  • list_tags - List/search tags"
echo "  • delete_tag - Delete a tag"
echo ""
