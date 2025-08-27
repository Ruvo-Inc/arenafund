# Team Page Photo Placement Guide

## 📸 Where to Place Your Professional Photo

### **Current Placeholder Location**
The team page currently has a placeholder for your professional portrait photo. Here's exactly where to place it:

### **File Location**
Place your professional headshot in the `public` folder with this path:
```
public/team/mani-swaminathan.jpg
```

### **Recommended Photo Specifications**
- **Format**: JPG or PNG
- **Dimensions**: 800x800 pixels (square aspect ratio)
- **File Size**: Under 500KB for optimal loading
- **Style**: Professional headshot, business attire
- **Background**: Clean, neutral background preferred
- **Quality**: High resolution, well-lit, sharp focus

### **Code Update Required**
Once you place the photo, update this line in `src/app/team/page.tsx`:

**Current placeholder code (line ~155):**
```jsx
<div className="w-full aspect-square bg-arena-gold-light rounded-2xl flex items-center justify-center">
  <Users className="w-24 h-24 text-arena-gold" />
</div>
```

**Replace with:**
```jsx
<div className="w-full aspect-square rounded-2xl overflow-hidden">
  <img 
    src="/team/mani-swaminathan.jpg" 
    alt="Mani Swaminathan, Founder & Managing Partner of Arena Fund"
    className="w-full h-full object-cover"
  />
</div>
```

### **Alternative: Next.js Image Component (Recommended)**
For better performance, use Next.js Image component:

```jsx
import Image from 'next/image';

// Then replace the placeholder with:
<div className="w-full aspect-square rounded-2xl overflow-hidden">
  <Image 
    src="/team/mani-swaminathan.jpg" 
    alt="Mani Swaminathan, Founder & Managing Partner of Arena Fund"
    width={400}
    height={400}
    className="w-full h-full object-cover"
    priority
  />
</div>
```

### **Photo Style Guidelines**
Based on top VC firm standards (Benchmark, Sequoia, a16z):

1. **Professional but approachable**: Business attire, confident expression
2. **Clean composition**: Minimal background distractions
3. **Good lighting**: Even, professional lighting
4. **Sharp focus**: Crystal clear image quality
5. **Consistent branding**: Matches the professional tone of Arena Fund

### **Backup Options**
If you don't have a professional photo ready:
1. **Keep placeholder**: The current design works well as-is
2. **Temporary photo**: Use any professional headshot you have
3. **Professional shoot**: Consider hiring a photographer for best results

### **File Naming Convention**
- Primary: `mani-swaminathan.jpg`
- Backup formats: `mani-swaminathan.png` or `mani-swaminathan.webp`

### **Testing**
After adding the photo:
1. Place file in `public/team/` folder
2. Update the code as shown above
3. Visit `http://localhost:3001/team` to see the result
4. Check mobile responsiveness

The photo will be displayed in a perfect square format with rounded corners, matching the professional aesthetic of the page.