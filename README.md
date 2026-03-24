# Nova Feet - Stylish & Affordable Shoes NZ

**Slogan:** Step into Power  
**Brand Colors:** Black (#05060b) & Gold (#c9902c)

A modern, professional static business website for Nova Feet shoe brand. Features a dynamic product catalog that automatically updates based on images uploaded to GitHub repository folders.

**Live Site:** https://[your-username].github.io/NovaFeet

---

## 🌟 Features

- **Premium black and gold design** with modern aesthetics
- **Single-page modern design** with smooth scrolling navigation
- **Dynamic product catalog** with category filtering and search
- **Multi-image carousel** - showcase products from different angles
- **Product detail modal** - click any product to see full details
- **Product information system** - add descriptions, sizes, and notes via text files
- **Automatic product generation** from image files via GitHub Actions
- **Fully responsive** mobile-first design
- **No frameworks** - pure HTML, CSS, and JavaScript
- **GitHub Pages compatible** - works out of the box
- **SEO optimized** with meta tags and Open Graph
- **Integrated logo** throughout the site

---

## 📁 Project Structure

```
NovaFeet/
├── index.html                 # Main website file
├── Logo/
│   └── Logo.png              # Brand logo (black & gold)
├── assets/
│   ├── css/
│   │   └── style.css         # All styles (black & gold theme)
│   └── js/
│       └── app.js            # Catalog logic & interactions
├── catalog/                   # Product images organized by category
│   ├── mens/
│   ├── womens/
│   ├── kids/
│   └── sports/
├── data/
│   └── products.json         # Auto-generated product data
├── scripts/
│   └── generate-products.js  # Node script to generate catalog
├── .github/
│   └── workflows/
│       └── generate-catalog.yml  # GitHub Actions workflow
└── README.md
```

---

## 🚀 Quick Start

### 1. Clone or Download

```bash
git clone https://github.com/[your-username]/NovaFeet.git
cd NovaFeet
```

### 2. Add Product Images

Place product images in the appropriate category folder inside `/catalog`:

```
catalog/
  ├── mens/
  ├── womens/
  ├── kids/
  └── sports/
```

### 3. Follow Naming Convention

**Single Image Format:** `brand--shoe-name--price.jpg`

**Multi-Image Format:** `brand--shoe-name--price--view.jpg`

**Single Image Examples:**
- `nike--air-max-270--129.99.jpg`
- `adidas--ultraboost--189.99.jpg`
- `puma--suede-classic--99.99.png`

**Multi-Image Examples (same product, different angles):**
- `nike--air-max-270--129.99--main.jpg` (primary image)
- `nike--air-max-270--129.99--side.jpg`
- `nike--air-max-270--129.99--back.jpg`
- `nike--air-max-270--129.99--detail.jpg`

**Rules:**
- Use **double hyphens** (`--`) as delimiters
- Use **single hyphens** (`-`) or **underscores** (`_`) within names
- View identifier is **optional** (main, side, back, detail, top, etc.)
- Images with same brand-name-price are grouped together
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
- Price must be a valid number
- First image or image with `--main` becomes the primary display

**Features:**
- ✨ **Click image** or **dots** to cycle through views
- 🔄 **Auto-play on hover** - images rotate automatically
- 📸 Multiple angles showcase your products better
- Use **double hyphens** (`--`) as delimiters
- Use **single hyphens** (`-`) or **underscores** (`_`) within names
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
- Price must be a valid number

**More Examples:**
```
nike--air-jordan-1--159.99.jpg
new-balance--990v5--179.99.jpg
under_armour--curry-flow-9--199.99.jpg
```

### 4. Add Product Details (Optional)

Add a text file with the **same name** as your product images to include description, sizes, and notes.

**File Format:** `brand--shoe-name--price.txt`

**Example:** `nike--air-max-270--129.99.txt`

**Content Structure:**
```
DESCRIPTION
Premium running shoes with Air Max technology. Lightweight and comfortable for all-day wear. Perfect for daily training and casual style.

SIZES
7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12

NOTES
Limited stock available
Free shipping on orders over $150
30-day return policy
Genuine leather upper
Memory foam insole
```

**Rules:**
- Use section headers: `DESCRIPTION`, `SIZES`, `NOTES`
- Sizes should be comma-separated
- Each note goes on a new line
- Details file is **optional** - products work fine without it
- File must match product name exactly

**What happens:**
- 🖱️ **Click any product** to open detailed view
- 🖼️ See all product images in gallery
- 📝 View full description, available sizes, and product notes
- 📸 Switch between different angles
- ✓ Clean, professional product showcase

### 5. Push to GitHub

```bash
git add .
git commit -m "Add product images"
git push origin main
```

The GitHub Action will automatically:
- Scan all catalog folders
- Parse filenames
- Generate `data/products.json`
- Commit the updated file

---

## 🤖 How the Auto-Catalog System Works

### 1. Image Upload
You upload product images to `/catalog/[category]/` folders with the naming format:
```
brand--shoe-name--price.extension
```

### 2. GitHub Action Trigger
When you push to the `main` branch, the GitHub Action workflow runs automatically.

### 3. Script Execution
The Node.js script (`scripts/generate-products.js`):
- Scans all category folders
- Reads image filenames
- Extracts: brand, name, price
- Converts text to Title Case
- Validates data
- Generates structured JSON

### 4. JSON Output
Creates/updates `data/products.json`:
```json
[
  {
    "id": "mens-nike-air-max-270-129.99",
    "category": "mens",
    "brand": "Nike",
    "name": "Air Max 270",
    "price": 129.99,
    "currency": "NZD",
    "image": "catalog/mens/nike--air-max-270--129.99.jpg"
  }
]
```

### 5. Auto-Commit
The workflow automatically commits `products.json` back to the repository.

### 6. Website Update
The website fetches the updated JSON and displays new products instantly.

---

## 🛠️ Adding a New Category

1. Create a new folder in `/catalog`:
   ```bash
   mkdir catalog/sneakers
   ```

2. Add product images following the naming convention:
   ```
   catalog/sneakers/nike--blazer-mid--119.99.jpg
   ```

3. Push to GitHub:
   ```bash
   git add catalog/sneakers
   git commit -m "Add sneakers category"
   git push
   ```

The category will automatically appear in the filter buttons on the website!

---

## 📤 Deployment to GitHub Pages

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[your-username]/NovaFeet.git
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

### Step 3: Wait for Deployment
GitHub will build and deploy your site. This takes 1-3 minutes.

### Step 4: Access Your Site
Your site will be available at:
```
https://[your-username].github.io/NovaFeet
```

---

## 🎨 Customization

### Change Colors

The site uses a black and gold color scheme. To modify, edit `assets/css/style.css` and update the CSS variables:

```css
:root {
    --primary-color: #c9902c;     /* Main gold color */
    --gold: #c9902c;              /* Brand gold */
    --black: #05060b;             /* Brand black */
    --text-dark: #05060b;         /* Dark text */
    --text-light: #6b7280;        /* Light text */
}
```

### Update Contact Information
Edit `index.html` and update the contact section:

```html
<a href="mailto:your-email@example.com">your-email@example.com</a>
<a href="tel:1234567890">123 456 7890</a>
```

### Modify Brand Story
Edit the About section in `index.html`:

```html
<section id="about" class="about">
  <!-- Update the text here -->
</section>
```

---

## 🧪 Testing Locally

### Option 1: Simple HTTP Server (Python)
```bash
python3 -m http.server 8000
```
Visit: `http://localhost:8000`

### Option 2: Node.js HTTP Server
```bash
npx http-server
```

### Option 3: VS Code Live Server
Install "Live Server" extension and click "Go Live" in bottom right.

---

## 🔧 Manual Product Generation

If you want to test the product generation script locally:

```bash
node scripts/generate-products.js
```

This will scan `/catalog` and update `data/products.json`.

---

## 📋 Filename Examples Reference

### Single Image Products

| Correct ✅ | Incorrect ❌ |
|-----------|-------------|
| `nike--air-max--129.99.jpg` | `nike-air-max-129.99.jpg` (single hyphens) |
| `adidas--ultra_boost--189.99.png` | `adidas--ultra boost--189.99.jpg` (spaces) |
| `puma--suede-classic--99.99.webp` | `puma--suede-classic--99.jpg` (no price) |
| `new-balance--990v5--179.99.jpg` | `new balance--990v5--179.99.jpg` (space in brand) |

### Multi-Image Products (Multiple Angles)

| Correct ✅ | Incorrect ❌ |
|-----------|-------------|
| `nike--air-max--129.99--main.jpg` | `nike--air-max--129.99-main.jpg` (single hyphen) |
| `nike--air-max--129.99--side.jpg` | `nike--air-max--129.99.side.jpg` (dot separator) |
| `nike--air-max--129.99--back.png` | `nike air max 129.99 back.png` (spaces) |
| `adidas--boost--189.99--detail.jpg` | `adidas--boost--189.99--detail--photo.jpg` (too many parts) |

**Note:** All images with the same `brand--name--price` will be grouped as one product with image carousel.

---

## �️ Image Optimization for Faster Loading

Your website includes lazy loading and shimmer effects, but optimizing images before upload is crucial for performance:

### **Recommended Image Specifications**

- **Format:** WebP (best compression) or JPEG (widely supported)
- **Dimensions:** 800x800px to 1200x1200px (product images)
- **File size:** Under 200KB per image (ideally 50-150KB)
- **Quality:** 75-85% compression (good balance)

### **Quick Optimization Tools**

**Online Tools (Free):**
1. **TinyPNG** - https://tinypng.com/
   - Drag & drop images
   - Compresses without visible quality loss
   - Supports PNG and JPEG

2. **Squoosh** - https://squoosh.app/
   - Google's image optimizer
   - Real-time preview
   - Convert to WebP format

3. **ImageOptim** (Mac) - https://imageoptim.com/
   - Desktop app
   - Batch processing
   - Lossless compression

**Command Line (Bulk Processing):**

```bash
# Install ImageMagick (Mac)
brew install imagemagick

# Optimize all images in a folder
for img in *.{jpg,png}; do
  convert "$img" -resize 1000x1000\> -quality 80 "optimized-$img"
done

# Convert to WebP
for img in *.jpg; do
  cwebp -q 80 "$img" -o "${img%.jpg}.webp"
done
```

### **Before Uploading Checklist**

- ✅ Resize to appropriate dimensions (800-1200px)
- ✅ Compress to under 200KB
- ✅ Remove metadata (EXIF data)
- ✅ Use descriptive filenames following naming convention
- ✅ Test on slow connection

### **Performance Features Already Built-In**

Your site automatically includes:
- ✨ **Lazy loading** - Images load as they come into viewport
- 📊 **Shimmer placeholders** - Animated loading skeleton
- 🔄 **Smooth transitions** - Fade-in effect when loaded
- 📱 **Responsive images** - Optimized display on all devices

### **Monitoring Performance**

Test your site speed:
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **GTmetrix:** https://gtmetrix.com/
- Target: < 3 seconds load time on 4G

---

## �🐛 Troubleshooting

### Products not showing?
1. Check browser console for errors (F12)
2. Verify `data/products.json` exists and is valid JSON
3. Check image paths are correct
4. Ensure images follow naming convention

### GitHub Action not running?
1. Go to **Actions** tab in GitHub
2. Check if workflow exists
3. Manually trigger: Actions → "Generate Product Catalog" → "Run workflow"
4. Check workflow logs for errors

### Images not displaying?
1. Verify image files exist in catalog folders
2. Check file extensions are lowercase
3. Use relative paths (no leading `/`)
4. Test image URLs in browser

---

## 📝 License

This project is open source and available for personal and commercial use.

---

## 💬 Contact

**Nova Feet**
- Email: Novafeetnz@gmail.com
- Phone: 022 432 0269
- WhatsApp: [Message us](https://wa.me/640224320269)

---

## 🎯 Key Technologies

- HTML5
- CSS3 (Flexbox, Grid, Custom Properties)
- Vanilla JavaScript (ES6+)
- GitHub Actions
- Node.js (for script only)
- GitHub Pages

---

**Built with ❤️ for Nova Feet**
