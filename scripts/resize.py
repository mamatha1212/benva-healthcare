from PIL import Image

def resize_icon(input_path, output_path, size):
    img = Image.open(input_path)
    img = img.resize(size, Image.Resampling.LANCZOS)
    img.save(output_path)

if __name__ == "__main__":
    input_file = "src/app/icon.png"
    resize_icon(input_file, "public/icon-192x192.png", (192, 192))
    resize_icon(input_file, "public/icon-512x512.png", (512, 512))
    print("Icons resized successfully!")
