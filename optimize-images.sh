#!/bin/bash
# Optional: Image optimization script for Nova Feet
# Requires ImageMagick (brew install imagemagick on Mac)

echo "🖼️  Nova Feet Image Optimizer"
echo "================================"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found!"
    echo "Install with: brew install imagemagick (Mac)"
    echo "or: sudo apt-get install imagemagick (Linux)"
    exit 1
fi

# Create optimized directory
mkdir -p catalog-optimized

# Process all images
count=0
for category in catalog/*/; do
    category_name=$(basename "$category")
    mkdir -p "catalog-optimized/$category_name"
    
    echo ""
    echo "📁 Processing $category_name..."
    
    for img in "$category"*.{jpg,jpeg,png,webp} 2>/dev/null; do
        [ -e "$img" ] || continue
        
        filename=$(basename "$img")
        output="catalog-optimized/$category_name/$filename"
        
        # Skip .txt files and .gitkeep
        if [[ "$filename" == *.txt ]] || [[ "$filename" == .gitkeep ]]; then
            continue
        fi
        
        # Get original size
        original_size=$(wc -c < "$img" | xargs)
        original_kb=$((original_size / 1024))
        
        # Optimize: resize to max 1200px, quality 80%, strip metadata
        convert "$img" \
            -resize 1200x1200\> \
            -quality 80 \
            -strip \
            "$output" 2>/dev/null
        
        # Get optimized size
        optimized_size=$(wc -c < "$output" | xargs)
        optimized_kb=$((optimized_size / 1024))
        
        # Calculate savings
        saved_kb=$((original_kb - optimized_kb))
        percent=$((saved_kb * 100 / original_kb))
        
        echo "  ✓ $filename: ${original_kb}KB → ${optimized_kb}KB (saved ${percent}%)"
        ((count++))
    done
done

echo ""
echo "================================"
echo "✨ Optimized $count images!"
echo "📁 Check: catalog-optimized/"
echo ""
echo "Next steps:"
echo "1. Review optimized images"
echo "2. Replace originals: rm -rf catalog/* && mv catalog-optimized/* catalog/"
echo "3. Run: ./update-catalog.sh"
