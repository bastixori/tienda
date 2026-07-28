import shutil
import os

brain_dir = r"C:\Users\xoriz\.gemini\antigravity\brain\73ac6651-8c4e-47f9-a8df-6d361e21ccb5"
public_assets = r"c:\Users\xoriz\Desktop\tienda\public\assets"
assets = r"c:\Users\xoriz\Desktop\tienda\assets"

os.makedirs(public_assets, exist_ok=True)
os.makedirs(assets, exist_ok=True)

mappings = {
    "charger_gan_1785207367676.jpg": "charger.jpg",
    "adapter_hub_1785207382679.jpg": "hub.jpg",
    "powerbank_fast_1785207395712.jpg": "powerbank.jpg"
}

for src_name, dest_name in mappings.items():
    src_path = os.path.join(brain_dir, src_name)
    if os.path.exists(src_path):
        shutil.copy(src_path, os.path.join(public_assets, dest_name))
        shutil.copy(src_path, os.path.join(assets, dest_name))
        print(f"Copied {src_name} to {dest_name}")
