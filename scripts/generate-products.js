const fs = require('fs');
const path = require('path');

// ===========================
// CONFIGURATION
// ===========================

const CATALOG_DIR = path.join(__dirname, '..', 'catalog');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'products.json');
const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// ===========================
// MAIN FUNCTION
// ===========================

function generateProductCatalog() {
    console.log('🚀 Starting product catalog generation...');

    if (!fs.existsSync(CATALOG_DIR)) {
        console.error(`❌ Catalog directory not found: ${CATALOG_DIR}`);
        process.exit(1);
    }

    const productMap = new Map(); // Group images by product
    const categories = fs.readdirSync(CATALOG_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    console.log(`📁 Found ${categories.length} categories: ${categories.join(', ')}`);

    categories.forEach(category => {
        const categoryPath = path.join(CATALOG_DIR, category);
        const files = fs.readdirSync(categoryPath);

        files.forEach(file => {
            const ext = path.extname(file).toLowerCase();

            if (VALID_EXTENSIONS.includes(ext)) {
                const productImage = parseProductFromFilename(file, category);

                if (productImage) {
                    const productKey = productImage.productKey;

                    if (productMap.has(productKey)) {
                        // Add image to existing product
                        const existing = productMap.get(productKey);
                        existing.images.push(productImage.imagePath);

                        // Update primary if this is a "main" view
                        if (productImage.view === 'main' && existing.primaryImage !== productImage.imagePath) {
                            existing.primaryImage = productImage.imagePath;
                        }
                    } else {
                        // Create new product entry
                        const product = {
                            id: productImage.id,
                            category: productImage.category,
                            brand: productImage.brand,
                            name: productImage.name,
                            price: productImage.price,
                            currency: productImage.currency,
                            images: [productImage.imagePath],
                            primaryImage: productImage.imagePath
                        };

                        // Check for details file (try multiple naming formats)
                        const brand_normalized = productImage.brand.toLowerCase().replace(/\s+/g, '-');
                        const name_normalized = productImage.name.toLowerCase().replace(/\s+/g, '-');
                        const price_int = Math.floor(productImage.price);
                        const price_decimal = productImage.price.toFixed(2);
                        
                        // Try different filename formats with both price formats
                        const possibleDetailsFiles = [
                            `${brand_normalized}--${name_normalized}--${price_decimal}.txt`,  // brand--name--120.00.txt
                            `${brand_normalized}--${name_normalized}--${price_int}.txt`,      // brand--name--120.txt
                            `${brand_normalized}--${price_decimal}.txt`,                       // brand--120.00.txt (when brand === name)
                            `${brand_normalized}--${price_int}.txt`,                           // brand--120.txt
                        ];
                        
                        let detailsLoaded = false;
                        for (const detailsFile of possibleDetailsFiles) {
                            const detailsPath = path.join(categoryPath, detailsFile);
                            
                            if (fs.existsSync(detailsPath)) {
                                console.log(`   ✓ Found details: ${detailsFile}`);
                                const details = parseProductDetails(detailsPath);
                                if (details) {
                                    product.description = details.description;
                                    product.sizes = details.sizes;
                                    product.notes = details.notes;
                                    detailsLoaded = true;
                                    break;
                                }
                            }
                        }
                        
                        if (!detailsLoaded) {
                            console.log(`   ⚠️  No details file found for ${brand_normalized}`);
                        }

                        productMap.set(productKey, product);
                    }
                } else {
                    console.warn(`⚠️  Skipped invalid file: ${file}`);
                }
            }
        });
    });

    // Convert map to array
    const products = Array.from(productMap.values());

    // Log results
    products.forEach(product => {
        const imageCount = product.images.length;
        const indicator = imageCount > 1 ? `📸 ${imageCount} images` : '🖼️  1 image';
        console.log(`✅ ${product.brand} - ${product.name} (${product.category}) ${indicator}`);
    });

    // Ensure data directory exists
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write products.json
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2), 'utf-8');

    console.log(`\n✨ Successfully generated ${products.length} products`);
    console.log(`📄 Output: ${OUTPUT_FILE}`);
}

// ===========================
// PARSE PRODUCT FROM FILENAME
// ===========================

function parseProductFromFilename(filename, category) {
    try {
        // Remove file extension
        const nameWithoutExt = path.parse(filename).name;

        // Split by delimiter '--'
        const parts = nameWithoutExt.split('--');

        // Support multiple formats:
        // brand--price--view.ext (3 parts) - using brand as name
        // brand--name--price--view.ext (4 parts)
        // brand--name--price.ext (3 parts, no view)
        
        let brand, name, priceStr, view;
        
        if (parts.length === 3) {
            // Check if second part is a price (format: brand--price--view)
            const secondPartAsPrice = parseFloat(parts[1]);
            if (!isNaN(secondPartAsPrice) && secondPartAsPrice > 0) {
                // Format: brand--price--view
                brand = parts[0];
                name = parts[0]; // Use brand as name
                priceStr = parts[1];
                view = parts[2] || 'default';
            } else {
                // Format: brand--name--price
                brand = parts[0];
                name = parts[1];
                priceStr = parts[2];
                view = 'default';
            }
        } else if (parts.length === 4) {
            // Format: brand--name--price--view
            brand = parts[0];
            name = parts[1];
            priceStr = parts[2];
            view = parts[3];
        } else {
            console.warn(`Invalid format: ${filename} (expected 3 or 4 parts)`);
            return null;
        }

        // Validate price
        const price = parseFloat(priceStr);
        if (isNaN(price) || price <= 0) {
            console.warn(`Invalid price in: ${filename}`);
            return null;
        }

        // Convert to title case
        const brandFormatted = toTitleCase(brand);
        const nameFormatted = toTitleCase(name);

        // Generate unique product key (without view) for grouping
        const productKey = `${category}-${brand}-${name}-${price}`.toLowerCase().replace(/\s+/g, '-');

        // Generate unique ID
        const id = productKey;

        // Get relative image path
        const imagePath = `catalog/${category}/${filename}`;

        return {
            id,
            productKey,
            category,
            brand: brandFormatted,
            name: nameFormatted,
            price,
            currency: 'NZD',
            imagePath,
            view: view.toLowerCase()
        };

    } catch (err) {
        console.error(`Error parsing ${filename}:`, err.message);
        return null;
    }
}

// ===========================
// UTILITY: TITLE CASE
// ===========================

function toTitleCase(str) {
    return str
        .replace(/-/g, ' ')  // Replace hyphens with spaces
        .replace(/_/g, ' ')  // Replace underscores with spaces
        .toLowerCase()
        .split(' ')
        .map(word => {
            // Handle special cases (optional)
            if (word.length === 0) return '';
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ')
        .trim();
}

// ===========================
// PARSE PRODUCT DETAILS FILE
// ===========================

function parseProductDetails(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const details = {
            description: '',
            sizes: [],
            notes: []
        };

        let currentSection = null;
        const lines = content.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();

            if (trimmed === 'DESCRIPTION') {
                currentSection = 'description';
            } else if (trimmed === 'SIZES') {
                currentSection = 'sizes';
            } else if (trimmed === 'NOTES') {
                currentSection = 'notes';
            } else if (trimmed && currentSection) {
                if (currentSection === 'description') {
                    details.description += (details.description ? ' ' : '') + trimmed;
                } else if (currentSection === 'sizes') {
                    // Parse comma-separated sizes
                    const sizes = trimmed.split(',').map(s => s.trim()).filter(s => s);
                    details.sizes.push(...sizes);
                } else if (currentSection === 'notes') {
                    details.notes.push(trimmed);
                }
            }
        });

        // Only return if we actually found content
        if (details.description || details.sizes.length > 0 || details.notes.length > 0) {
            return details;
        }
        return null;
    } catch (err) {
        console.warn(`⚠️  Could not read details file: ${filePath}`);
        return null;
    }
}

// ===========================
// RUN SCRIPT
// ===========================

try {
    generateProductCatalog();
} catch (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
}
