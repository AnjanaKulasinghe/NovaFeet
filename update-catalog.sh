#!/bin/bash
# Quick script to regenerate catalog locally

echo "🔄 Regenerating product catalog..."
node scripts/generate-products.js

if [ $? -eq 0 ]; then
    echo "✅ Catalog updated successfully!"
    echo "📄 Check data/products.json"
else
    echo "❌ Error generating catalog"
fi
