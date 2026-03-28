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
                        
                        // Check for details file
                        // Try both formats: brand--name--price.txt and brand--price.txt
                        const brandSlug = productImage.brand.toLowerCase().replace(/\s+/g, '-');
                        const nameSlug = (productImage.name && productImage.name !== productImage.brand) 
                            ? `--${productImage.name.toLowerCase().replace(/\s+/g, '-')}` 
                            : '';
                        const priceSlug = productImage.price.toFixed(2);
                        
                        const detailsFiles = [
                            `${brandSlug}${nameSlug}--${priceSlug}.txt`,
                            `${brandSlug}--${priceSlug}.txt`
                        ];
                        
                        let detailsPath = null;
                        for (const df of detailsFiles) {
                            // Find file case-insensitively in the original files list
                            const actualFile = files.find(f => f.toLowerCase() === df.toLowerCase());
                            if (actualFile) {
                                detailsPath = path.join(categoryPath, actualFile);
                                console.log(`   Found description: ${actualFile}`);
                                break;
                            }
                        }
                        
                        if (detailsPath) {
                            const details = parseProductDetails(detailsPath);
                            if (details) {
                                product.description = details.description;
                                product.sizes = details.sizes;
                                product.notes = details.notes;
                                console.log(`   ✓ Loaded product details`);
                            }
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
        
        let brand, name, priceStr, view;

        // Support various formats by checking where the price is
        // Format A: brand--name--price--view (4 parts)
        // Format B: brand--name--price (3 parts)
        // Format C: brand--price--view (3 parts) - where parts[1] is a number
        // Format D: brand--price (2 parts)

        if (parts.length === 4) {
            brand = parts[0];
            name = parts[1];
            priceStr = parts[2];
            view = parts[3];
        } else if (parts.length === 3) {
            // Check if middle part is a number (Format C: brand--price--view)
            const middleAsPrice = parseFloat(parts[1]);
            if (!isNaN(middleAsPrice) && parts[1].includes('.')) {
                brand = parts[0];
                name = '';
                priceStr = parts[1];
                view = parts[2];
            } else {
                // Format B: brand--name--price
                brand = parts[0];
                name = parts[1];
                priceStr = parts[2];
                view = 'default';
            }
        } else if (parts.length === 2) {
            brand = parts[0];
            name = '';
            priceStr = parts[1];
            view = 'default';
        } else {
            console.warn(`⚠️  Invalid format: ${filename} (expected: brand--[name]--price[--view].ext)`);
            return null;
        }
        
        // Validate price
        const price = parseFloat(priceStr);
        if (isNaN(price) || price <= 0) {
            console.warn(`⚠️  Invalid price "${priceStr}" in: ${filename}`);
            return null;
        }
        
        // Convert to title case
        const brandFormatted = toTitleCase(brand);
        const nameFormatted = name ? toTitleCase(name) : '';
        
        // Generate unique product key (without view) for grouping
        // If name is empty, don't include extra hyphens
        const nameSlug = name ? `-${name.toLowerCase().replace(/\s+/g, '-')}` : '';
        const productKey = `${category}-${brand.toLowerCase().replace(/\s+/g, '-')}${nameSlug}-${price.toFixed(2)}`.replace(/-+/g, '-');
        
        // Generate unique ID
        const id = productKey;
        
        // Get relative image path
        const imagePath = `catalog/${category}/${filename}`;
        
        return {
            id,
            productKey,
            category,
            brand: brandFormatted,
            name: nameFormatted || brandFormatted, // Use brand as name if name is empty
            price,
            currency: 'NZD',
            imagePath,
            view: view.toLowerCase()
        };
        
    } catch (err) {
        console.error(`❌ Error parsing ${filename}:`, err.message);
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
